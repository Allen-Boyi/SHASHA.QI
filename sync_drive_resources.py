import re
import time
from datetime import datetime, timedelta
from googleapiclient.http import HttpError
from flask import Blueprint, request, jsonify
from flask import session as flask_session
from models import (
    db, Resource, Resource_type, Level, Subject,
    Question_Paper, User, Sync_log
)
from config import Config
from drive_service import (
    get_drive_service, 
    delete_file_from_drive,
    normalize,
    find_structural_folder,
    create_structural_folder,
    build_live_drive_cache,       # Imported new fast cache tool
    fetch_all_recent_drive_pdfs   # Imported new fast flat finder
)
from filename_cleaner import clean_and_parse_filename


# ──────────────────────────────────────────────────────────────────────────────
# HELPER 2 — In-Memory Path Reconstruction Helper
# ──────────────────────────────────────────────────────────────────────────────
def resolve_path_from_cache(immediate_parent_id: str, drive_map: dict, root_folder_id: str) -> list:
    """
    Traces parent IDs upwards inside system RAM to build a structural path 
    array identical to the old recursive walker, but in milliseconds.
    """
    path_segments = []
    current_id = immediate_parent_id
    
    while current_id and current_id != root_folder_id:
        folder_info = drive_map.get(current_id)
        if not folder_info:
            break  # Folder outside scope or orphaned
        
        path_segments.append(folder_info['name'])
        current_id = folder_info['parent_id']
        
    # Reverse to get top-down ordering: [Level, Subject, ResourceType, Year, Session]
    path_segments.reverse()
    return path_segments


# ──────────────────────────────────────────────────────────────────────────────
# HELPER 3 — Classify path into structured metadata dict
# ──────────────────────────────────────────────────────────────────────────────
PAPER_TYPES = {"question paper", "marking scheme"}

def classify_path(path: list, types_cache: dict) -> tuple:
    if len(path) < 3:
        return None, f"path too short ({len(path)} segments — need at least 3)"

    level_name   = path[0]
    subject_name = path[1]

    resource_type_name = None
    type_index         = None
    for i in range(2, len(path)):
        if normalize(path[i]) in types_cache:
            resource_type_name = path[i]
            type_index = i
            break

    if resource_type_name is None:
        return None, f"no recognizable resource type in path: {path}"

    norm_type = normalize(resource_type_name)

    if norm_type in PAPER_TYPES:
        remaining = path[type_index + 1:]
        if len(remaining) < 2:
            return None, f"paper type missing year/session folders: {path}"
        year    = remaining[0]
        session = remaining[1]
        return {
            "level":         level_name,
            "subject":       subject_name,
            "resource_type": resource_type_name,
            "year":          year,
            "session":       session,
        }, None

    return {
        "level":         level_name,
        "subject":       subject_name,
        "resource_type": resource_type_name,
        "year":          None,
        "session":       None,
    }, None


# ──────────────────────────────────────────────────────────────────────────────
# HELPER 4 — Map path names → database IDs using caches
# ──────────────────────────────────────────────────────────────────────────────
def resolve_path_to_ids(parsed: dict, levels_cache: dict,
                        subjects_cache: dict, types_cache: dict) -> tuple:
    
    level_id = levels_cache.get(parsed["level"].strip().lower())
    if not level_id:
        return None, f"unknown level: '{parsed['level']}'"

    sub_id = subjects_cache.get((level_id, parsed["subject"].strip().lower()))
    if not sub_id:
        return None, f"unknown subject '{parsed['subject']}' under level '{parsed['level']}'"

    resource_type_id = types_cache.get(normalize(parsed["resource_type"]))
    if not resource_type_id:
        return None, f"unknown resource type: '{parsed['resource_type']}'"

    return {
        "level_id":         level_id,
        "sub_id":           sub_id,
        "resource_type_id": resource_type_id,
    }, None

# ──────────────────────────────────────────────────────────────────────────────
# HELPER 5 — Resolve the Drive uploader email → users.user_id
# ──────────────────────────────────────────────────────────────────────────────
def resolve_uploader(file_dict: dict) -> int | None:
    email = (file_dict.get("lastModifyingUser") or {}).get("emailAddress")
    if not email:
        return None
    user = db.session.query(User).filter_by(email=email).first()
    return user.user_id if user else None


