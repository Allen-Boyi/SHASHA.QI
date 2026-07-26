from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.http import MediaIoBaseUpload, HttpError
import io
from googleapiclient.discovery import build
from flask import (Flask, Blueprint, request, current_app, send_file, jsonify)
from flask import session as flask_session
from models import (db, Resource, Resource_type, RolePermission, Level, SubjectCategory, Subject, Usage_stat,
                     Ai_Query, Alert, Whatsappbot_user, User, Wuser_activity, Question_Paper, Sync_log
                     )
from config import Config
from sqlalchemy import func, case, select
from datetime import datetime, timedelta, timezone
from hashids import Hashids
from filename_cleaner import build_clean_names
from urllib.parse import quote
from helper_functions import SUBJECT_IMOJIS
library_bp = Blueprint("library_bp", __name__)
from drive_service import get_drive_service, delete_file_from_drive,get_or_create_folder
from sqlalchemy import select, func, case, and_

 
# Initialize Hashids with your unique secret salt phrase
# min_length=6 forces short IDs like 5 to become something like "g3R8pA"
hash_encoder = Hashids(salt=Config.HASHIDS_SALT, min_length=6)

def format_file_size(raw_bytes) -> str | None:
    """Same formatting contract as the sync engine — every row in the
    resource table must produce file_size as 'N.NN MB', never a bare
    number, regardless of which ingestion path created the row."""
    if not raw_bytes:
        return None
    try:
        return f"{round(int(raw_bytes) / (1024 * 1024), 2)} MB"
    except (TypeError, ValueError):
        return None

 # Ensure these names match your definitions

@library_bp.route("/api/dashboard_stats", methods=["GET"])
def get_dashboard_stats():
    try:
        if "user_id" not in flask_session:
            return jsonify({"message": "Unauthorized — please login"}), 401

        now        = datetime.now(timezone.utc)
        cur_start  = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        prev_start = (cur_start - timedelta(days=1)).replace(day=1)

        # ── All resource counts in ONE query using conditional aggregation ──
        stats_stmt = (
            select(
                func.count().label("total_resources"),
                # Correct CASE condition syntax: (Condition, Value If True)
                func.count(case((Resource.level_id == 1, 1))).label("grade_7"),
                func.count(case((Resource.level_id == 2, 1))).label("olevel"),
                func.count(case((Resource.level_id == 3, 1))).label("alevel"),
                func.count(case((Resource.status == "Needs_Review", 1))).label("needs_review"),
                func.count(case((Resource.status == "Pending", 1))).label("pending"),
                func.count(case((Resource.uploaded_at >= cur_start, 1))).label("this_month"),
                func.count(case((and_(
                    Resource.uploaded_at >= prev_start,
                    Resource.uploaded_at < cur_start
                ), 1))).label("last_month")
            ).select_from(Resource)  # Tells SQLAlchemy exactly which table context to scan
        )

        stats = db.session.execute(stats_stmt).mappings().fetchone()

        # Fallback dictionary if mappings or records aren't generated cleanly
        if not stats:
            stats = {
                "total_resources": 0, "grade_7": 0, "olevel": 0, "alevel": 0,
                "needs_review": 0, "pending": 0, "this_month": 0, "last_month": 0
            }

        # ── Bot users (students) — separate indexed COUNT ──
        bot_users = db.session.query(
            func.count(Whatsappbot_user.wuser_id)
        ).scalar() or 0

        # ── Trend helper ──
        def trend(cur, prev):
            if not prev or prev == 0:
                return None
            return round(((cur - prev) / prev) * 100, 1)

        return jsonify({
            "cards": {
                "bot_users": {
                    "value": bot_users,
                    "trend_pct": None,
                    "sub": "Registered students",
                },
                "needs_review": {
                    "value": stats["needs_review"] or 0,
                    "trend_pct": None,
                    "sub": f"{stats['pending'] or 0} pending approval",
                },
                "total_resources": {
                    "value": stats["total_resources"] or 0,
                    "trend_pct": trend(stats["this_month"] or 0, stats["last_month"] or 0),
                    "sub": "vs last month",
                },
                "by_level": {
                    "grade_7": stats["grade_7"] or 0,
                    "olevel": stats["olevel"] or 0,
                    "alevel": stats["alevel"] or 0,
                },
            },
            "generated_at": now.isoformat(),
        }), 200

    except Exception as err:
        db.session.rollback()
        print(f"[Dashboard API Error]: {err}")  # Keeps visibility up in terminal logs
        return jsonify({"message": f"Error: {err}"}), 500

