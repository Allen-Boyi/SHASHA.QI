from werkzeug.utils import secure_filename
from urllib.parse import quote
import cloudinary
import requests
from cloudinary import exceptions, uploader
from cloudinary.utils import cloudinary_url
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build
from googleapiclient.http import HttpError
from flask import (Flask,Blueprint,request,current_app,send_file,jsonify)
from flask import session as flask_session
from models import (db,Resource,Resource_type,RolePermission,Level,SubjectCategory,Subject,Usage_stat,
                    Ai_Query,Alert,Whatsappbot_user,User,Wuser_activity,Question_Paper
                    )
from config import Config
import jwt
from datetime import datetime, timedelta,timezone
from helper_functions import (clean_filename, SUBJECT_IMOJIS, subject_nomalization )
library_bp=Blueprint("library_bp",__name__)


def get_drive_service(level: str = None):
    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    creds = service_account.Credentials.from_service_account_info(
        Config.GOOGLE_INFO,
        scopes=SCOPES
    )
    service = build('drive', 'v3', credentials=creds)
    return service

# Then when you call it:
 
def get_or_create_folder(service, Level, Subject, ResourceType, Year=None, Sessions=None):
   level_folder_id=get_and_create_folder(service,Level,parent_id=None)
   subject_folder_id=get_and_create_folder(service,Subject,parent_id=level_folder_id)
   ResourceType_folder_id=get_and_create_folder(service,ResourceType,parent_id=subject_folder_id)

   if ResourceType.lower() in ["question paper", "marking scheme", "question papers", "marking schemes"]:
        current_folder_id=ResourceType_folder_id
        Year_folder_id=get_and_create_folder(service,Year,parent_id=current_folder_id)
        session_folder_id=get_and_create_folder(service,Sessions,parent_id=Year_folder_id)
        return session_folder_id
   return ResourceType_folder_id

def get_and_create_folder(service,folder_name,parent_id=None):
    try:
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder'"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        results = service.files().list(q=query, fields="files(id, name)").execute()
        items = results.get('files', [])
        if items:
            print(f"Folder '{folder_name}' already exists with ID: {items[0]['id']}")
            return items[0]['id']
        else:
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
            }
            if parent_id:
                file_metadata['parents'] = [parent_id]
            folder = service.files().create(body=file_metadata, fields='id').execute()
            print(f"Folder '{folder_name}' created with ID: {folder.get('id')}")
            return folder.get('id')
    except HttpError as error:
        print(f"An error occurred while searching for folder '{folder_name}': {error}")
        return None
    except Exception as e:
        print("Error occurred while searching for folder: ",e)
        return None

def search_for_pdf_in_drive(service, file_name, parent_id=None):
    """
    Searches for a specific PDF file in Google Drive.
    Returns the file ID if found, otherwise returns None.
    """
    try:
        # Securely escape single quotes in file names to prevent query syntax breaks
        safe_file_name = file_name.replace("'", "\\'")
        
        # Construct query with correct spacing
        query = f"name = '{safe_file_name}' and mimeType = 'application/pdf' and trashed = false"
        if parent_id:
            query += f" and '{parent_id}' in parents"
            
        # Execute list request limiting fields to just what we need
        results = service.files().list(
            q=query, 
            fields="files(id, name)", 
            pageSize=1
        ).execute()
        
        items = results.get('files', [])
        
        if items:
            print(f"File '{file_name}' found with ID: {items[0]['id']}")
            return items[0]['id']
        
        print(f"File '{file_name}' not found in Drive.")
        return None

    except HttpError as error:
        print(f"Google Drive API Error while searching for '{file_name}': {error}")
        return None
    except Exception as err:
        print(f"Unexpected system error while searching for file: {err}")
        return None
# Deleting a file from google drive by file id
def delete_file_from_drive(service,file_id):
    try:
        service.files().delete(fileId=file_id).execute()
        print(f"File with ID {file_id} has been deleted from Google Drive.")
        return True
    except HttpError as error:
        print(f"Google Drive API Error while deleting file with ID {file_id}: {error}")
        return False
    except Exception as err:
        print(f"Unexpected system error while deleting file: {err}")
        return False

