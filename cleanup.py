# cleanup.py — run once
from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/drive']
creds = service_account.Credentials.from_service_account_file(
    "credentials_service_account.json", scopes=SCOPES
)
service = build('drive', 'v3', credentials=creds)

results = service.files().list(
    q="mimeType='application/vnd.google-apps.folder'",
    fields="files(id, name)",
    supportsAllDrives=True,
    includeItemsFromAllDrives=True
).execute()

for f in results.get('files', []):
    try:
        service.files().delete(
            fileId=f['id'],
            supportsAllDrives=True
        ).execute()
        print(f"Deleted: {f['name']}")
    except Exception as e:
        print(f"Skipped: {f['name']} — {e}")

print("Done")