@library_bp.route("/api/test_session", methods=["GET"])
def test_session():
    print("Session:", dict(flask_session))
    return jsonify({"session": dict(flask_session)}), 200


@library_bp.route("/api/resources", methods=["POST"])
def upload_resource():
    try:
        # ── Auth check
        logged_in_user_id = flask_session.get("user_id")
        if not logged_in_user_id:
            return jsonify({"message": "Unauthorized — please login"}), 401

        # ── Get file from request
        file = request.files.get("file")
        if not file:
            return jsonify({"message": "No file provided"}), 400

        # ── Get metadata from form fields
        # NOTE: 'title' here is just the dropped file's own name, mirrored
        # by the frontend — it is NOT a human decision and must never be
        # trusted as the canonical name for paper-type resources. It's only
        # used as-is for non-paper resources (notes, textbooks) where there
        # is no naming convention to enforce.
        raw_title             = request.form.get("title")
        sub_id_raw             = request.form.get("sub_id", "").strip()
        level_id_raw           = request.form.get("level_id", "").strip()
        resource_type_id_raw   = request.form.get("resource_type_id", "").strip()
        year                   = request.form.get("year")
        author                 = request.form.get("author", "Unknown")
        exam_session            = request.form.get("session")
        paper_number_raw        = request.form.get("paper_number")
        file_size_bytes         = request.form.get("file_size")
        file_type               = request.form.get("file_type", "PDF")

        if not sub_id_raw or not level_id_raw or not resource_type_id_raw:
            return jsonify({"message": "sub_id, level_id and resource_type_id are required"}), 400

        sub_id           = int(sub_id_raw)
        level_id         = int(level_id_raw)
        resource_type_id = int(resource_type_id_raw)

        # ── Resolve names from IDs
        level_row = db.session.query(Level).filter_by(level_id=level_id).first()
        if not level_row:
            return jsonify({"message": "Level not found"}), 404
        level_name = level_row.level_name

        subject_row = db.session.query(Subject).filter_by(sub_id=sub_id).first()
        if not subject_row:
            return jsonify({"message": "Subject not found"}), 404
        subject_name = subject_row.subject_name

        resource_type_row = db.session.query(Resource_type).filter_by(
            resource_type_id=resource_type_id
        ).first()
        if not resource_type_row:
            return jsonify({"message": "Resource type not found"}), 404
        resource_name = resource_type_row.resource_name

        # ── Validate required fields
        is_paper   = resource_name.lower() in ["question paper", "question papers", "marking scheme", "marking schemes"]
        is_marking_scheme = resource_name.lower() in ["marking scheme", "marking schemes"]

        if is_paper:
            missing = [f for f in ['title', 'year', 'session', 'paper_number']
                       if not request.form.get(f)]
        else:
            missing = [f for f in ['title'] if not request.form.get(f)]
        if missing:
            return jsonify({"missing": f"Missing: {missing}"}), 400

        # ── Resolve the canonical title and Drive filename
        # Paper-type resources: every field (level/subject/year/session/
        # paper_number) was explicitly selected by the admin through
        # dropdowns — there's no detection needed, only assembly, so this
        # goes straight through build_clean_names() rather than
        # clean_and_parse_filename()'s guessing cascade.
        if is_paper:
            names = build_clean_names(
                level_name, subject_name, year, exam_session,
                paper_number_raw, is_marking_scheme=is_marking_scheme
            )
            if not names:
                return jsonify({"message": f"Could not resolve a valid paper number from '{paper_number_raw}'"}), 400
            resource_title  = names['title']
            drive_file_name = names['drive_filename']
        else:
            # No canonical naming convention applies to general resources —
            # the dropped file's own name (echoed back as 'title') is fine.
            resource_title  = raw_title.strip()
            drive_file_name = f"{resource_title}.pdf"

        # ── Duplicate check
        if is_paper:
            existing = db.session.query(Resource).join(
                Question_Paper, Question_Paper.resource_id == Resource.resource_id
            ).filter(
                Resource.resource_type_id   == resource_type_id,
                Resource.level_id           == level_id,
                Resource.sub_id             == sub_id,
                Question_Paper.year         == year,
                Question_Paper.paper_number == names["paper_number"],
                Question_Paper.session      == exam_session
            ).first()
            if existing:
                return jsonify({"message": f"{resource_title} already exists"}), 400
        else:
            existing = db.session.query(Resource).filter(
                Resource.title    == resource_title,
                Resource.level_id == level_id,
                Resource.sub_id   == sub_id
            ).first()
            if existing:
                return jsonify({"message": f"{resource_name} already uploaded"}), 400

        # ── Get or create Drive folder
        service = get_drive_service()
        target_folder_id = get_or_create_folder(
            service      = service,
            Level        = level_name,
            Subject      = subject_name,
            ResourceType = resource_name if resource_name.lower().endswith("s") else f"{resource_name}s",
            Year         = year,
            Sessions     = exam_session
        )
        if not target_folder_id:
            return jsonify({"message": "Failed to create Drive folder"}), 500

        # ── Upload file to Google Drive, named correctly from the start —
        # no rename-after-the-fact needed since every field was already
        # known before the file ever reached Drive.
        file_bytes = file.read()
        media = MediaIoBaseUpload(
            io.BytesIO(file_bytes),
            mimetype  = "application/pdf",
            resumable = True
        )
        uploaded_file = service.files().create(
            body       = {"name": drive_file_name, "parents": [target_folder_id]},
            media_body = media,
            fields     = "id, webViewLink, webContentLink",
            supportsAllDrives=True
        ).execute()

        gdrive_file_id = uploaded_file.get("id")
        if not gdrive_file_id:
            return jsonify({"message": "Drive upload failed"}), 500

        service.permissions().create(
            fileId = gdrive_file_id,
            body   = {
                "type": "anyone",
                "role": "reader"
            },
            supportsAllDrives=True
        ).execute()

        gdrive_view_url     = f"https://drive.google.com/file/d/{gdrive_file_id}/view?usp=sharing"
        gdrive_download_url = f"https://drive.google.com/uc?export=download&id={gdrive_file_id}"

        # ── Build description
        safe_author = author.strip() or "Unknown Author"
        description = f"{resource_title} is a {level_name} {subject_name} {resource_name} written by {safe_author}"

        # ── Save to database
        # Every field here was human-confirmed through the form — there is
        # no parsing ambiguity to flag, so this goes straight to Approved
        # rather than Needs_Review.
        new_resource = Resource(
            title               = resource_title,
            sub_id              = sub_id,
            level_id            = level_id,
            gdrive_folder_id    = target_folder_id,
            gdrive_file_id      = gdrive_file_id,
            gdrive_view_url     = gdrive_view_url,
            gdrive_download_url = gdrive_download_url,
            file_size           = format_file_size(file_size_bytes),
            file_type           = file_type,
            author              = safe_author,
            description         = description,
            resource_type_id    = resource_type_id,
            uploaded_by         = logged_in_user_id,
            status              = "Approved",
        )
        db.session.add(new_resource)
        db.session.flush()  # Populates new_resource.resource_id

        if is_paper:
            db.session.add(Question_Paper(
                resource_id  = new_resource.resource_id,
                session      = exam_session,
                year         = year,
                paper_number = names["paper_number"],
            ))

        db.session.commit()
        return jsonify({
            "message":     "Resource uploaded successfully",
            "resource_id": new_resource.resource_id,
            "title":       new_resource.title,
            "view_url":    gdrive_view_url
        }), 200

    except Exception as err:
        db.session.rollback()
        print("upload_resource error:", err)
        return jsonify({"message": f"Server error: {err}"}), 500


