import logging
import traceback
from typing import Optional, Tuple, Dict, Any

from flask import request, jsonify
from flask import session as flask_session
from googleapiclient.http import HttpError

from models import db, Resource, Question_Paper, Level, Subject, Resource_type
from filename_cleaner import build_clean_names
from drive_service import get_drive_service, get_or_create_folder

logger = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════════════════════════
# DRIVE OPERATION HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _fetch_current_parent(service, file_id: str) -> Optional[str]:
    """
    Fetches the file's current parent folder ID directly from the Drive API.
    Used as a fallback when gdrive_folder_id is NULL on the Resource row
    (pre-migration records that existed before that column was added).
    Returns the first parent ID found, or None on failure.
    """
    try:
        meta = service.files().get(
            fileId=file_id,
            fields="parents",
            supportsAllDrives=True
        ).execute()
        parents = meta.get("parents", [])
        return parents[0] if parents else None
    except HttpError as e:
        logger.warning(f"[Edit] Could not fetch current parents for {file_id}: {e}")
        return None


def _drive_rename_and_move(service, file_id: str, new_name: str,
                            new_folder_id: str,
                            old_folder_id: Optional[str]) -> bool:
    """
    Renames AND moves a Drive file in one atomic files.update() call.
    Avoids the race condition of a separate rename + move sequence.
    Returns True on success, False on failure — never raises.
    """
    try:
        kwargs: Dict[str, Any] = {
            "fileId":            file_id,
            "addParents":        new_folder_id,
            "body":              {"name": new_name},
            "fields":            "id, name, parents",
            "supportsAllDrives": True,
        }
        if old_folder_id:
            kwargs["removeParents"] = old_folder_id

        service.files().update(**kwargs).execute()
        logger.info(f"[Edit] ✅ Drive move+rename succeeded: '{new_name}'")
        return True
    except HttpError as e:
        logger.warning(f"[Edit] ⚠️  Drive move+rename failed for {file_id}: {e}")
        return False


def _drive_rename_only(service, file_id: str, new_name: str) -> bool:
    """
    Renames a Drive file without changing its folder.
    Returns True on success, False on failure — never raises.
    """
    try:
        service.files().update(
            fileId=file_id,
            body={"name": new_name},
            supportsAllDrives=True
        ).execute()
        logger.info(f"[Edit] ✅ Drive rename succeeded: '{new_name}'")
        return True
    except HttpError as e:
        logger.warning(f"[Edit] ⚠️  Drive rename failed for {file_id}: {e}")
        return False


# ══════════════════════════════════════════════════════════════════════════════
# ROUTE REGISTRATION
# Anti-circular pattern: routes are attached via a deferred registration
# block called explicitly from app.py — never imported at module level.
# ══════════════════════════════════════════════════════════════════════════════

