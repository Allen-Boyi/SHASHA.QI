import os
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request 
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from config import Config

def normalize(name: str) -> str:
    name = name.strip().lower()
    if name.endswith("s") and len(name) > 2:
        name = name[:-1]
    return name

def get_drive_service():
    SCOPES = ["https://www.googleapis.com/auth/drive"]
    creds = None
    
    # 1. Grab token string from Config
    token_json_str = getattr(Config, "GOOGLE_TOKEN_JSON", None)
    
    if token_json_str:
        # If it's loaded as a JSON string, parse it; if already a dict, use directly
        token_data = json.loads(token_json_str) if isinstance(token_json_str, str) else token_json_str
        creds = Credentials.from_authorized_user_info(token_data, SCOPES)
        
    # 2. Local file fallback for development
    elif os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    else:
        raise FileNotFoundError("Google token not found in Config.GOOGLE_TOKEN_JSON or token.json file.")

    # 3. Refresh expired tokens in memory
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        
        # Only write to disk if running locally with a physical token.json file
        if not token_json_str and os.path.exists("token.json"):
            with open("token.json", "w") as f:
                f.write(creds.to_json())

    return build("drive", "v3", credentials=creds)
    
def delete_file_from_drive(service, file_id):
    try:
        service.files().delete(fileId=file_id, supportsAllDrives=True).execute()
        print(f"File with ID {file_id} has been deleted from Google Drive.")
        return True
    except HttpError as error:
        print(f"Google Drive API Error while deleting file with ID {file_id}: {error}")
        return False
    except Exception as err:
        print(f"Unexpected system error while deleting file: {err}")
        return False
    
def get_or_create_folder(service, Level, Subject, ResourceType, Year=None, Sessions=None):
    ROOT_FOLDER_ID = Config.GDRIVE_ROOT_FOLDER_ID
    level_folder_id = get_and_create_folder(service, Level, parent_id=ROOT_FOLDER_ID)
    subject_folder_id = get_and_create_folder(service, Subject, parent_id=level_folder_id)
    ResourceType_folder_id = get_and_create_folder(service, ResourceType, parent_id=subject_folder_id)

    if ResourceType.lower() in ["question paper", "marking scheme", "question papers", "marking schemes"]:
        current_folder_id = ResourceType_folder_id
        Year_folder_id = get_and_create_folder(service, Year, parent_id=current_folder_id)
        session_folder_id = get_and_create_folder(service, Sessions, parent_id=Year_folder_id)
        return session_folder_id
    return ResourceType_folder_id


def get_and_create_folder(service, folder_name, parent_id=None):
    if not parent_id:
        parent_id = Config.GDRIVE_ROOT_FOLDER_ID

    try:
        query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed = false"

        results = service.files().list(
            q=query,
            fields="files(id, name)",
            supportsAllDrives=True,
            includeItemsFromAllDrives=True
        ).execute()

        items = results.get('files', [])
        if items:
            print(f"Folder '{folder_name}' safely verified inside parent with ID: {items[0]['id']}")
            return items[0]['id']
        else:
            file_metadata = {
                'name': folder_name,
                'mimeType': 'application/vnd.google-apps.folder',
                'parents': [parent_id]
            }

            folder = service.files().create(
                body=file_metadata,
                fields='id',
                supportsAllDrives=True
            ).execute()

            folder_id = folder.get('id')
            print(f"Folder '{folder_name}' successfully created inside parent with ID: {folder_id}")
            return folder_id

    except HttpError as error:
        print(f"An error occurred while searching for folder '{folder_name}': {error}")
        return None
    except Exception as e:
        print("Error occurred while searching for folder: ", e)
        return None

def find_structural_folder(service, name, parent_id=None):
    """Queries Google Drive for an existing active structural folder by name and parent."""
    safe_name = name.replace("'", "\\'")
    query = f"name = '{safe_name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    if parent_id:
        query += f" and '{parent_id}' in parents"
    
    try:
        results = service.files().list(
            q=query, 
            spaces='drive', 
            fields='files(id, name)', 
            supportsAllDrives=True, 
            includeItemsFromAllDrives=True
        ).execute()
        files = results.get('files', [])
        return files[0]['id'] if files else None
    except Exception as e:
        print(f"[Structure] Drive API Error locating '{name}': {e}")
        return None

def create_structural_folder(service, name, parent_id=None):
    """Creates a physical directory folder inside Google Drive."""
    body = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    if parent_id:
        body['parents'] = [parent_id]
        
    try:
        folder = service.files().create(
            body=body, 
            fields='id', 
            supportsAllDrives=True
        ).execute()
        return folder.get('id')
    except Exception as e:
        print(f"[Structure] Drive API Error creating '{name}': {e}")
        return None

# ── ⚙️ HIGH SPEED RESILIENT SCANNING FUNCTIONS (ADDED BELOW) ──

def build_live_drive_cache(service):
    """
    Queries Google Drive for all folders once, building a lightning-fast
    parent-child lookup dictionary map directly in system memory.
    """
    print("[Sync] ⚡ Building live structural cache from Google Drive...")
    all_folders = []
    page_token = None
    
    query = "mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    
    try:
        while True:
            results = service.files().list(
                q=query,
                spaces='drive',
                fields='nextPageToken, files(id, name, parents)',
                includeItemsFromAllDrives=True,
                supportsAllDrives=True,
                pageToken=page_token,
                pageSize=1000  
            ).execute()
            
            all_folders.extend(results.get('files', []))
            page_token = results.get('nextPageToken')
            if not page_token:
                break

        drive_map = {}
        for f in all_folders:
            parents = f.get('parents', [])
            parent_id = parents[0] if parents else None
            drive_map[f['id']] = {
                'name': f['name'].strip(),
                'parent_id': parent_id
            }
            
        print(f"[Sync] Cache built successfully with {len(drive_map)} active directory nodes.")
        return drive_map
    except Exception as e:
        print(f"[Sync] ❌ Failed to build structural map cache: {e}")
        return {}


def fetch_all_recent_drive_pdfs(service):
    """
    Bypasses deep linear folder crawling by querying the entire drive architecture
    for active PDFs instantly using Google's flat search index mappings.
    """
    print("[Sync] ⚡ Interrogating storage index for all active PDF resources...")
    pdf_files = []
    page_token = None
    
    query = "mimeType = 'application/pdf' and trashed = false"
    
    try:
        while True:
            results = service.files().list(
                q=query,
                spaces='drive',
                # 🔥 FIX: Added 'size' and 'lastModifyingUser' explicitly to the requested fields
                fields='nextPageToken, files(id, name, parents, mimeType, size, modifiedTime, lastModifyingUser(emailAddress))',
                includeItemsFromAllDrives=True,
                supportsAllDrives=True,
                pageToken=page_token,
                pageSize=1000 
            ).execute()
            
            pdf_files.extend(results.get('files', []))
            page_token = results.get('nextPageToken')
            if not page_token:
                break
                    
        print(f"[Sync] Flat-index search found {len(pdf_files)} total PDF files.")
        return pdf_files
    except Exception as e:
        print(f"[Sync] ❌ Drive API indexing search failed: {e}")
        return []