# ──────────────────────────────────────────────────────────────────────────────
# HELPER 6 — Make a Drive file publicly readable
# ──────────────────────────────────────────────────────────────────────────────
def make_file_public(service, file_id: str):
    try:
        service.permissions().create(
            fileId=file_id,
            body={"type": "anyone", "role": "reader"},
            supportsAllDrives=True
        ).execute()
    except HttpError as e:
        print(f"Warning: could not make file {file_id} public: {e}")


# ──────────────────────────────────────────────────────────────────────────────
# HELPER 7 — Build Google Drive URLs from file_id
# ──────────────────────────────────────────────────────────────────────────────
def build_drive_urls(file_id: str) -> tuple:
    view_url     = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    return view_url, download_url


# ──────────────────────────────────────────────────────────────────────────────
# HELPER 8 — Rename the actual Drive file to the clean platform convention.
# ──────────────────────────────────────────────────────────────────────────────
def rename_drive_file(service, file_id: str, new_name: str) -> bool:
    try:
        service.files().update(
            fileId=file_id,
            body={"name": new_name},
            supportsAllDrives=True,
        ).execute()
        return True
    except HttpError as e:
        print(f"[Sync] Warning: could not rename Drive file {file_id} -> '{new_name}': {e}")
        return False


# ──────────────────────────────────────────────────────────────────────────────
# HELPER 9 — Build the file_size string once
# ──────────────────────────────────────────────────────────────────────────────
def format_file_size(raw_bytes) -> str | None:
    if not raw_bytes:
        return None
    return f"{round(int(raw_bytes) / (1024 * 1024), 2)} MB"


# ──────────────────────────────────────────────────────────────────────────────
# HELPER 10 — Build a Resource (+ Question_Paper) row for a paper-type file
# ──────────────────────────────────────────────────────────────────────────────
def build_paper_resource(file: dict, parsed: dict, parent_folder_id: str,
                          ids: dict, service, pre_parsed: dict = None) -> tuple:
    file_id   = file['id']
    file_name = file['name']

    folder_metadata = {
        "subject_name":      parsed["subject"],
        "level_name":        parsed["level"],
        "session":           parsed.get("session") or "June",
        "year":              parsed.get("year") or "YYYY",
        "is_marking_scheme": normalize(parsed["resource_type"]) == "marking scheme",
    }

    result = pre_parsed if pre_parsed is not None else clean_and_parse_filename(file_name, folder_metadata)

    make_file_public(service, file_id)
    view_url, download_url = build_drive_urls(file_id)
    uploaded_by = resolve_uploader(file)
    file_size = format_file_size(file.get('size'))

    if result["status"] == "needs_review":
        new_resource = Resource(
            title               = file_name,
            sub_id              = ids["sub_id"],
            level_id            = ids["level_id"],
            resource_type_id    = ids["resource_type_id"],
            gdrive_file_id      = file_id,
            gdrive_folder_id    = parent_folder_id,
            gdrive_view_url     = view_url,
            gdrive_download_url = download_url,
            file_size           = file_size,
            file_type           = "PDF",
            author              = "Unknown",
            description         = f"{parsed['level']} {parsed['subject']} {parsed['resource_type']}",
            uploaded_by         = uploaded_by,
            status              = "Needs_Review",
            review_reason       = result["reason"],
            parser_confidence   = None,
        )
        db.session.add(new_resource)
        db.session.flush()
        return new_resource, result

    is_high_confidence = result["confidence"] == "high"

    description = f"{result['title']} — {parsed['level']} {parsed['subject']} {parsed['resource_type']}"
    if parsed.get("year"):
        description += f" ({parsed['year']} {parsed['session']})"

    renamed_ok = False
    if is_high_confidence:
        renamed_ok = rename_drive_file(service, file_id, result["drive_filename"])

    if is_high_confidence and renamed_ok:
        title         = result["drive_filename"]
        status        = "Approved"
        review_reason = None
    elif is_high_confidence and not renamed_ok:
        title         = file_name
        status        = "Approved"
        review_reason = "Drive rename failed — file still under its original name; retry rename"
    else:
        title         = file_name
        status        = "Needs_Review"
        review_reason = "Low confidence paper-number match — please verify before approving"

    new_resource = Resource(
        title               = title,
        sub_id              = ids["sub_id"],
        level_id            = ids["level_id"],
        resource_type_id    = ids["resource_type_id"],
        gdrive_file_id      = file_id,
        gdrive_folder_id    = parent_folder_id,
        gdrive_view_url     = view_url,
        gdrive_download_url = download_url,
        file_size           = file_size,
        file_type           = "PDF",
        author              = "Unknown",
        description         = description,
        uploaded_by         = uploaded_by,
        status              = status,
        review_reason       = review_reason,
        parser_confidence   = result["confidence"],
    )
    db.session.add(new_resource)
    db.session.flush()

    db.session.add(Question_Paper(
        resource_id  = new_resource.resource_id,
        year         = parsed.get("year"),
        session      = parsed.get("session"),
        paper_number = result["paper_number"],
    ))

    return new_resource, result