@library_bp.route("/api/resources/sync_logs", methods=["GET"])
def get_sync_logs():
    try:
        print("Session contents:", dict(flask_session))
        if "user_id" not in flask_session:
            return jsonify({"message": "Unauthorized"}), 401

        logs = db.session.query(Sync_log, User.username)\
            .outerjoin(User, User.user_id == Sync_log.triggered_by)\
            .order_by(Sync_log.synced_at.desc())\
            .limit(50)\
            .all()

        return jsonify({
            "logs": [{
                "sync_id":          log.Sync_log.sync_id,
                "synced_at":        log.Sync_log.synced_at.isoformat(),
                "files_synced":     log.Sync_log.files_synced,
                "files_skipped":    log.Sync_log.files_skipped,
                "files_failed":     log.Sync_log.files_failed,
                "notes":            log.Sync_log.notes,
                "triggered_by_name": log.username or "Unknown",
            } for log in logs]
        }), 200
    except Exception as e:
        return jsonify({"message": f"Error: {e}"}), 500
# The database helper function to get resources by level and subject
# """""""""""""""""Delete resource by ID """""""""""""""""""""""
def delete_resource_by_resource_id(resource_id):
    try:
        # Fetch the resource row safely using the master ID
        resource = db.session.get(Resource, resource_id)
        if not resource:
            print(f"[Delete] Resource ID {resource_id} not found in database.")
            return False 
        db.session.delete(resource)
        db.session.commit()
        
        print(f"[Delete] ✅ Resource {resource_id} and its associated metadata successfully purged.")
        return True

    except Exception as e:
        db.session.rollback()
        print(f"[Delete] ❌ Deletion error: {e}")
        return False 
    