# --------Upload a resource to google drive 
@library_bp.route("/upload_init",methods=["GET","POST"])
def upload_resource():
    try:
        service = get_drive_service() 
        data=request.json
        title=data.get("title")
        file_size=data.get("file_size")
        session=data.get("session")
        year=data.get("year")
        paper_number=data.get("paper_number")
        author=data.get("author","Unknown")
        sub_id=int(data.get("sub_id"))
        level_id=int(data.get("level_id"))
        resource_type_id=int(data.get("resource_type_id"))
        level_name=data.get("level_name")
        subject_name=data.get("subject_name")
        resource_name=data.get("resource_name")
        logged_in_user_id=flask_session.get("user_id")
        file_type=data.get("file_type","PDF")
        if not logged_in_user_id:   
            print("Your are not logged in please login")
            return jsonify({"message":"unauthorized please login to have access"}),401
        upload_by=logged_in_user_id
        description=f"{title} is an {level_name} {subject_name} {resource_name} written by {author if author.strip() else 'Unknown Author'} "
        # For question papers:
        required_fields_question_paper = [
            'title', 'paper_number', 'session', 'year', 
            'resource_type_id', 'level_id', 'sub_id'
        ]

        # For other resources:
        required_fields_other = [
            'title', 'resource_type_id', 'level_id', 'sub_id'
        ]

        # Then check based on resource_type
        if resource_name.lower() in ["question paper","question papers","marking scheme","marking schemes"]:
            missing = [f for f in required_fields_question_paper if not data.get(f)]
        else:
            missing = [f for f in required_fields_other if not data.get(f)]
        if missing:
            print("Missing fields which are: ",missing)
            return jsonify({"missing":f"Missing fields which are: {missing}"}),400
        
        if resource_name.lower() in ["question paper","question papers"]:
            existing_resource=db.session.query(Resource).join(Resource_type,Resource_type.resource_type_id==Resource.resource_type_id).join(Question_Paper,
                                        Question_Paper.resource_id==Resource.resource_id).filter(Resource.title==title,
                                                    Resource.level_id==level_id,
                                                    Resource.sub_id==sub_id,
                                                    Question_Paper.year==year,    
                                                    Question_Paper.paper_number==paper_number,
                                                    Question_Paper.session==session).first() 
            
            if existing_resource:
                print(f"{existing_resource.ResourceTypes.resource_name} is already uploaded")
                return jsonify({"message":f"{existing_resource.ResourceTypes.resource_name} has already uploaded"}),400
        
        elif resource_name.lower() in ["marking schemes","marking scheme"]:
            existing_resource=db.session.query(Resource).join(Resource_type,Resource_type.resource_type_id==Resource.resource_type_id).join(
                                                            Question_Paper,Question_Paper.marking_scheme_id==Resource.resource_id).filter(
                                                                Resource.title==title,
                                                                Resource.sub_id==sub_id,
                                                                Resource.level_id==level_id,
                                                                Question_Paper.year==year,
                                                                Question_Paper.session==session,
                                                                Question_Paper.paper_number==paper_number
                                                            ).first()
            if existing_resource:
                print(f"{existing_resource.ResourceTypes.resource_name} has already uploaded")
                return jsonify({"message":f"{existing_resource.ResourceTypes.resource_name} has already uploaded"}),400

        else:
            existing_resource=db.session.query(Resource).join(Resource_type,
                                                        Resource_type.resource_type_id==Resource.resource_type_id).filter(
                                                        Resource.level_id==level_id,
                                                        Resource.sub_id==sub_id,Resource.title==title).first()
            if existing_resource:
                print(f"{existing_resource.ResourceTypes.resource_name} is already uploaded")
                return jsonify({"message":f"{existing_resource.ResourceTypes.resource_name} has already uploaded"}),400 
            
        target_folder_id=get_or_create_folder(service=service,Level=level_name,Subject=subject_name,
                                       ResourceType=resource_name,Year=year,Sessions=session)
        if not target_folder_id:
            return jsonify({"message":"Failed to create or find target folder in Google Drive"}),500
        
        # encoding the payload for the file to be uploaded
        try:
            service._http.credentials.refresh(GoogleRequest())
            token = service._http.credentials.token  
            expiration_time = datetime.now(timezone.utc) + timedelta(hours=1)
            jwt_payload = {
                "exp": expiration_time,
                "iat": datetime.now(timezone.utc),
                "folder_id": target_folder_id,
                "metadata": {
                    "title": title,
                    "description": description,
                    "author":author,
                    "paper_number":paper_number,
                    "file_size":file_size,
                    "session":session,
                    "year":year,
                    "level_id":level_id,
                    "sub_id":sub_id,
                    "resource_type_id":resource_type_id,
                    "uploaded_by":upload_by,
                    "resource_name":resource_name,
                    "file_type":file_type
                }
            }
            upload_metadata={
                "name":f"{title}.pdf",
                "parents":[target_folder_id]
            }
           
            request_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable"
            headers = {
                "Authorization": f"Bearer {service._http.credentials.token}",
                "Content-Type": "application/json;charset=UTF-8",
                "X-Upload-Content-Type": "application/pdf",
            }   

            
            resumable_resp = requests.post(request_url, headers=headers, json=upload_metadata)
             
            if resumable_resp.status_code != 200:
                raise Exception(f"Google rejected upload initialization: {resumable_resp.text}")
                
            # Google responds with the exact direct upload destination link in the headers
            direct_google_upload_url = resumable_resp.headers.get("Location")
            encoded_jwt=jwt.encode(jwt_payload,Config.JWT_SECRET_KEY,algorithm="HS256")
            return jsonify({"message":"File metadata encoded successfully","token":encoded_jwt,
                            "upload_url":direct_google_upload_url}),200
        except Exception as e:
            print("Error occurred while encoding the file: ",e)
            return jsonify({"message":f"Error occurred while encoding the file: {e}"}),500
    except Exception as err:
        print("Error occurred while connecting to database",err)
        return jsonify({"message":"Error occurred while communicating to the database server"}),500
    