# ──────────────────────────────────────────────────────────────────────────────
# MAIN ROUTE — POST /api/resources/sync_drive_resources
# ──────────────────────────────────────────────────────────────────────────────
def register_sync_route(library_bp):
    @library_bp.route('/api/resources/sync_drive_resources', methods=['POST'])
    def sync_drive_resources():

        logged_in_user_id = flask_session.get("user_id")
        if not logged_in_user_id:
            return jsonify({"message": "Unauthorized — please login"}), 401

        try:
            service = get_drive_service()
            ROOT_ID = Config.GDRIVE_ROOT_FOLDER_ID

            # Build static database metadata caches
            levels_cache = {
                l.level_name.strip().lower(): l.level_id
                for l in db.session.query(Level).all()
            }
            subjects_cache = {
                (s.level_id, s.subject_name.strip().lower()): s.sub_id
                for s in db.session.query(Subject).all()
            }
            types_cache = {
                normalize(r.resource_name): r.resource_type_id
                for r in db.session.query(Resource_type).all()
            }

            # Bulk fetch existing file IDs into RAM
            existing_gdrive_ids = set(
                [r[0] for r in db.session.query(Resource.gdrive_file_id).all()]
            )

            synced                  = 0
            skipped                 = 0
            failed                  = 0
            needs_review            = 0
            unmatched               = []
            marking_scheme_queue    = []

            # ⚡ STEP 1: Fast Bulk-load the folder structure index into local RAM (~2 seconds)
            drive_map = build_live_drive_cache(service)
            
            # ⚡ STEP 2: Fast Bulk-load all PDFs globally using Drive's flat search engine (~1-2 seconds)
            print(f"[Sync] Interrogating flat file system index below root context...")
            raw_pdf_list = fetch_all_recent_drive_pdfs(service)
            
            print(f"[Sync] Flattened index identified {len(raw_pdf_list)} total structural PDF resources.")

            # ── PASS A — Question Papers & Non-Exam Resources ──────────────────
            for file in raw_pdf_list:
                file_id   = file['id']
                file_name = file['name']
                parent_folder_id = file.get('parents', [None])[0]

                # ⚡ STEP 3: Reconstruct path upwards instantly using our local RAM dictionary
                path = resolve_path_from_cache(parent_folder_id, drive_map, ROOT_ID)

                parsed, err = classify_path(path, types_cache)
                if err:
                    unmatched.append({"file": file_name, "path": path, "reason": err})
                    failed += 1
                    continue

                if normalize(parsed["resource_type"]) == "marking scheme":
                    # Store data to handle safely down inside Pass B
                    marking_scheme_queue.append((file, path, parsed, parent_folder_id))
                    continue

                ids, err = resolve_path_to_ids(parsed, levels_cache, subjects_cache, types_cache)
                if err:
                    unmatched.append({"file": file_name, "path": path, "reason": err})
                    failed += 1
                    print(f"[Sync] ❌ Failed: '{file_name}' — {err}")
                    continue

                # Optimized RAM Lookup Check
                if file_id in existing_gdrive_ids:
                    skipped += 1
                    continue

                if normalize(parsed["resource_type"]) == "question paper":
                    folder_metadata = {
                        "subject_name":      parsed["subject"],
                        "level_name":        parsed["level"],
                        "session":           parsed.get("session") or "June",
                        "year":              parsed.get("year") or "YYYY",
                        "is_marking_scheme": False,
                    }
                    pre_result = clean_and_parse_filename(file_name, folder_metadata)

                    if pre_result["status"] == "ok":
                        existing_qp = db.session.query(Resource).join(
                            Question_Paper,
                            Question_Paper.resource_id == Resource.resource_id
                        ).filter(
                            Resource.level_id           == ids["level_id"],
                            Resource.sub_id             == ids["sub_id"],
                            Resource.resource_type_id   == ids["resource_type_id"],
                            Question_Paper.year         == parsed.get("year"),
                            Question_Paper.session      == parsed.get("session"),
                            Question_Paper.paper_number == pre_result["paper_number"],
                        ).first()

                        if existing_qp:
                            delete_file_from_drive(service, file_id)
                            skipped += 1
                            print(f"[Sync] 🗑️ Duplicate QP deleted from Drive: '{file_name}'")
                            continue

                    try:
                        new_resource, result = build_paper_resource(
                            file, parsed, parent_folder_id, ids, service,
                            pre_parsed=pre_result
                        )
                    except Exception as e:
                        print(f"[Sync] ❌ build_paper_resource crashed on '{file_name}': {e}")
                        failed += 1
                        continue
                        
                    if result["status"] == "needs_review":
                        needs_review += 1
                    elif result["confidence"] == "low":
                        needs_review += 1
                    else:
                        synced += 1
                        print(f"[Sync] ✅ Synced Paper: '{file_name}' -> '{new_resource.title}'")

                else:
                    # General, non-exam resource (notes, textbooks, etc.)
                    make_file_public(service, file_id)
                    view_url, download_url = build_drive_urls(file_id)
                    uploaded_by = resolve_uploader(file)
                    title = file_name.rsplit(".", 1)[0].strip()

                    new_resource = Resource(
                        title               = title,
                        sub_id              = ids["sub_id"],
                        level_id            = ids["level_id"],
                        resource_type_id    = ids["resource_type_id"],
                        gdrive_file_id      = file_id,
                        gdrive_folder_id    = parent_folder_id,
                        gdrive_view_url     = view_url,
                        gdrive_download_url = download_url,
                        file_size           = format_file_size(file.get('size')),
                        file_type           = "PDF",
                        author              = "Unknown",
                        description         = f"{title} — {parsed['level']} {parsed['subject']} {parsed['resource_type']}",
                        uploaded_by         = uploaded_by,
                        status              = "Approved",
                    )
                    db.session.add(new_resource)
                    db.session.flush()
                    synced += 1
                    print(f"[Sync] ✅ Synced Resource: {title} ({parsed['level']} / {parsed['subject']})")

                if (synced + needs_review) % 50 == 0:
                    db.session.commit()

            # ── PASS B — Marking Schemes (Decoupled Approach) ──────────────────
            for file, path, parsed, parent_folder_id in marking_scheme_queue:
                file_id   = file['id']
                file_name = file['name']

                if file_id in existing_gdrive_ids:
                    skipped += 1
                    continue

                ids, err = resolve_path_to_ids(parsed, levels_cache, subjects_cache, types_cache)
                if err:
                    unmatched.append({"file": file_name, "path": path, "reason": err})
                    failed += 1
                    continue
               
                try:
                    new_resource, result = build_paper_resource(file, parsed, parent_folder_id, ids, service)
                except Exception as e:
                    print(f"[Sync] ❌ build_paper_resource crashed on marking scheme '{file_name}': {e}")
                    failed += 1
                    continue

                if result["status"] == "needs_review":
                    needs_review += 1
                elif result["confidence"] == "low":
                    needs_review += 1
                else:
                    synced += 1
                    print(f"[Sync] ✅ Synced Marking Scheme: '{file_name}' -> '{new_resource.title}'")

                if (synced + needs_review) % 50 == 0:
                    db.session.commit()

            db.session.commit()

            notes_parts = []
            if unmatched:
                notes_parts.append(f"{len(unmatched)} unmatched item(s)")
            if needs_review:
                notes_parts.append(f"{needs_review} item(s) flagged for review")

            log_entry = Sync_log(
                synced_at     = datetime.utcnow(),
                files_synced  = synced,
                files_skipped = skipped,
                files_failed  = failed,
                triggered_by  = logged_in_user_id,
                notes         = " | ".join(notes_parts) if notes_parts else None
            )
            db.session.add(log_entry)
            db.session.commit()

            print(f"[Sync] Complete — synced={synced}, needs_review={needs_review}, skipped={skipped}, failed={failed}")

            return jsonify({
                "synced":             synced,
                "needs_review":       needs_review,
                "skipped_duplicates": skipped,
                "failed":             failed,
                "unmatched_folders":  unmatched,
                "message": f"Sync complete. {synced} approved, {needs_review} flagged for review, {skipped} duplicate(s) skipped, {failed} errors encountered."
            }), 200

        except Exception as err:
            db.session.rollback()
            print(f"[Sync] ❌ Error: {err}")
            return jsonify({"message": f"Server error during sync: {err}"}), 500


    # ──────────────────────────────────────────────────────────────────────────────
    # FOLDER ARCHITECTURE MATRIX SYNC ENDPOINT
    # ──────────────────────────────────────────────────────────────────────────────
    @library_bp.route('/api/resources/sync_drive_folders', methods=['POST'])
    def sync_drive_folders():
        logged_in_user_id = flask_session.get("user_id")
        if not logged_in_user_id:
            return jsonify({"message": "Unauthorized — please login"}), 401

        try:
            service = get_drive_service()
            ROOT_FOLDER_ID = Config.GDRIVE_ROOT_FOLDER_ID 

            years = [str(yr) for yr in range(2010, 2026)]
            sessions = ["June", "November"] 

            levels = db.session.query(Level).all()
            res_types = db.session.query(Resource_type).all()

            created_count = 0
            exists_count = 0

            print("[Structure] Commencing active subject folder verification matrix...")

            for lvl in levels:
                lvl_name = lvl.level_name.strip()
                lvl_id = find_structural_folder(service, lvl_name, ROOT_FOLDER_ID) or create_structural_folder(service, lvl_name, ROOT_FOLDER_ID)

                active_level_subjects = [sub for sub in lvl.subjects if sub.status == "Active"]

                for sub in active_level_subjects:
                    sub_name = sub.subject_name.strip()
                    sub_id = find_structural_folder(service, sub_name, lvl_id)
                    if not sub_id:
                        sub_id = create_structural_folder(service, sub_name, lvl_id)
                        created_count += 1
                    else:
                        exists_count += 1

                    for rt in res_types:
                        rt_name = rt.resource_name.strip()
                        rt_folder_name = rt_name if rt_name.lower().endswith("s") else f"{rt_name}s"
                        
                        rt_id = find_structural_folder(service, rt_folder_name, sub_id)
                        if not rt_id:
                            rt_id = create_structural_folder(service, rt_folder_name, sub_id)
                            created_count += 1
                        else:
                            exists_count += 1

                        is_paper = rt_name.lower() in ["question paper", "question papers", "marking scheme", "marking schemes"]
                        
                        if is_paper:
                            for yr in years:
                                yr_id = find_structural_folder(service, yr, rt_id)
                                if not yr_id:
                                    yr_id = create_structural_folder(service, yr, rt_id)
                                    created_count += 1
                                else:
                                    exists_count += 1

                                for sess in sessions:
                                    sess_id = find_structural_folder(service, sess, yr_id)
                                    if not sess_id:
                                        sess_id = create_structural_folder(service, sess, yr_id)
                                        created_count += 1
                                    else:
                                        exists_count += 1
                                    
                                    time.sleep(0.02) 

            print(f"[Structure] Complete. Created {created_count} paths, verified {exists_count} variants.")
            return jsonify({
                "status": "Success",
                "new_folders_created": created_count,
                "existing_folders_verified": exists_count,
                "message": f"Drive architecture synced. Built {created_count} missing variants, skipped {exists_count} existing."
            }), 200

        except Exception as err:
            print(f"[Structure] ❌ Error executing matrix compilation: {err}")
            return jsonify({"message": f"Server matrix engine error: {err}"}), 500