# ------get resources by subject and level-------------------   
def get_resources_by_level_and_subject(level_id,resource_type_id,sub_id):
    try:
        resources=Resource.query.filter(Resource.level_id==level_id,
                Resource.resource_type_id==resource_type_id,Resource.sub_id==sub_id).all()
        if resources:
            print("The total resources found are:",len(resources))
            return resources
    except Exception as e:
        print("Error occurred: ",e)
        return []
    
# --------get resource by resource id----------------------
def get_resource_by_resource_id(resource_id):
    try:
        resource=db.session.query(Resource.gdrive_file_id).filter(Resource.resource_id==resource_id).first()
        if resource:
            print("The resource is: ",resource)
            return resource
        return None
    except Exception as e:
        print("Error occurred:",e)
        return None
    
# ----------------Increase view and download counts functions---------------
def increment_resource_view_counts(resource_id):
    try:
        resource = db.session.get(Resource, resource_id)
        if not resource:
            return False
        resource.view_count = resource.view_count + 1
        db.session.commit()
        print(f"View count incremented to {resource.resource_id}.Total: {resource.view_count}")
        return True
    except Exception as e:
        print("Error occurred: ",e)
        return False
    
def increment_resource_download_counts(resource_id):
    try:
        resource = db.session.get(Resource, resource_id)
        if not resource:
            return False
        resource.download_count = resource.download_count + 1
        print(f"Download count incremented to {resource.resource_id}.Total: {resource.download_count}")
        db.session.commit()
        return True
    except Exception as e:
        print("Error Occurred:",e)
        return False   
    
