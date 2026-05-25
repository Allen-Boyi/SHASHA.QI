import os
from dotenv import load_dotenv
import json

load_dotenv()
class Config:
    SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL")
    EMAIL_HOST= os.getenv("EMAIL_HOST")
    EMAIL_PORT=int(os.getenv("EMAIL_PORT",587))
    EMAIL_USER=os.getenv("EMAIL_USER")
    EMAIL_PASSWORD=os.getenv("EMAIL_PASSWORD")
    APP_NAME=os.getenv("APP_NAME")
    WEBSITE_URL =os.getenv("WEBSITE_URL")
    ORG_PHONE_NUMBER=os.getenv("ORG_PHONE_NUMBER")
    CLOUDINARY_CLOUD_NAME=os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY=os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET=os.getenv('CLOUDINARY_API_SECRET')
    SECRET_KEY=os.getenv("SECRET_KEY")
    SQLALCHEMY_TRACK_MODIFICATIONS=False
    GOOGLE_INFO=json.loads(os.getenv("GOOGLE_CREDINTIALS"))
    JWT_SECRET_KEY=os.getenv("JWT_SECRET_KEY")