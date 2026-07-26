import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
from models import db, Whatsappbot_user,ZimProvince, Level

logger = logging.getLogger(__name__)
botusers_bp = Blueprint("botusers_bp", __name__)


# ─── Constants ────────────────────────────────────────────────────────────────

VALID_STATUSES = {"Active", "Inactive", "Banned", "Pending", "Suspended"}
VALID_TIERS    = {"Free", "Premium", "Teacher"}

SORT_COLUMNS = {
    "created_at":  Whatsappbot_user.created_at,
    "last_active": Whatsappbot_user.last_active,
    "credits":     Whatsappbot_user.credits,
    "username":    Whatsappbot_user.username,
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def derive_sid(jid: str) -> str:
    """
    Converts a Baileys JID to the dashboard SID format.
    "263771234567@s.whatsapp.net" → "WA-263771234567"
    """
    number = jid.split("@")[0] if "@" in jid else jid
    return f"WA-{number}"


def relative_time(dt: Optional[datetime]) -> Optional[str]:
    """Returns a human-readable relative time string (e.g. "3 hours ago")."""
    if dt is None:
        return None

    # Use utcnow() for naive UTC datetimes from DB
    if dt.tzinfo is None:
        now = datetime.utcnow()
    else:
        now = datetime.now(timezone.utc)

    seconds = int((now - dt).total_seconds())

    if seconds < 60:         return "just now"
    if seconds < 3600:      n = seconds // 60;       unit = "min"
    elif seconds < 86400:   n = seconds // 3600;     unit = "hour"
    elif seconds < 2592000: n = seconds // 86400;    unit = "day"
    elif seconds < 31536000: n = seconds // 2592000; unit = "month"
    else:                   n = seconds // 31536000;  unit = "year"

    return f"{n} {unit} ago" if n == 1 else f"{n} {unit}s ago"
def serialize_row(user: Whatsappbot_user, row_number: int) -> Dict[str, Any]:
    """Maps one ORM row to the JSON shape consumed by the frontend table."""
    return {
        "no":           row_number,
        "wuser_id":     user.wuser_id,
        "sid_number":   derive_sid(user.jid),
        "jid":          user.jid,
        # 🌟 ADDED: Level Name (accesses relationship, falls back to "Unassigned")
        "level_name":   user.academic_level.level_name if user.academic_level else "Unassigned",
        # 🌟 ADDED: Account Tier ('Free', 'Premium', 'Teacher')
        "account_tier": user.account_tier if user.account_tier else "Free",
        "school":       user.school if user.school else "Not Specified",
        "username":     f"@{user.username}" if user.username else "Unknown",
        "status":       user.status,
        "joined":       user.created_at.strftime("%b %d, %Y").replace(" 0", " ") if user.created_at else "N/A",
        "last_active":  relative_time(user.last_message_at),
        "actions": {
            "wuser_id":   user.wuser_id,
            "jid":        user.jid,
            "status":     user.status,
            "is_flagged": user.is_flagged,
        },
    }


def fetch_summary() -> Dict[str, int]:
    """Full-table counts for the dashboard header stat cards."""
    return {
        "total_active":  Whatsappbot_user.query.filter_by(status="Active").count(),
        "total_banned":  Whatsappbot_user.query.filter_by(status="Banned").count(),
        "total_flagged": Whatsappbot_user.query.filter_by(is_flagged=True).count(),
    }


def _parse_params() -> Dict[str, Any]:
    """Extracts and clamps all incoming query parameters."""
    return {
        "page":     max(request.args.get("page",     1,  type=int), 1),
        "per_page": min(max(request.args.get("per_page", 10, type=int), 1), 100),
        "search":   request.args.get("search",   "", type=str).strip(),
        "status":   request.args.get("status",   "", type=str).strip(),
        "tier":     request.args.get("tier",     "", type=str).strip(),
        "sort_by":  request.args.get("sort_by",  "created_at", type=str).strip(),
        "sort_dir": request.args.get("sort_dir", "desc", type=str).strip().lower(),
    }


def _build_query(params: Dict[str, Any]):
    """Assembles the SQLAlchemy query from validated params."""
    query = Whatsappbot_user.query

    if params["search"]:
        term = f"%{params['search']}%"
        query = query.filter(
            db.or_(
                Whatsappbot_user.jid.ilike(term),
                Whatsappbot_user.username.ilike(term),
                Whatsappbot_user.email.ilike(term),
                Whatsappbot_user.school.ilike(term),
            )
        )

    if params["status"] in VALID_STATUSES:
        query = query.filter(Whatsappbot_user.status == params["status"])

    if params["tier"] in VALID_TIERS:
        query = query.filter(Whatsappbot_user.account_tier == params["tier"])

    sort_col = SORT_COLUMNS.get(params["sort_by"], Whatsappbot_user.created_at)
    query = query.order_by(
        sort_col.desc() if params["sort_dir"] == "desc" else sort_col.asc()
    )

    return query


# ─── Routes ───────────────────────────────────────────────────────────────────
@botusers_bp.route("/", methods=["GET"])
def get_bot_users():
    # 1. Query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # 2. Database query with eager loading
    pagination = (
        Whatsappbot_user.query
        .options(joinedload(Whatsappbot_user.academic_level))
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    # 3. Row offset calculation
    start_row = (page - 1) * per_page + 1

    # 4. Serialize rows using your custom helper function
    serialized_users = [
        serialize_row(user, start_row + i) 
        for i, user in enumerate(pagination.items)
    ]

    # 5. Return structured JSON matching your dashboard frontend
    return jsonify({
        "status": "success",
        "users": serialized_users,
        "pagination": {
            "current_page": pagination.page,
            "per_page": pagination.per_page,
            "total_pages": pagination.pages,
            "total_records": pagination.total,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        },
        "summary": {
            "total_active": Whatsappbot_user.query.filter_by(status='Active').count(),
            "total_banned": Whatsappbot_user.query.filter_by(status='Banned').count(),
            "total_flagged": Whatsappbot_user.query.filter_by(is_flagged=True).count()
        }
    }), 200

@botusers_bp.route("/api/botusers/update-tier", methods=["PATCH", "POST"])
def update_user_tier():
    """
    Updates account_tier to 'Free', 'Premium', or 'Teacher'.
    Accepts JSON body:
      - Single user: { "wuser_id": 15, "tier": "Premium" }
      - Bulk users:  { "wuser_ids": [15, 17, 25], "tier": "Teacher" }
    """
    data = request.get_json() or {}
    
    tier = data.get("tier")
    wuser_id = data.get("wuser_id")
    wuser_ids = data.get("wuser_ids", [])

    # Validate allowed account tiers
    allowed_tiers = ["Free", "Premium", "Teacher"]
    if tier not in allowed_tiers:
        return jsonify({
            "status": "error",
            "message": f"Invalid tier. Must be one of: {', '.join(allowed_tiers)}"
        }), 400

    # Handle single ID if passed
    if wuser_id:
        wuser_ids.append(wuser_id)

    if not wuser_ids:
        return jsonify({
            "status": "error", 
            "message": "Please provide 'wuser_id' or 'wuser_ids'"
        }), 400

    try:
        # Perform bulk update directly in DB
        updated_count = Whatsappbot_user.query.filter(
            Whatsappbot_user.wuser_id.in_(wuser_ids)
        ).update(
            {Whatsappbot_user.account_tier: tier}, 
            synchronize_session=False
        )
        
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Successfully updated {updated_count} user(s) to {tier} tier.",
            "updated_count": updated_count,
            "tier": tier
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Failed to update user tier",
            "error": str(e)
        }), 500

