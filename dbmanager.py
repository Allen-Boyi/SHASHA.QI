import logging
from datetime import datetime, timezone
from typing import Dict, Any

from flask import Blueprint, jsonify, request
from sqlalchemy import func, case
from sqlalchemy.exc import SQLAlchemyError

from models import db, Subject, Level, Resource, SubjectCategory

logger = logging.getLogger(__name__)
dbmanager_bp = Blueprint("dbmanager", __name__)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def serialize_subject(subject: Subject, resources_count: int, level_name: str) -> Dict[str, Any]:
    return {
        "sub_id":          subject.sub_id,
        "subject_name":    subject.subject_name,
        "subject_code":    subject.subject_code,
        "subject_type":    subject.subject_Type,
        "syllabus_board":  subject.syllabus_board,
        "status":          subject.status,
        "level_id":        subject.level_id,
        "level_name":      level_name,
        "category_id":     subject.category_id,
        "total_resources": resources_count,
    }


# ─── Routes ───────────────────────────────────────────────────────────────────

@dbmanager_bp.route("/api/curriculum/subjects", methods=["GET"])
def get_subjects():
    """
    GET /api/curriculum/subjects

    Returns all subjects with their approved resource counts, level names,
    and per-level/per-status summary stats for the dashboard header cards.

    Query params:
        status    str   Active | Locked | Maintenance  (default: all)
        level_id  int   Filter by level ID
        search    str   Partial match on subject_name or subject_code
        page      int   Page number (default: 1)
        per_page  int   Rows per page, max 100 (default: 20)
    """
    try:
        # ── 1. Query params ───────────────────────────────────────────────────
        status_f   = request.args.get("status",   "",  type=str).strip()
        level_id_f = request.args.get("level_id", 0,   type=int)
        search     = request.args.get("search",   "",  type=str).strip()
        page       = max(request.args.get("page",     1,  type=int), 1)
        per_page   = min(max(request.args.get("per_page", 20, type=int), 1), 100)

        VALID_STATUSES = {"Active", "Locked", "Maintenance"}

        # ── 2. Resource count subquery ─────────────────────────────────────────
        # LEFT JOIN so subjects with zero approved resources still appear.
        # Only count resources that are visible to students (Approved or Unlocked).
        resource_count_col = func.count(
            case(
                (Resource.status.in_(["Approved", "Unlocked"]), Resource.resource_id),
                else_=None
            )
        ).label("resources_count")

        # ── 3. Base query — Subject + Level + resource count ──────────────────
        query = (
            db.session.query(Subject, Level.level_name, resource_count_col)
            .join(Level, Subject.level_id == Level.level_id)
            .outerjoin(Resource, Subject.sub_id == Resource.sub_id)
            .group_by(Subject.sub_id, Level.level_name)
        )

        # ── 4. Filters ────────────────────────────────────────────────────────
        if status_f and status_f in VALID_STATUSES:
            query = query.filter(Subject.status == status_f)

        if level_id_f:
            query = query.filter(Subject.level_id == level_id_f)

        if search:
            term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Subject.subject_name.ilike(term),
                    Subject.subject_code.ilike(term),
                )
            )

        # ── 5. Order: level first, then subject name ──────────────────────────
        query = query.order_by(Subject.level_id.asc(), Subject.subject_name.asc())

        # ── 6. Paginate ───────────────────────────────────────────────────────
        total_records = query.count()
        rows          = query.offset((page - 1) * per_page).limit(per_page).all()
        total_pages   = max(1, -(-total_records // per_page))  # ceiling division

        subjects_payload = [
            serialize_subject(subject, resources_count, level_name)
            for subject, level_name, resources_count in rows
        ]

        # ── 7. Summary stats for header cards ─────────────────────────────────
        # Single query — counts per (level_name, status) combination.
        # Frontend derives the six card values from this.
        stats_rows = (
            db.session.query(
                Level.level_name,
                Subject.status,
                func.count(Subject.sub_id).label("count"),
            )
            .join(Level, Subject.level_id == Level.level_id)
            .group_by(Level.level_name, Subject.status)
            .all()
        )

        # Build a nested dict: { level_name: { status: count } }
        summary: Dict[str, Dict[str, int]] = {}
        for level_name, status, count in stats_rows:
            summary.setdefault(level_name, {})[status] = count

        logger.info(
            "Curriculum subjects fetched | page=%d per_page=%d total=%d",
            page, per_page, total_records,
        )

        return jsonify({
            "status":   "success",
            "subjects": subjects_payload,
            "pagination": {
                "total_records": total_records,
                "total_pages":   total_pages,
                "current_page":  page,
                "per_page":      per_page,
                "has_next":      page < total_pages,
                "has_prev":      page > 1,
            },
            "summary": summary,
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("get_subjects — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error while loading subjects."}), 500

    except Exception as e:
        logger.error("get_subjects — Unexpected error: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Unexpected error while loading subjects."}), 500


@dbmanager_bp.route("/api/curriculum/subjects", methods=["POST"])
def create_subject():
    """
    POST /api/curriculum/subjects

    Body (JSON):
        subject_name   str   required
        subject_code   str   required
        subject_type   str   required  (e.g. "Core", "Elective")
        syllabus_board str   required  (ZIMSEC | Cambridge | Cambridge(GCSE) | HEXCO)
        level_id       int   required
        category_id    int   required
        status         str   optional  (default: Active)
    """
    try:
        data = request.json or {}

        # ── Validation ────────────────────────────────────────────────────────
        errors = {}
        if not data.get("subject_name"):  errors["subject_name"]  = "Subject name is required."
        if not data.get("subject_code"):  errors["subject_code"]  = "Subject code is required."
        if not data.get("subject_type"):  errors["subject_type"]  = "Subject type is required."
        if not data.get("syllabus_board"):errors["syllabus_board"]= "Syllabus board is required."
        if not data.get("level_id"):      errors["level_id"]      = "Academic level is required."
        if not data.get("category_id"):   errors["category_id"]   = "Category is required."
        if errors:
            return jsonify({"status": "error", "errors": errors}), 400

        # ── Duplicate guard ───────────────────────────────────────────────────
        existing = Subject.query.filter_by(
            subject_code=data["subject_code"],
            level_id=data["level_id"],
        ).first()
        if existing:
            return jsonify({
                "status":  "error",
                "message": f"Subject code '{data['subject_code']}' already exists for this level.",
            }), 409

        new_subject = Subject(
            subject_name  = data["subject_name"].strip(),
            subject_code  = data["subject_code"].strip().upper(),
            subject_Type  = data["subject_type"].strip(),
            syllabus_board= data["syllabus_board"],
            level_id      = data["level_id"],
            category_id   = data["category_id"],
            status        = data.get("status", "Active"),
        )

        db.session.add(new_subject)
        db.session.commit()

        logger.info("New subject created: %s (code=%s)", new_subject.subject_name, new_subject.subject_code)

        return jsonify({
            "status":  "success",
            "message": f"Subject '{new_subject.subject_name}' created successfully.",
            "sub_id":  new_subject.sub_id,
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("create_subject — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error while creating subject."}), 500


@dbmanager_bp.route("/api/curriculum/subjects/<int:sub_id>", methods=["PATCH"])
def update_subject(sub_id: int):
    """
    PATCH /api/curriculum/subjects/<sub_id>

    Accepts any subset of updatable fields:
        subject_name, subject_code, subject_type, syllabus_board,
        level_id, category_id, status
    """
    try:
        subject = Subject.query.get(sub_id)
        if not subject:
            return jsonify({"status": "error", "message": "Subject not found."}), 404

        data = request.json or {}

        VALID_STATUSES  = {"Active", "Locked", "Maintenance"}
        VALID_SYLLABI   = {"ZIMSEC", "Cambridge", "Cambridge(GCSE)", "HEXCO"}

        if "subject_name"   in data: subject.subject_name   = data["subject_name"].strip()
        if "subject_code"   in data: subject.subject_code   = data["subject_code"].strip().upper()
        if "subject_type"   in data: subject.subject_Type   = data["subject_type"].strip()
        if "level_id"       in data: subject.level_id       = data["level_id"]
        if "category_id"    in data: subject.category_id    = data["category_id"]

        if "syllabus_board" in data:
            if data["syllabus_board"] not in VALID_SYLLABI:
                return jsonify({"status": "error", "message": f"Invalid syllabus_board. Must be one of: {', '.join(VALID_SYLLABI)}"}), 400
            subject.syllabus_board = data["syllabus_board"]

        if "status" in data:
            if data["status"] not in VALID_STATUSES:
                return jsonify({"status": "error", "message": f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"}), 400
            subject.status = data["status"]

        db.session.commit()

        logger.info("Subject updated: sub_id=%d status=%s", sub_id, subject.status)

        return jsonify({
            "status":  "success",
            "message": f"Subject '{subject.subject_name}' updated.",
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("update_subject — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error while updating subject."}), 500


@dbmanager_bp.route("/api/curriculum/subjects/<int:sub_id>/toggle-lock", methods=["PATCH"])
def toggle_lock(sub_id: int):
    """
    PATCH /api/curriculum/subjects/<sub_id>/toggle-lock

    Toggles between Active and Locked.
    Subjects in Maintenance status are left untouched.
    """
    try:
        subject = Subject.query.get(sub_id)
        if not subject:
            return jsonify({"status": "error", "message": "Subject not found."}), 404

        if subject.status == "Maintenance":
            return jsonify({
                "status":  "error",
                "message": "Subject is under maintenance and cannot be toggled.",
            }), 409

        subject.status = "Locked" if subject.status == "Active" else "Active"
        db.session.commit()

        logger.info("Subject lock toggled: sub_id=%d new_status=%s", sub_id, subject.status)

        return jsonify({
            "status":     "success",
            "new_status": subject.status,
            "message":    f"Subject '{subject.subject_name}' is now {subject.status}.",
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("toggle_lock — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error while toggling subject lock."}), 500


@dbmanager_bp.route("/api/curriculum/subjects/<int:sub_id>", methods=["DELETE"])
def delete_subject(sub_id: int):
    """
    DELETE /api/curriculum/subjects/<sub_id>

    Hard deletes the subject. Because Resource has sub_id as a non-nullable
    FK, this will fail at the DB level if the subject still has resources
    attached. That's intentional — the admin must remove or reassign
    resources before deleting the subject.
    """
    try:
        subject = Subject.query.get(sub_id)
        if not subject:
            return jsonify({"status": "error", "message": "Subject not found."}), 404

        # Guard: block deletion if subject still has resources
        resource_count = Resource.query.filter_by(sub_id=sub_id).count()
        if resource_count > 0:
            return jsonify({
                "status":  "error",
                "message": f"Cannot delete '{subject.subject_name}' — it still has {resource_count} resource(s). Remove or reassign them first.",
            }), 409

        name = subject.subject_name
        db.session.delete(subject)
        db.session.commit()

        logger.info("Subject deleted: sub_id=%d name=%s", sub_id, name)

        return jsonify({
            "status":  "success",
            "message": f"Subject '{name}' deleted successfully.",
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("delete_subject — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error while deleting subject."}), 500


@dbmanager_bp.route("/api/curriculum/levels", methods=["GET"])
def get_levels():
    """
    GET /api/curriculum/levels

    Returns all academic levels. Used to populate the level dropdown
    in the Add/Edit Subject modal on the frontend.
    """
    try:
        levels = Level.query.order_by(Level.level_id.asc()).all()
        return jsonify({
            "status": "success",
            "levels": [
                {"level_id": l.level_id, "level_name": l.level_name}
                for l in levels
            ],
        }), 200

    except SQLAlchemyError as e:
        logger.error("get_levels — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error while loading levels."}), 500


@dbmanager_bp.route("/api/curriculum/categories", methods=["GET"])
def get_categories():
    """
    GET /api/curriculum/categories

    Returns all subject categories. Used to populate the category dropdown
    in the Add/Edit Subject modal on the frontend.
    """
    try:
        categories = SubjectCategory.query.order_by(SubjectCategory.category_name.asc()).all()
        return jsonify({
            "status": "success",
            "categories": [
                {"category_id": c.category_id, "category_name": c.category_name}
                for c in categories
            ],
        }), 200

    except SQLAlchemyError as e:
        logger.error("get_categories — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error while loading categories."}), 500