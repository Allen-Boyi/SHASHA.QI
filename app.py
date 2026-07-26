from flask import Flask, Blueprint
from flask_cors import CORS
from models import db
from config import Config
from library import library_bp
from dashboardusers import dashboardusers_bp
from botusers import botusers_bp
from dbmanager import dbmanager_bp 
from whatsapp_community_bp import community_bp
from resource_edit_route import register_edit_route
from sync_drive_resources import register_sync_route  

app = Flask(__name__)
app.config.from_object(Config)
print("SAMESITE type:", type(app.config.get("SESSION_COOKIE_SAMESITE")))
print("SAMESITE value:", repr(app.config.get("SESSION_COOKIE_SAMESITE")))
print("SECURE:", repr(app.config.get("SESSION_COOKIE_SECURE")))
db.init_app(app)
register_sync_route(library_bp) 
register_edit_route(library_bp) 
app.register_blueprint(library_bp)
app.register_blueprint(dashboardusers_bp)
app.register_blueprint(botusers_bp)
app.register_blueprint(dbmanager_bp)
app.register_blueprint(community_bp)
CORS(app, supports_credentials=True, resources={r"/*":{"origins": [Config.WEBSITE_URL, "http://127.0.0.1:5173"]}})
print(Config.SQLALCHEMY_DATABASE_URI)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)