# Refactored Delete Route supporting Single & Bulk operations
@library_bp.route("/api/resources", methods=["DELETE"]) # <-- Changed to DELETE method
def delete_resources():
    try:
        logged_in_user_id = flask_session.get("user_id")
        if not logged_in_user_id:
            return jsonify({"message": "Unauthorized — please login"}), 401
            
        # Expecting JSON payload: { "resource_ids": ["id1", "id2", ...] }
        data = request.get_json() or {}
        resource_ids = data.get("resource_ids")
        
        # Fallback compatibility: if they passed a single string instead of a list
        if isinstance(resource_ids, str):
            resource_ids = [resource_ids]
            
        if not resource_ids or len(resource_ids) == 0:
            return jsonify({"message": "resource_ids array is required in request body"}), 400
            
        service = get_drive_service()
        gdrive_ids_to_delete = []
        successful_db_deletes = []
        failed_deletes = []

        # 1. Gather all Google Drive IDs first & check database records
        for r_id in resource_ids:
            resource = get_resource_by_resource_id(r_id)
            if resource and resource.gdrive_file_id:
                gdrive_ids_to_delete.append((r_id, resource.gdrive_file_id))
            else:
                failed_deletes.append({"resource_id": r_id, "reason": "Not found in database"})

        # 2. Delete from Google Drive safely
        for r_id, file_id in gdrive_ids_to_delete:
            try:
                # If your delete_file_from_drive handles exceptions, ensure it returns a boolean
                is_deleted = delete_file_from_drive(service, file_id)
                if is_deleted:
                    # 3. If removed from Drive, drop it from the MySQL database
                    if delete_resource_by_resource_id(r_id):
                        successful_db_deletes.append(r_id)
                    else:
                        failed_deletes.append({"resource_id": r_id, "reason": "Drive deleted, but DB removal failed"})
                else:
                    failed_deletes.append({"resource_id": r_id, "reason": "Google Drive rejected deletion"})
            except Exception as e:
                failed_deletes.append({"resource_id": r_id, "reason": f"Drive API Error: {str(e)}"})

        # 4. Return structured response summary
        return jsonify({
            "message": "Bulk deletion processing completed",
            "deleted_count": len(successful_db_deletes),
            "successful_ids": successful_db_deletes,
            "failed": failed_deletes
        }), 200

    except Exception as err:
        print(f"Error during execution: {err}")
        return jsonify({"message": f"Server processing failure: {err}"}), 500
    
# ------------------------populate initial form with meta data----------------------------------------
@library_bp.route("/api/resources/form_init",methods=["GET"])
def form_init():
    try:
        levels=db.session.query(Level.level_id,Level.level_name).order_by(Level.level_id).all()
        session_options=Question_Paper.session.type.enums
        resource_types=db.session.query(Resource_type.resource_type_id,
                        Resource_type.resource_name).order_by(Resource_type.resource_type_id).all()
        paper_options=Question_Paper.paper_number.type.enums
        return jsonify({"levels":[{"level_id":l.level_id,"level_name":l.level_name} for l in levels], 
                        "session_options":session_options,
                        "resource_types":[{"resource_type_id":r.resource_type_id,
                                           "resource_name":r.resource_name} for r in resource_types],
                        "paper_options":paper_options,
                        }),200
    except Exception as err :
        print("Error occurred: ",err)
        return jsonify({"message":f"Error occurred: {err}"}),500
    
# single and bulk resource locking and unlocking route
@library_bp.route("/api/resources/bulk_status", methods=["POST"])
def bulk_update_resource_status():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400

        resource_ids = data.get("resource_ids")
        target_status = data.get("status")  # Expects: "Approved", "Locked", or "Unlocked"

        if not resource_ids:
            return jsonify({"message": "No resource IDs provided"}), 400

        # Protect against spelling mistakes or random statuses from client modifications
        VALID_STATUSES = {"Approved", "Locked", "Unlocked"}
        if target_status not in VALID_STATUSES:
            return jsonify({"message": f"Invalid status. Must be one of {list(VALID_STATUSES)}"}), 400

        for resource_id in resource_ids:
            resource = db.session.get(Resource, resource_id)
            if resource:
                resource.status = target_status

        db.session.commit()
        return jsonify({"message": f"Resources successfully updated to {target_status}"}), 200

    except Exception as e:
        print("Server error occurred: ", e)
        return jsonify({"message": f"Server error occurred: {e}"}), 500
    
