from flask import (Flask,Blueprint, app,request,current_app,jsonify,session)
from werkzeug.security import check_password_hash,generate_password_hash
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from smtplib import SMTP
from models import (db,Resource,Resource_type,RolePermission,Level,SubjectCategory,Subject,Usage_stat,
                    Ai_Query,Alert,Whatsappbot_user,User,Wuser_activity)
from config import Config
from datetime import date, datetime,timezone

botusers_bp=Blueprint("botusers_bp",__name__)

print("Botusers blueprint loaded successfully")
@botusers_bp.route("/",methods=["GET"])
def get_bot_users():
    bot_users=Whatsappbot_user.query.all()
    return jsonify([{"id": user.wuser_id,"name": user.username,"jid": user.jid,
                     "email": user.email,"credits": user.credits} for user in bot_users])


# -----------------Route for the saving new whatsapp bot user -----------------
@botusers_bp.route("/register_botuser",methods=['POST'])
def bot_user():
    errors={}
    try:
        data=request.json
        jid=data.get("jid")
        username=data.get("username")
        email=data.get("email")
        if not jid:
            errors['jid']="Missing jid please make sure you enter jid"
        if not username:
            errors["username"]="Missing username make sure you entered username"
        if not email:
            errors["email"]="Missing email please enter email"
        if errors:
            print(f"Missing{errors}")
            return jsonify({"missing":errors}),400
        new_user=Whatsappbot_user(jid=jid,username=username,email=email )
        db.session.add(new_user)
        print("Bot user successfuly saved")
        db.session.commit()
        return jsonify({"message":"Bot user saved successfuly"}),200
    except Exception as e:
        db.session.rollback()
        print("Error occured: ",e)
        return jsonify({"message":f"Error occured while connecting to the database server:{str(e)}"}),500 
    
# ________Bot services credits trecker and download or view incrementer
@botusers_bp.route("/reset_credits/<jid>",methods=["POST"])
def reset_credits(jid):
    try:
        botuser=Whatsappbot_user.query.filter(Whatsappbot_user.jid==jid).first()
        if not botuser:
            return jsonify({"message":"User not found"}),404
        today=date.today()
        if botuser.last_reset!=today:
            botuser.credits=200
            botuser.last_reset=date.today()
        db.session.commit()
        print("Bot AI credits Updated successfully, to total of: ",botuser.credits)
        return jsonify({"id": botuser.wuser_id,"name": botuser.username,"jid": botuser.jid,
                     "email": botuser.email,"credits": str(botuser.credits),"message":"Credits have been successfuly updated"}),200
    except Exception as e:
        db.session.rollback()
        print("Error occurs:",e)
        return jsonify({"message":f"Error occured: {str(e)} "}),500
    
@botusers_bp.route("/botuser/download_counts",methods=["POST"])
def download_counts():
    try:
        data=request.json
        jid=data.get("jid")
        if not jid:
            print("User not found")
            return jsonify({"missing":"Message not found"}),400
        botuser=Whatsappbot_user.query.filter(Whatsappbot_user.jid==jid).first()
        if not botuser:
            print("User not registered")
            return jsonify({"message":"User not found"}),400
    except Exception as err:
        print("Erroe occured:",err)
        return jsonify("message",f"Error Occured: {str(err)}"),500



if __name__=="__main__":
    from flask import Flask
    from models import db
    from config import Config
    from flask_cors import CORS
    test_app=Flask(__name__)
    test_app.config.from_object(Config)
    db.init_app(test_app)
    CORS(test_app)
    test_app.register_blueprint(botusers_bp)
    test_app.run (host="0.0.0.0",port=5000,debug=True)