def register_edit_route(library_bp):
    """
    Registers PUT /api/resources/<resource_id> on library_bp.
    Universal resource correction endpoint — applies to every resource on
    the platform regardless of current status (Approved, Needs_Review,
    Pending, Locked, Unlocked).

    Decision matrix:
      ┌─────────────────────────────────┬───────────────────────────────┐
      │ What changed                    │ Action                        │
      ├─────────────────────────────────┼───────────────────────────────┤
      │ level / subject / rtype /       │ get_or_create_folder on Drive │
      │ year / session                  │ move + rename file atomically │
      ├─────────────────────────────────┼───────────────────────────────┤
      │ paper_number only               │ rename file only (no move)    │
      ├─────────────────────────────────┼───────────────────────────────┤
      │ author / description / status   │ DB update only, Drive silent  │
      └─────────────────────────────────┴───────────────────────────────┘

    Status promotion rules:
      • Needs_Review + paper confirmed  → Approved, review_reason cleared
      • Needs_Review + non-paper        → Approved, review_reason cleared
      • Caller passes explicit status   → honoured as-is

    Title-follows-Drive guarantee:
      • Drive op succeeded              → title = new canonical name
      • Drive op failed                 → title unchanged, review_reason
                                          flagged so admin sees the drift
    """

    @library_bp.route("/api/resources/<int:resource_id>", methods=["PUT"])
    def update_resource(resource_id: int):

        if "user_id" not in flask_session:
            return jsonify({"message": "Unauthorized — please login"}), 401

        try:
            # ── Load existing resource ────────────────────────────────────
            resource = db.session.get(Resource, resource_id)
            if not resource:
                return jsonify({"message": "Resource not found"}), 404

            data = request.get_json()
            if not data:
                return jsonify({"message": "No data provided"}), 400

            # ── Resolve incoming IDs, falling back to current values so
            # partial updates work — caller only sends what changed ────────
            new_level_id = int(data.get("level_id",         resource.level_id))
            new_sub_id   = int(data.get("sub_id",           resource.sub_id))
            new_rtype_id = int(data.get("resource_type_id", resource.resource_type_id))

            old_meta = resource.exam_metadata  # may be None for non-paper rows

            new_year         = data.get("year",         old_meta.year         if old_meta else None)
            new_session      = data.get("session",      old_meta.session      if old_meta else None)
            new_paper_number = data.get("paper_number", old_meta.paper_number if old_meta else None)
            new_author       = data.get("author",       resource.author)

            # ── Validate referenced rows exist ───────────────────────────
            new_level   = db.session.get(Level,         new_level_id)
            new_subject = db.session.get(Subject,       new_sub_id)
            new_rtype   = db.session.get(Resource_type, new_rtype_id)

            if not new_level:
                return jsonify({"message": f"Level {new_level_id} not found"}), 400
            if not new_subject:
                return jsonify({"message": f"Subject {new_sub_id} not found"}), 400
            if not new_rtype:
                return jsonify({"message": f"Resource type {new_rtype_id} not found"}), 400

            level_name   = new_level.level_name
            subject_name = new_subject.subject_name
            rtype_name   = new_rtype.resource_name

            is_paper = rtype_name.lower() in {
                "question paper", "question papers",
                "marking scheme", "marking schemes"
            }
            is_marking_scheme = rtype_name.lower() in {
                "marking scheme", "marking schemes"
            }

            # ── Detect structural changes ─────────────────────────────────
            folder_changed = (
                new_level_id != resource.level_id or
                new_sub_id   != resource.sub_id   or
                new_rtype_id != resource.resource_type_id or
                new_year     != (old_meta.year    if old_meta else None) or
                new_session  != (old_meta.session if old_meta else None)
            )
            paper_number_changed = (
                is_paper and
                new_paper_number != (old_meta.paper_number if old_meta else None)
            )
            needs_drive_rename = folder_changed or paper_number_changed

            # ── Build new canonical name for paper-type resources ─────────
            names: Optional[Dict[str, str]] = None
            new_title = resource.title   # default: unchanged

            if is_paper and (needs_drive_rename or not old_meta):
                names = build_clean_names(
                    level_name, subject_name,
                    new_year, new_session,
                    new_paper_number,
                    is_marking_scheme=is_marking_scheme
                )
                if not names:
                    return jsonify({
                        "message": (
                            f"Could not build canonical name — "
                            f"check paper number '{new_paper_number}'"
                        )
                    }), 400
                new_title = names["title"]

            # ── Composite key duplicate check ─────────────────────────────
            # Only fires for QP resources (not MS — multiple MS per paper
            # are explicitly allowed) when structural fields actually changed.
            # Runs before any Drive operation so nothing moves if it fails.
            # Excludes the resource being edited from the match so self-edits
            # (e.g. fixing author only) never false-trigger.
            if is_paper and not is_marking_scheme and needs_drive_rename and names:
                duplicate = db.session.query(Resource).join(
                    Question_Paper,
                    Question_Paper.resource_id == Resource.resource_id
                ).filter(
                    Resource.resource_id      != resource_id,
                    Resource.level_id         == new_level_id,
                    Resource.sub_id           == new_sub_id,
                    Resource.resource_type_id == new_rtype_id,
                    Question_Paper.year         == new_year,
                    Question_Paper.session      == new_session,
                    Question_Paper.paper_number == names["paper_number"],
                ).first()
            
                if duplicate:
                    return jsonify({
                        "message": f"{names['title']} already exists",
                        "conflict": {
                            "resource_id": duplicate.resource_id,
                            "title":       duplicate.title,
                            "status":      duplicate.status,
                            "uploaded_at": duplicate.uploaded_at.isoformat() if duplicate.uploaded_at else None,
                            "file_size":   duplicate.file_size,
                        }
                    }), 400

            # ── Execute Drive operations BEFORE DB commit ─────────────────
            # This ensures we know whether Drive succeeded before deciding
            # what to write to Resource.title — title must always reflect
            # what the file is currently named on Drive, never an aspiration.
            drive_moved   = False
            drive_renamed = False

            if needs_drive_rename and resource.gdrive_file_id:
                service = get_drive_service()

                if folder_changed:
                    rtype_folder = (
                        rtype_name if rtype_name.lower().endswith("s")
                        else f"{rtype_name}s"
                    )
                    new_folder_id = get_or_create_folder(
                        service      = service,
                        Level        = level_name,
                        Subject      = subject_name,
                        ResourceType = rtype_folder,
                        Year         = new_year,
                        Sessions     = new_session
                    )
                    if not new_folder_id:
                        return jsonify({
                            "message": "Failed to create target Drive folder"
                        }), 500

                    # Resolve old parent — fall back to Drive API if NULL
                    old_folder_id = (
                        resource.gdrive_folder_id or
                        _fetch_current_parent(service, resource.gdrive_file_id)
                    )

                    drive_filename = (
                        names["drive_filename"] if (is_paper and names)
                        else f"{resource.title}.pdf"
                    )

                    ok = _drive_rename_and_move(
                        service,
                        resource.gdrive_file_id,
                        drive_filename,
                        new_folder_id,
                        old_folder_id
                    )
                    if ok:
                        drive_moved   = True
                        drive_renamed = True
                        resource.gdrive_folder_id    = new_folder_id
                        resource.gdrive_view_url     = (
                            f"https://drive.google.com/file/d/"
                            f"{resource.gdrive_file_id}/view?usp=sharing"
                        )
                        resource.gdrive_download_url = (
                            f"https://drive.google.com/uc?export=download"
                            f"&id={resource.gdrive_file_id}"
                        )
                    else:
                        logger.warning(
                            f"[Edit] Drive move failed for resource "
                            f"{resource_id} — DB updated, Drive not moved"
                        )

                elif paper_number_changed and names:
                    ok = _drive_rename_only(
                        service,
                        resource.gdrive_file_id,
                        names["drive_filename"]
                    )
                    if ok:
                        drive_renamed = True

            # ── Apply DB updates ──────────────────────────────────────────
            resource.level_id         = new_level_id
            resource.sub_id           = new_sub_id
            resource.resource_type_id = new_rtype_id
            resource.author           = new_author

            # Title follows Drive reality — must be resolved BEFORE
            # description is built so description references the correct
            # final title, not the stale pre-edit value.
            if not needs_drive_rename:
                # Pure metadata edit — no Drive op needed, safe to update
                resource.title = new_title
            elif drive_renamed:
                # Drive succeeded — title now matches Drive exactly
                resource.title = new_title
            else:
                # Drive failed — preserve old title so DB never lies about
                # what Drive currently shows. Flag the drift for admin.
                existing_reason = resource.review_reason or ""
                drift_note = "Drive rename/move failed — file still under original name on Drive"
                if drift_note not in existing_reason:
                    resource.review_reason = (
                        f"{existing_reason} | {drift_note}".strip(" |")
                    )

            # Description is always computed from confirmed fields — never
            # user-supplied, since it's a derived summary of structured data
            # the admin already controls through the dropdown fields.
            # Uses resource.title AFTER the title update above so it always
            # reflects the current Drive-reality name, not the pre-edit value.
            resource.description = (
                f"{resource.title} is a {level_name} {subject_name} "
                f"{rtype_name} written by {new_author}"
            )

            # ── Status promotion ──────────────────────────────────────────
            if "status" in data:
                resource.status = data["status"]
            elif resource.status in ("Needs_Review", "Pending"):
                if is_paper and new_paper_number:
                    resource.status        = "Approved"
                    resource.review_reason = None
                    resource.parser_confidence = "high"
                elif not is_paper:
                    resource.status        = "Approved"
                    resource.review_reason = None

            # ── Update or create Question_Paper row ───────────────────────
            if is_paper:
                confirmed_paper_number = (
                    names["paper_number"] if names else new_paper_number
                )
                if old_meta:
                    # Update in place — preserves paper_id and any downstream
                    # foreign key references elsewhere in the schema
                    old_meta.year         = new_year
                    old_meta.session      = new_session
                    old_meta.paper_number = confirmed_paper_number
                else:
                    # Needs_Review item that never had a Question_Paper row —
                    # create it now that the admin has confirmed all fields
                    db.session.add(Question_Paper(
                        resource_id  = resource.resource_id,
                        year         = new_year,
                        session      = new_session,
                        paper_number = confirmed_paper_number,
                    ))

            db.session.commit()
            logger.info(
                f"[Edit] Resource {resource_id} updated successfully "
                f"(drive_moved={drive_moved}, drive_renamed={drive_renamed})"
            )

            return jsonify({
                "message":       "Resource updated successfully",
                "resource_id":   resource.resource_id,
                "title":         resource.title,
                "status":        resource.status,
                "drive_moved":   drive_moved,
                "drive_renamed": drive_renamed,
            }), 200

        except Exception as err:
            db.session.rollback()
            logger.error(
                f"[Edit] ❌ update_resource error for {resource_id}: {err}\n"
                f"{traceback.format_exc()}"
            )
            return jsonify({"message": f"Server error: {err}"}), 500