# ------------------------populating the update resources form----------------------
@library_bp.route("/api/resources/edit_form_init/<int:resource_id>", methods=["GET"])
def update_form_init(resource_id):
    try:
        resource = db.session.get(Resource, resource_id)
        if not resource:
            return jsonify({"message": "Resource not found"}), 404

        # ── Return only unified core resource configurations
        response = {
            "message":          "success",
            "resource_id":      resource.resource_id,
            "title":            resource.title,
            "author":           resource.author,
            "file_type":        resource.file_type,
            "resource_type_id": resource.resource_type_id,
            "status":           resource.status,
            "levels":           [{"level_id": resource.Rlevel.level_id, "level_name": resource.Rlevel.level_name}],
            "resources_types":  [{"resource_type_id": resource.ResourceTypes.resource_type_id, "resource_name": resource.ResourceTypes.resource_name}],
            "subject":          {"sub_id": resource.sub_id, "subject_name": resource.Rsubject.subject_name},
            "year":resource.exam_metadata.year if resource.exam_metadata else None,
            "session":resource.exam_metadata.session if resource.exam_metadata else None,
            "paper_number":resource.exam_metadata.paper_number if resource.exam_metadata else None
        }

        return jsonify(response), 200

    except Exception as e:
        print("Server error occurred: ", e)
        return jsonify({"message": f"Server error occurred: {e}"}), 500
    

# @library_bp.route("/api/resources/update/<int:resource_id>", methods=["PUT"])
# def update_resource(resource_id):
#     try:
#         if "user_id" not in flask_session:
#             return jsonify({"message": "Unauthorized — please login"}), 401

#         resource = db.session.get(Resource, resource_id)
#         if not resource:
#             return jsonify({"message": "Resource not found"}), 404

#         data = request.get_json()
#         if not data:
#             return jsonify({"message": "No data provided"}), 400

#         # ── Resolve models from database context records
#         level_row = db.session.get(Level, int(data.get("level_id")))
#         if not level_row:
#             return jsonify({"message": "Level not found"}), 404

#         subject_row = db.session.get(Subject, int(data.get("sub_id")))
#         if not subject_row:
#             return jsonify({"message": "Subject not found"}), 404

#         resource_type_row = db.session.get(Resource_type, int(data.get("resource_type_id")))
#         if not resource_type_row:
#             return jsonify({"message": "Resource type not found"}), 404

#         # ── Update primary base resource schema attributes only
#         resource.title            = data.get("title", resource.title)
#         resource.sub_id           = int(data.get("sub_id"))
#         resource.level_id         = int(data.get("level_id"))
#         resource.resource_type_id = int(data.get("resource_type_id"))
#         resource.author           = data.get("author", resource.author)
#         resource.description      = f"{resource.title} is a {level_row.level_name} {subject_row.subject_name} {resource_type_row.resource_name} written by {resource.author}"

#         # If a resource was stuck in 'Needs_Review', successfully promote it to active status
#         if resource.status == "Needs_Review":
#             resource.status = "Approved"
#             resource.review_reason = None

#         db.session.commit()
#         return jsonify({"message": "Resource updated successfully", "resource_id": resource.resource_id}), 200

#     except Exception as e:
#         db.session.rollback()
#         print("update_resource error:", e)
#         return jsonify({"message": f"Server error: {e}"}), 500

# ---------------get meta data for subject by level id ----------------
@library_bp.route("/api/subjects", methods=["GET"])
def get_subjects():
    try:
        level_id = request.args.get("level_id")
        if not level_id:
            return jsonify({"message": "level_id is required"}), 400
        subjects = db.session.query(Subject.sub_id, Subject.subject_name)\
                     .filter(Subject.level_id == int(level_id))\
                     .order_by(Subject.subject_name).all()
        return jsonify({"subjects": [{"sub_id": s.sub_id, "subject_name": s.subject_name} for s in subjects]}), 200
    except Exception as err:
        return jsonify({"message": f"Error: {err}"}), 500                        
    