@botusers_bp.route("/register_botuser", methods=["POST"])
def register_bot_user():
    """Registers a new WhatsApp bot user."""
    try:
        data = request.json or {}

        jid      = data.get("jid")
        username = data.get("username")
        email    = data.get("email")

        errors = {}
        if not jid:      errors["jid"]      = "JID is required."
        if not username: errors["username"]  = "Username is required."
        if not email:    errors["email"]     = "Email is required."

        if errors:
            return jsonify({"status": "error", "errors": errors}), 400

        new_user = Whatsappbot_user(jid=jid, username=username, email=email)
        db.session.add(new_user)
        db.session.commit()

        logger.info("New bot user registered: %s", jid)
        return jsonify({"status": "success", "message": "Bot user registered."}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("register_bot_user — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error during registration."}), 500


@botusers_bp.route("/botuser/download_counts", methods=["POST"])
def get_download_counts():
    """Returns the download count for a given bot user JID."""
    try:
        data = request.json or {}
        jid  = data.get("jid")

        if not jid:
            return jsonify({"status": "error", "message": "JID is required."}), 400

        user = Whatsappbot_user.query.filter_by(jid=jid).first()
        if not user:
            return jsonify({"status": "error", "message": "User not found."}), 404

        return jsonify({
            "status":          "success",
            "jid":             user.jid,
            "download_counts": user.download_counts or 0,
        }), 200

    except SQLAlchemyError as e:
        logger.error("get_download_counts — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error."}), 500


@botusers_bp.route("/api/botusers", methods=["GET"])
def get_bot_users_table():
    """
    Paginated bot user table for the admin dashboard.

    Query params:
        page        int   Page number (default: 1)
        per_page    int   Rows per page, max 100 (default: 10)
        search      str   Matches JID, username, or email
        status      str   Active | Inactive | Banned | Pending | Suspended
        tier        str   Free | Premium | Teacher
        sort_by     str   created_at | last_active | credits | username
        sort_dir    str   asc | desc (default: desc)

    ⚠️  "Suspended" is in the UI mockup but not yet in the DB enum. Run:
            ALTER TABLE whatsappbot_users
            MODIFY COLUMN status
            ENUM('Active','Inactive','Banned','Pending','Suspended')
            NOT NULL DEFAULT 'Active';
        No route change needed after migration.
    """
    try:
        params    = _parse_params()
        paginated = _build_query(params).paginate(
            page=params["page"], per_page=params["per_page"], error_out=False
        )

        page_offset = (paginated.page - 1) * paginated.per_page
        users = [
            serialize_row(user, page_offset + idx + 1)
            for idx, user in enumerate(paginated.items)
        ]

        logger.info("Bot users table | page=%d per_page=%d total=%d",
                    params["page"], params["per_page"], paginated.total)

        return jsonify({
            "status": "success",
            "users":  users,
            "pagination": {
                "total_records": paginated.total,
                "total_pages":   paginated.pages,
                "current_page":  paginated.page,
                "per_page":      paginated.per_page,
                "has_next":      paginated.has_next,
                "has_prev":      paginated.has_prev,
            },
            "summary": fetch_summary(),
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error("get_bot_users_table — DB failure: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Database error while loading users."}), 500

    except Exception as e:
        logger.error("get_bot_users_table — Unexpected error: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": "Unexpected error while loading users."}), 500