from flask import Blueprint, request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, func
from models import db, WhatsappCommunity, Level, Subject  # Import your SQLAlchemy models

community_bp = Blueprint("community_bp", __name__)


# ==============================================================================
# 1. GET ALL COMMUNITIES (WITH FILTERING, SEARCH & SUMMARY METRICS)
# ==============================================================================
@community_bp.route("/api/whatsapp-communities", methods=["GET"])
def get_whatsapp_communities():
    try:
        # Extract Query Parameters
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        search = request.args.get("search", "", type=str).strip()
        group_type = request.args.get("group_type", "", type=str).strip()
        level_id = request.args.get("level_id", type=int)
        sub_id = request.args.get("sub_id", type=int)
        status = request.args.get("status", "", type=str).strip()

        # Base Query joined with Level and Subject tables
        query = db.session.query(
            WhatsappCommunity,
            Level.level_name,
            Subject.subject_name
        ).outerjoin(Level, WhatsappCommunity.level_id == Level.level_id)\
         .outerjoin(Subject, WhatsappCommunity.sub_id == Subject.sub_id)

        # Apply Filters
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    WhatsappCommunity.group_name.ilike(search_pattern),
                    WhatsappCommunity.admin_name.ilike(search_pattern)
                )
            )

        if group_type:
            query = query.filter(WhatsappCommunity.group_type == group_type)

        if level_id:
            query = query.filter(WhatsappCommunity.level_id == level_id)

        if sub_id:
            query = query.filter(WhatsappCommunity.sub_id == sub_id)

        if status:
            query = query.filter(WhatsappCommunity.status == status)

        # Total record count before pagination
        total_records = query.count()

        # Apply Order & Pagination
        results = query.order_by(WhatsappCommunity.group_id.desc())\
                       .paginate(page=page, per_page=per_page, error_out=False)

        # Format Response Array
        groups_data = []
        for comm, level_name, subject_name in results.items:
            groups_data.append({
                "group_id": comm.group_id,
                "group_name": comm.group_name,
                "group_type": comm.group_type,
                "invite_link": comm.invite_link,
                "admin_name": comm.admin_name,
                "level_id": comm.level_id,
                "level_name": level_name,
                "sub_id": comm.sub_id,
                "subject_name": subject_name,
                "status": comm.status,
                "created_at": comm.created_at.isoformat() if comm.created_at else None
            })

        # Calculate Summary Metrics for Dashboard Cards
        total_active = db.session.query(func.count(WhatsappCommunity.group_id)).filter_by(status="active").scalar() or 0
        total_inactive = db.session.query(func.count(WhatsappCommunity.group_id)).filter(WhatsappCommunity.status.in_(["inactive", "archived"])).scalar() or 0
        study_groups = db.session.query(func.count(WhatsappCommunity.group_id)).filter_by(group_type="study_group").scalar() or 0
        scholarships = db.session.query(func.count(WhatsappCommunity.group_id)).filter_by(group_type="scholarship").scalar() or 0

        return jsonify({
            "groups": groups_data,
            "pagination": {
                "total_records": total_records,
                "total_pages": results.pages,
                "current_page": page,
                "per_page": per_page
            },
            "summary": {
                "active_count": total_active,
                "inactive_count": total_inactive,
                "study_groups": study_groups,
                "scholarships": scholarships
            }
        }), 200

    except SQLAlchemyError as err:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(err)}"}), 500
    except Exception as err:
        return jsonify({"message": f"Server error: {str(err)}"}), 500


