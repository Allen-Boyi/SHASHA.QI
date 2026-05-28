from flask import Flask ,Blueprint
from flask_cors import CORS
from models import db
from config import Config
from library import library_bp
from dashboardusers import dashboardusers_bp
app=Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
app.register_blueprint(library_bp)
app.register_blueprint(dashboardusers_bp)
CORS(app, resources={r"/*": {"origins": "https://shasha-qi.onrender.com"}})
print(Config.SQLALCHEMY_DATABASE_URI)
if __name__=="__main__":
    app.run(host="0.0.0.0",port=5000,debug=True)