# ---------------------open a resource ----------------------
@library_bp.route("/api/resources/view",methods=["GET"])
def open_resource():
    try:
        if "user_id" not in flask_session:
            return jsonify({"message":"Unauthorized, please login"}),401
        resource_id=request.args.get("resource_id")
        if not resource_id:
            return jsonify({"message":"resource_id is required in query parameters"}),400
        view_url=db.session.query(Resource.gdrive_view_url).filter_by(resource_id=resource_id).scalar()
        if not view_url:
            return jsonify({"message":"Resource not found"}),404
        if not increment_resource_view_counts(resource_id):
            print(f"Failed to increment view count for resource_id: {resource_id}")
        return jsonify({"message":"Resource has been found","google_view_url": view_url}),200
    except Exception as e:
        return jsonify ({"message":f"Error occurred: {e}"}),500
    


# ------------download resource by resource_id ------------------
@library_bp.route("/api/resources/download",methods=["GET"])
def download_resource():
    try:
        if "user_id" not in flask_session:
            return jsonify({"message":"Unauthorized, please login"}),401
        resource_id=request.args.get("resource_id")
        if not resource_id:
            return jsonify({"message":"resource_id is required in query parameters"}),400
        resource=db.session.query(Resource.gdrive_download_url,Resource.title).filter_by(resource_id=resource_id).first()
        if not resource:
            print("Resource not found")
            return jsonify({"message":"Resource not found"}),404
        download_url,title=resource
        if not increment_resource_download_counts(resource_id):
            print(f"Failed to increment download count for resource_id: {resource_id}")    
        return jsonify({"success":True,"download_url":download_url,"filename":f"{title}"}),200
    except Exception as e:
        return jsonify({"message":f"Download error occurred {e}"}),500
    
# ------------------share resource on whatsapp----------------------
@library_bp.route("/api/resources/share", methods=["GET"])
def share_resource():
    try:
        resource_id = request.args.get("resource_id")
        if not resource_id:
            return jsonify({"message": "resource_id is required in query parameters"}), 400
            
        # Querying by the resource primary key
        resource = db.session.query(Resource).filter(Resource.resource_id == resource_id).first()
        if not resource:
            return jsonify({"message": "Resource not found"}), 404
            
        # Extract metadata strings
        level = resource.Rlevel.level_name
        subject_name = resource.Rsubject.subject_name  
        resource_type_name = resource.ResourceTypes.resource_name
        resource_title = resource.title
        cover_image_url = resource.cover_image

        # 1. Get safe emoji fallback assignment
        subject_emoji = SUBJECT_IMOJIS.get(subject_name, '📚')

        # 2. Extract stats safely 
        file_size = resource.file_size if resource.file_size else 'Optimized PDF'
        downloads_count = resource.download_count if resource.download_count is not None else 120

        # 3. ENCRYPT THE ID 
        masked_code = hash_encoder.encode(int(resource_id))

        # 4. Construct the clean message string
        # This keeps spaces and characters pristine before encoding
        bot_message = f"Unlock {resource_title} IQ-ID-{masked_code}"
        
        # This converts spaces to %20 and special characters to percentages
        encoded_bot_message = quote(bot_message)
        
        # Combine it into your short bot URL string
        bot_url = f"https://wa.me/213551935694?text={encoded_bot_message}"

       # 5. Format the high-impact advertisement card message
        DEFAULT_COVER_URL = "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600&auto=format&fit=crop"
        header_image = cover_image_url if cover_image_url else DEFAULT_COVER_URL

        # Dynamic Call to Action instruction depending on the layout structure
        if cover_image_url:
            # Layout matching Image 1: Real media card, NO green button
            cta_instruction = "👇 *Click the link below, then press SEND:* "
        else:
            # Layout matching Image 2: Link preview card, WITH green button
            cta_instruction = "👇 *Click 'Start chatting' or the link below, then press SEND:* "

        raw_message = (
            f"{subject_emoji} *NEW {resource_type_name.upper()} ALERT* 🚨⚠️\n"
            f"🔥 _Join over {downloads_count} students revising this {subject_name.title()} {resource_type_name.title()} this week!_\n\n"
            f"📝 *Subject:* {subject_name.title()}\n"
            f"🎓 *Level:* {level.title()} Level\n"
            f"🏷️ *Type:* {resource_type_name.title()}\n"
            f"📂 *Title:* `{resource_title}`\n"
            f"💾 *Size:* {file_size}\n"
            f"📥 *Downloads:* {downloads_count} shared\n\n"
        )

        # Append optional Question Paper / Marking Scheme parameters
        if resource_type_name.lower() in ["question paper", "question papers", "marking scheme", "marking schemes"]:
            if resource.exam_metadata:
                qp = resource.exam_metadata
                if qp.year or qp.session or qp.paper_number:
                    raw_message += f"📅 *Year:* {qp.year if qp.year else 'N/A'}\n"
                    raw_message += f"⏳ *Session:* {qp.session if qp.session else 'N/A'}\n"
                    raw_message += f"🔢 *Paper:* {qp.paper_number if qp.paper_number else 'N/A'}\n\n"
                    
        # Final Call to Action block using our dynamic text variable
        raw_message += (
            f"{cta_instruction}\n"
            f"⚡ {bot_url} ⚡\n\n"
            f"Forward this to your study groups and smash your exams together! 📈🎓"
        )
        # Return raw message and clean header image straight to your Baileys execution loop
        encoded_advertisement = quote(raw_message)
        testing_whatsapp_url = f"https://wa.me/?text={encoded_advertisement}"

        return jsonify({
            "message": "Success",
            "header_image": header_image, 
            "share_text": raw_message,
            "testing_whatsapp_url": testing_whatsapp_url 
        }), 200
    except Exception as err:
        print("Error occurred: ", err)
        return jsonify({"message": f"Server Error occurred: {str(err)}"}), 500
    