# ==============================================================================
# 2. CREATE NEW WHATSAPP COMMUNITY
# ==============================================================================
@community_bp.route("/api/whatsapp-communities", methods=["POST"])
def create_whatsapp_community():
    data = request.get_json() or {}
    errors = {}

    # Validations
    group_name = data.get("group_name", "").strip()
    group_type = data.get("group_type", "").strip()
    invite_link = data.get("invite_link", "").strip()
    admin_name = data.get("admin_name", "").strip() or None
    level_id = data.get("level_id")
    sub_id = data.get("sub_id")
    status = data.get("status", "active").strip()

    if not group_name:
        errors["group_name"] = "Group name is required."
    if not group_type or group_type not in ["scholarship", "community", "study_group"]:
        errors["group_type"] = "Invalid group type specified."
    if not invite_link or not invite_link.startswith("https://chat.whatsapp.com/"):
        errors["invite_link"] = "A valid WhatsApp invite link is required."

    if errors:
        return jsonify({"errors": errors}), 400

    try:
        new_community = WhatsappCommunity(
            group_name=group_name,
            group_type=group_type,
            invite_link=invite_link,
            admin_name=admin_name,
            level_id=int(level_id) if level_id else None,
            sub_id=int(sub_id) if sub_id else None,
            status=status if status in ["active", "inactive", "archived"] else "active"
        )

        db.session.add(new_community)
        db.session.commit()

        return jsonify({
            "message": "WhatsApp community created successfully.",
            "group_id": new_community.group_id
        }), 201

    except SQLAlchemyError as err:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(err)}"}), 500


@community_bp.route("/api/whatsapp-communities/<int:group_id>", methods=["PUT"])
def update_whatsapp_community(group_id):
    data = request.get_json() or {}
    community = db.session.query(WhatsappCommunity).get(group_id)

    if not community:
        return jsonify({"message": "WhatsApp Community not found."}), 404

    group_name = data.get("group_name", "").strip()
    group_type = data.get("group_type", "").strip()
    invite_link = data.get("invite_link", "").strip()

    errors = {}
    if not group_name:
        errors["group_name"] = "Group name is required."
    if not group_type or group_type not in ["scholarship", "community", "study_group"]:
        errors["group_type"] = "Invalid group type specified."
    if not invite_link or not invite_link.startswith("https://chat.whatsapp.com/"):
        errors["invite_link"] = "A valid WhatsApp invite link is required."

    if errors:
        return jsonify({"errors": errors}), 400

    try:
        community.group_name = group_name
        community.group_type = group_type
        community.invite_link = invite_link
        community.admin_name = data.get("admin_name", "").strip() or None
        
        # 🌟 SAFE PARSING FOR LEVEL_ID & SUB_ID
        raw_level = data.get("level_id")
        if raw_level is not None and str(raw_level).strip() != "" and str(raw_level).lower() != "null":
            community.level_id = int(raw_level)
        else:
            community.level_id = None

        raw_sub = data.get("sub_id")
        if raw_sub is not None and str(raw_sub).strip() != "" and str(raw_sub).lower() != "null":
            community.sub_id = int(raw_sub)
        else:
            community.sub_id = None
        
        if "status" in data and data["status"] in ["active", "inactive", "archived"]:
            community.status = data["status"]

        db.session.commit()
        return jsonify({"message": "WhatsApp Community updated successfully."}), 200

    except SQLAlchemyError as err:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(err)}"}), 500


# ==============================================================================
# 4. QUICK STATUS TOGGLE (PATCH)
# ==============================================================================
@community_bp.route("/api/whatsapp-communities/<int:group_id>", methods=["PATCH"])
def patch_whatsapp_community_status(group_id):
    data = request.get_json() or {}
    new_status = data.get("status")

    if not new_status or new_status not in ["active", "inactive", "archived"]:
        return jsonify({"message": "Invalid status parameter provided."}), 400

    community = db.session.query(WhatsappCommunity).get(group_id)
    if not community:
        return jsonify({"message": "WhatsApp Community not found."}), 404

    try:
        community.status = new_status
        db.session.commit()
        return jsonify({"message": f"Community status updated to {new_status}."}), 200

    except SQLAlchemyError as err:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(err)}"}), 500


# ==============================================================================
# 5. DELETE WHATSAPP COMMUNITY
# ==============================================================================
@community_bp.route("/api/whatsapp-communities/<int:group_id>", methods=["DELETE"])
def delete_whatsapp_community(group_id):
    community = db.session.query(WhatsappCommunity).get(group_id)
    if not community:
        return jsonify({"message": "WhatsApp Community not found."}), 404

    try:
        db.session.delete(community)
        db.session.commit()
        return jsonify({"message": "WhatsApp Community deleted successfully."}), 200

    except SQLAlchemyError as err:
        db.session.rollback()
        return jsonify({"message": f"Database error: {str(err)}"}), 500