#Uploading resource phase two the actual DB commit of IDs from google drive and resources metadata 
@library_bp.route("/upload_DB_commit",methods=["POST"])
def  upload_DB_commit():
    try:
        data=request.json
        payload_token=data.get("encoded_jwt")
        file_id=data.get("file_id")
        try:
            service = get_drive_service() 
            decoded_jwt=jwt.decode(payload_token,Config.JWT_SECRET_KEY,algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message":"Token has expired"}),401
        except jwt.InvalidTokenError:
            return jsonify({"message":"Invalid token"}),401

        metadata=decoded_jwt.get("metadata")
        folder_id=decoded_jwt.get("folder_id")


                # checking for duplicate in database 
        if  metadata is None:
            print("Nothing was sent")
            return jsonify({"message":"Empty payload was sent"}),400
        title=metadata.get("title")
        sub_id=metadata.get("sub_id")
        year=metadata.get("year")
        session=metadata.get("session")
        level_id=metadata.get("level_id")
        paper_number=metadata.get("paper_number")
        gdrive_folder_id=folder_id
        gdrive_file_id=file_id
        gdrive_view_url     = f"https://drive.google.com/file/d/{gdrive_file_id}/view?usp=sharing"
        gdrive_download_url = f"https://drive.google.com/uc?id={gdrive_file_id}&export=download"
        file_type=metadata.get("file_type")
        description=metadata.get("description")
        file_size=metadata.get("file_size")
        author=metadata.get("author")
        resource_type_id=metadata.get("resource_type_id")
        uploaded_by=metadata.get("uploaded_by")
        resource_name=metadata.get("resource_name")
        
        if resource_name.lower() in ["question papers","question paper"]:
            existing_resource=db.session.query(Resource).join(Resource_type,
                Resource_type.resource_type_id==Resource.resource_type_id).join(
                Question_Paper,Question_Paper.resource_id==Resource.resource_id).filter(
                    Resource.title==title,
                    Resource.level_id==level_id,
                    Resource.sub_id==sub_id,
                    Question_Paper.year==year,
                    Question_Paper.session==session,
                    Question_Paper.paper_number==paper_number
                ).first()
            if existing_resource:
                delete_file_from_drive(service, gdrive_file_id)
                print(f"{existing_resource.ResourceTypes.resource_name} already uploaded")
                return jsonify({"message":f"{existing_resource.ResourceTypes.resource_name} already uploaded"}),400
        elif resource_name.lower() in ["marking scheme","marking schemes"]:
            existing_paper=db.session.query(Resource).join(Resource_type,
                                               Resource_type.resource_type_id==Resource.resource_type_id).join(
                                               Question_Paper,Question_Paper.marking_scheme_id==Resource.resource_id).filter(
                                                       Resource.title==title,
                                                       Resource.sub_id==sub_id,
                                                       Resource.level_id==level_id,
                                                       Question_Paper.year==year,
                                                       Question_Paper.session==session,
                                                       Question_Paper.paper_number==paper_number
                                                   ).first()
            if  existing_paper:
                delete_file_from_drive(service, gdrive_file_id)
                print(f"{existing_paper.ResourceTypes.resource_name} already uploaded")
                return jsonify({"message":f"{existing_paper.ResourceTypes.resource_name} already uploaded"}),400
        else: 
            existing_resource=db.session.query(Resource).join(Resource_type,
                                        Resource_type.resource_type_id==Resource.resource_type_id).filter(
                                        Resource.title==title,
                                        Resource.level_id==level_id,
                                        Resource.sub_id==sub_id).first()
            if existing_resource:
                delete_file_from_drive(service, gdrive_file_id)
                print(f"{existing_resource.ResourceTypes.resource_name} already uploaded")
                return jsonify({"message":f"{existing_resource.ResourceTypes.resource_name} already uploaded"}),400
        
        is_inDrive=search_for_pdf_in_drive(service,f"{title}.pdf",gdrive_folder_id)
        if is_inDrive is None:
            print(f"File '{title}' has not been added to the Drive")
            return jsonify({"message":f"File '{title}' has not been uploaded to Drive"}),400
        
       
        new_resource=Resource(title=title,
                              sub_id=sub_id,
                              level_id=level_id,
                              gdrive_folder_id=gdrive_folder_id,
                              gdrive_download_url=gdrive_download_url, 
                              file_size=file_size,
                              gdrive_view_url=gdrive_view_url,
                              gdrive_file_id=gdrive_file_id,
                              file_type=file_type,
                              author=author,
                              description=description,
                              resource_type_id=resource_type_id,
                              uploaded_by=uploaded_by
                              )
        db.session.add(new_resource)
        db.session.flush()
        if resource_name.lower() in ["question papers","question paper"]:
            new_paper=Question_Paper(resource_id=new_resource.resource_id,
                                     session=session,
                                     year=year,
                                     paper_number=paper_number
                                     )
            db.session.add(new_paper)
        elif resource_name.lower() in ["marking schemes","marking scheme"]:
            existing_paper=db.session.query(Question_Paper).join(Resource,Resource.resource_id==Question_Paper.resource_id).filter(  
                                                        Resource.level_id==level_id,
                                                        Resource.sub_id==sub_id,
                                                        Question_Paper.year==year,
                                                        Question_Paper.session==session,
                                                        Question_Paper.paper_number==paper_number      
                                                        ).first()
            if not existing_paper:
                db.session.rollback()                        # ← clean up pending transaction
                delete_file_from_drive(service, gdrive_file_id)  # ← clean up Drive
                return jsonify({"message": "Associated question paper not found"}), 400
            existing_paper.marking_scheme_id=new_resource.resource_id
        db.session.commit()
        print(f"The resource has been successfully save with ID={new_resource.resource_id}, title={new_resource.title},google view url={new_resource.gdrive_view_url} ")
        return jsonify({"message":f"The resource has been successfully save with ID={new_resource.resource_id}, title={new_resource.title}, google view url={new_resource.gdrive_view_url} "}) ,200
    except Exception as err:
        db.session.rollback()
        print("Error occurred while trying to communicate to the database ",err)
        return jsonify({"message":f"Error occurred while trying to communicate to the database {err}"}),500

@library_bp.route("/delete",methods=["POST"])
def delete_resource():
    try:
        logged_in_user_id = flask_session.get("user_id")
        if not logged_in_user_id:
            return jsonify({"message": "Unauthorized — please login"}), 401
        service=get_drive_service()
        data=request.json
        resource_id=data.get("resource_id")
        file_id=data.get("file_id")
        is_deleted=delete_file_from_drive(service,file_id)
        if not is_deleted :
            print("The resource has not been delete")
            return jsonify ({"message":"The resource has not been delete"}),400
        if delete_resource_by_resource_id(resource_id):
            return jsonify({"message":"successfully deleted from Cloud and Database"}),200
        return jsonify({"message":"Failed to delete from database"}),500
    except Exception as err:
        print("Error while communicating to database")
        return jsonify({"message":f"Error while connecting to databases {err}"}),500

# The database helper function to get resources by level and subject
# """""""""""""""""Delete resource by ID """""""""""""""""""""""
def delete_resource_by_resource_id(resource_id):
    try:
        resource = Resource.query.get(resource_id)
        if not resource:
            return False

        # If this resource is a question paper — delete the question_paper row too
        if resource.question_paper:
            db.session.delete(resource.question_paper)

        # If this resource is a marking scheme — unlink it from its paper
        if resource.is_marking_scheme_for:
            resource.is_marking_scheme_for.marking_scheme_id = None

        db.session.delete(resource)
        db.session.commit()
        print("Deletion succeeded")
        return True

    except Exception as e:
        db.session.rollback()
        print(f"Deletion error: {e}")
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
        resource=db.session.get(Resource,resource_id)
        if resource:
            print("The resource is: ",resource)
            return resource
        return None
    except Exception as e:
        print("Error occurred:",e)
        return None
    
# ----------------Increase view and download counts functions---------------
def increment_resource_view_counts(resource):
    try:
        resource.view_count=resource.view_count +1
        db.session.commit()
        print(f"View count incremented to {resource.resource_id}.Total: {resource.view_count}")
        return True
    except Exception as e:
        print("Error occurred: ",e)
        return False
    
def increment_resource_download_counts(resource):
    try:
        resource.download_count=resource.download_count +1
        print(f"Download count incremented to {resource.resource_id}.Total: {resource.download_count}")
        db.session.commit()
        return True
    except Exception as e:
        print("Error Occurred:",e)
        return False   

@library_bp.route("/",methods=["GET"])
def get_resources():
    resources=Resource.query.all()
    return jsonify([{"id": resource.resource_id,"name": resource.title,"description": resource.description,
                     "url": resource.cloudinary_url,"resource_type": resource.resource_type_id,
                     "subject_category": resource.sub_id} for resource in resources])

# --------------Uploading a Resource -----------------
# @library_bp.route("/api/UploadResource",methods=["POST"])
# def uploadResource():
#     try:
#         file_upload=request.files.get("file_upload")
#         cloudinary_url=data.get("cloudinary_url")
#         cloudinary_public_id=data.get("cloudinary_public_url")
#         file_size=data.get("file_size")
#         cover_image=data.get("cover_image")
#         session=data.get("session")
#         years=data.get("years")
#         paper_number=data.get("paper_number")
#         author=data.get("author","Unknown")
#         sub_id=int(data.get("sub_id"))
#         level_id=int(data.get("level_id"))
#         resource_type_id=int(data.get("resource_type_id"))
#         level_name=data.get("level_name")
#         subject_name=data.get("subject_name")
#         resource_name=data.get("resource_name")
#         logged_in_user_id=session.get("user_id")
#         if not logged_in_user_id:
#             print("Your are not logged in please login")
#             return jsonify({"message":"unauthorized please login to have access"}),401
#         upload_by=logged_in_user_id
#         if file_upload:
#             title=file_upload.filename.rsplit(".",1)[0]
#             title=clean_filename(title)
#             title=secure_filename(title)
#         file_type=file_upload.filename.rsplit(".",1)[-1].upper() if "." in file_upload.filename else "PDF"
#         description=f"{title} is an {level_name} {subject_name} {resource_name} written by {author if author.strip() else 'Unknown Author'} "
            
        
#         required_fields=['title','cloudinary_url','cloudinary_public_url',
#                          'resource_type_id','uploaded_by','level_id',"sub_id"]
#         missing_fields=[fields for fields in required_fields if not data.get(fields)]
#         if missing_fields:
#             print("Missing fields which are: ",missing_fields)
#             return jsonify({"missing":f"Missing fields which are: {missing_fields}"}),400
#         upload_result=uploader.upload(title,folder="library_books",
#                                                     resource_type="auto",
#                                                     public_id=title,
#                                                     overwrite=False,
#                                                     unique_filename=True,
#                                                     tags=[level_name,"English"])
#         cloudinary_url=upload_result.get("secure_url")
#         cloudinary_public_id=upload_result.get("public_id")
#         file_size=round(upload_result.get("bytes")/(1024*1024),2)
#         new_resource=Resource(title=title,description=description,cloudinary_public_id=cloudinary_public_id,
#                               cloudinary_url=cloudinary_url,file_size=file_size,file_type=file_type,cover_image=cover_image,
#                               session=session,years=years,paper_number=paper_number,author=author,sub_id=sub_id,
#                               upload_by=upload_by,level_id=level_id,resource_type_id=resource_type_id)
        
#         db.session.add(new_resource)
#         db.session.commit()
#         print(f"The resource has been successfully save with ID={new_resource.resource_id}, title={new_resource.title}, cloudinary url={new_resource.cloudinary_url} ")
#         return jsonify({"message":f"The resource has been successfully save with ID={new_resource.resource_id}, title={new_resource.title}, cloudinary url={new_resource.cloudinary_url} "})  
#     except cloudinary.cloudinary.exceptions.Error as cloud_err:
#         print("Cloud error occurred: ",cloud_err)
#         return jsonify({"message":f"Cloudinary error occurred {cloud_err}"})       
#     except Exception as e:
#         db.session.rollback()
#         print(f"Error occurred: {e}")
#         return jsonify({"message":f"Error occurred: {e}"})

# '''''''''''''''''''''''''view resources lists'''''''''''''''''''''''
@library_bp.route("/api/view_resources/<int:level_id>/<int:resource_type_id>/<int:sub_id>",methods=["GET"])
def view_resources(level_id,resource_type_id,sub_id):
    try:
        resources=get_resources_by_level_and_subject(level_id,resource_type_id,sub_id)
        if resources is None:
            return jsonify({"message":"No resources found for the given criteria"}),404
        return jsonify({"message":"Resources list found","resources":[{"resource_id":r.resource_id,"title":r.title,
                        "description":r.description,"downloads":r.download_count,"views":r.view_count,
                        "sub_id":r.sub_id,"level_id":r.level_id,"resource_type_id":r.resource_type_id,
                        "author":r.author,"session":r.session if r.session else None,"file_size":r.file_size,
                        "file_type":r.file_type,"paper_number":r.paper_number if r.paper_number else None,
                        "years":r.years}for r in resources]}),200
    except Exception as e:
        print("Error occurred",e)
        return jsonify({"message":f"Error occurred {e}"}),500   
    
# ------------------------populate initial form with meta data----------------------------------------
@library_bp.route("/api/form_init",methods=["GET"])
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

# ------------------------populating the update resources form----------------------
@library_bp.route("/api/update_form-init/<int:resource_id>",methods=["GET"])
def update_form_init(resource_id):
    try:
        resource=get_resource_by_resource_id(resource_id)
        if not resource:
            return jsonify({"message":"Resource not found"}),404
        levels=db.session.query(Level.level_id,Level.level_name).order_by(Level.level_id).all()
        session=Resource.session.type.enums
        resource_types=db.session.query(Resource_type.resource_type_id,
                            Resource_type.resource_name).order_by(Resource_type.resource_type_id).all()
        paper_options=Resource.session.type.enums
        return jsonify({"message":"success","levels":[{"level_id":l.level_id,
                "level_name":l.level_name} for l in levels],
                "session_options":session,
                "resources_types":[{"resource_type_id":r.resource_type_id ,
                                            "resource_name":r.resource_name} for r in resource_types],
                "paper_options":paper_options,
                "resource_id":resource.resource_id,"title":resource.title,
                "description":resource.description,"downloads":resource.download_count,
                "views":resource.view_count,"resource_type_id":resource.resource_type_id,
                "sub_id":resource.sub_id,"level_id":resource.level_id,
                "author":resource.author,"session":resource.session if resource.session else None,
                "file_type":resource.file_type,"file_size":resource.file_size,
                "paper_number":resource.paper_number.value if resource.paper_number else None,
                "years":resource.years
                        }),200
    except Exception as e:
        print("Server error occurred: ",e)
        return jsonify  ({"message":f"Server error occurred: {e}"})
    
# ---------------get meta data for subject by level id ----------------
@library_bp.route("/api/subjects",methods=["GET"])
def get_subjects_by_level():
    try:
        level_id=request.args.get("level_id")
        if not level_id:
            print("No level has been selected")
            return jsonify({"message":"No Level has been selected"})
        level_id=int(level_id)
        subjects=db.session.query(Subject).filter(Subject.level_id==level_id).all()
        print("The subject is: {subject.subject_name} Subject code{subject.subject_code}")
        return jsonify({"message":"Success subjects found","subjects":[{"id":s.sub_id, "subject_name":s.subject_name,"subject_code":s.subject_code,
                        "subject_type":s.subject_Type,"category_id":s.category_id,"level_id":s.level_id,
                        "Syllabus_Board":s.syllabus_board} for s in subjects]}),200
    except Exception as e:
        print("Error occurred: ",e)
        return jsonify({"message":f"Error occurred: {e}"}),500

# ---------------------open a resource ----------------------
@library_bp.route("/api/open_resource/<int:resource_id>",methods=["GET"])
def open_resource(resource_id):
    try:
        resource=get_resource_by_resource_id(resource_id)
        if resource :
            data=resource.to_dict()
            data['cloudinary_url']=resource.cloudinary_url
            if increment_resource_view_counts(resource):
                print("Increment successfully")
            else:
                print("Increment failed")
            return jsonify({"message":"The resource has been found","resource":data}),200
        return jsonify({"message":"Resource has not been found"}),404
    except Exception as e:
        return jsonify ({"message":f"Error occurred: {e}"}),500
    
# --------------------download resource-------------------------
# @library_bp.route("/api/delete_resource/<int:resource_id>",methods=["DELETE"])
# def delete_resource(resource_id):
#     try:
#         resource=get_resource_by_resource_id(resource_id)
#         if not resource:
#             return jsonify({"message":"Resource not found in data base"}),404
#         public_id=resource.cloudinary_public_id
#         if public_id:
#             cloudinary_result=uploader.destroy(public_id,resource_type="image")
#             if cloudinary_result.get("result") not in ["ok","not found"]:
#                 return jsonify({"message":"Cloudinary deletion failed.Record Reserved."}),400
#         if delete_resource_by_resource_id(resource_id):
#             return jsonify({"message":"successfully deleted from Cloud and Database"}),200
#         return jsonify({"message":"Failed to delete from database"}),500
#     except Exception as e:
#         print("Error occurred: ",e)
#         return jsonify({"message":f"Server error Occurred: {e}"}),500

# ------------download resource by resource_id ------------------
# @library_bp.route("/api/download_resource/<int:resource_id>",methods=["GET"])
# def download_resource(resource_id):
#     try:
#         resource=get_resource_by_resource_id(resource_id)
#         if resource is None:
#             return jsonify({"message":"Resource not found"}),404
#         if increment_resource_download_counts(resource):
#             print("Download successfully")
#         else:
#             print("Failed to increment Downloads")
#         url=resource.cloudinary_url
#         if "cloudinary.com" in url and "fl_attachment" not in url:
#             url=url.replace("/upload","/upload/fl_attachment")
#         return jsonify({"success":True,"download_url":url,"filename":f"{resource.title}.{resource.file_type}"}),200
#     except Exception as e:
#         return jsonify({"message":f"Download error occurred {e}"}),500
    
# # ----------------------------share route----------------------------
# @library_bp.route("/api/share_resource/<int:level_id>/<int:resource_type_id>/<int:sub_id>",methods=["GET"])
# def share_resource(level_id,resource_type_id,sub_id):
#     try:
#         level=db.session.query(Level).filter(level_id==level_id).all()
#         resource_type=Resource_type.query.get(resource_type_id)
#         subject=Subject.query.get(sub_id)
#         if not all([level,resource_type,subject]):
#             return jsonify({"message":"One or more categories not found"}),404
#         if subject.subject_name in SUBJECT_IMOJIS:
#             subject_emoji=SUBJECT_IMOJIS.get(subject.subject_name,'📚')
#         link=f"{Config.WEBSITE_URL}/api/view_resources/<int:level_id>/<int:resource_type_id>/<int:sub_id>"
#         raw_message=f"""{subject_emoji}*Check out these {subject.subject_name.title()} {resource_type.resource_name} on our site!*{subject_emoji}\n\n "
#                     f"Subject: {subject.title()}\n"
#                     f"Level: {level.title()} Level\n\n"
#                     f"👇 Click the link below to view:\n"
#                     f"{link}"
#                     """        
#         encoded_message=quote(raw_message)
#         whatsapp_url=f"http://wa.me/?text={encoded_message}"
#         return jsonify({"message":"Success","whatsapp_url":whatsapp_url}),200
#     except Exception as err:
#         print("Error occurred: ",err)
#         return jsonify({"message":f"Server Error occurred:{err}"}),500
    
# @library_bp.route("/api/edit_resource/<int:resource_id>",methods=["PUT"])
# def edit_resource(resource_id):
#     try:
#         resource=Resource.query.get(resource_id)
#         if not resource :
#             print("resource not found: ")
#             return jsonify({"message":"Resource not found"}),404
#         data=request.json
#         resource.title=(data.get("title")or " ").strip() or resource.title
#         resource.description=(data.get("description")or  " ").strip() or resource.description
#         resource.author=(data.get("author") or " ").strip() or resource.author
#         resource.paper_number=(data.get("paper_number")or " ").strip() or (resource.paper_number)
#         new_sub_id=data.get("sub_id")
#         if new_sub_id is not None and str(new_sub_id).isdigit():
#             resource.sub_id=int(new_sub_id) or resource.sub_id
#         new_resource_type_id=data.get("resource_type_id")
#         if new_resource_type_id is not None and str(new_resource_type_id).isdigit():
#             resource.resource_type_id=int(new_resource_type_id) or resource.new_resource_type_id
#         new_level_id=data.get("level_id")
#         if new_level_id is not None and str(new_level_id).isdigit():
#             resource.level_id=int(new_level_id) or resource.level_id
#         new_years=data.get("years")
#         if new_years is not None and str(new_years).isdigit():
#             resource.years=int(new_years) or resource.years
#         db.session.commit()
#         print("Resource has been Updated ")
#         return jsonify({"message":"Resource has been updated successfully"}),200
#     except Exception as err:
#         db.session.rollback()
#         print("Error occurred: ",err)
#         return jsonify ({"message":f"Server error occurred: {err}"}),500

# ----------Route that load the table for resource -------
@library_bp.route("/api/resources",methods=["GET"])
def fetchResources ():
    try:
        resources=db.session.query(Resource).all()
        if not resources:
            print("No book found: ")
            return jsonify({"message":"No resources found"}),404
        return jsonify({"message":"Resources Found","resources":[{"id":r.resource_id,"subjectType":r.ResourceTypes.resource_name,
                                                                  "title":r.title,"size":r.file_size,"downloads":r.download_count,
                                                                  "uploadedBy":r.Rusers.username,"subjectCat":r.Rsubject.categories.category_name,
                                                                  "subject":r.Rsubject.subject_name,"level":r.Rlevel.level_name,
                                                                  "uploadDate":r.uploaded_at,"status":r.status
                                                                  }for r in resources]})
    except Exception as err:
        print("No resource has been Found",err)
        return jsonify({"message":"Database error occurred"}),500

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