# ----------Route that load the table for resource -------
from sqlalchemy import select, func, case

@library_bp.route("/api/resources", methods=["GET"])
def fetchResources():
    try:
        # 1. Fetch the aggregated statistics (Always returns 1 row with counts, never empty)
        stats_stmt = select(
            func.count().label("total_uploads"),
            func.count(case((Resource.level_id == 1, 1))).label("grade_7_uploads"),
            func.count(case((Resource.level_id == 2, 1))).label("olevel_uploads"),
            func.count(case((Resource.level_id == 3, 1))).label("alevel_uploads")
        )
        
        # Use .mappings().fetchone() to read columns cleanly by name
        stats_row = db.session.execute(stats_stmt).mappings().fetchone()
        
        # 2. Fetch all individual resources
        resources = db.session.query(Resource).all()
        if not resources:
            return jsonify({"message": "No resources found"}), 404

        # 3. Combine stats and individual items into ONE single JSON response
        return jsonify({
            "message": "Resources Found",
            "stats": {
                "total_uploads": stats_row["total_uploads"],
                "grade_7_uploads": stats_row["grade_7_uploads"],
                "olevel_uploads": stats_row["olevel_uploads"],            
                "alevel_uploads": stats_row["alevel_uploads"]
            },
            "resources": [
                {
                    "id": r.resource_id,
                    "resourceType": r.ResourceTypes.resource_name if r.ResourceTypes else "Unknown",
                    "title": r.title,
                    "size": r.file_size,
                    "downloads": r.download_count,
                    "uploadedBy": r.Rusers.username if r.Rusers else "Unknown",
                    "subjectCat": r.Rsubject.categories.category_name if r.Rsubject and r.Rsubject.categories else "Unknown",
                    "subject": r.Rsubject.subject_name if r.Rsubject else "Unknown",
                    "level": r.Rlevel.level_name if r.Rlevel else "Unknown",
                    "uploadDate": r.uploaded_at.isoformat() if r.uploaded_at else None,
                    "status": r.status
                } for r in resources
            ]
        }), 200

    except Exception as err:
        print("Error fetching resources:", err)
        return jsonify({"message": f"Database error occurred: {str(err)}"}), 500


if __name__=="__main__":
    from flask import Flask
    from models import db
    from  flask_cors import CORS
    from config import Config
    test_app=Flask(__name__)
    test_app.config.from_object(Config)
    db.init_app(test_app)
    CORS(test_app)
    test_app.register_blueprint(library_bp)
    test_app.run (host="0.0.0.0",port=8000,debug=True)