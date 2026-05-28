from models import db,User,Role,Wuser_activity
from werkzeug.security import check_password_hash,generate_password_hash
from urllib.parse import quote
from flask import (Flask,Blueprint,request,current_app,jsonify,session)
from config import Config
import string
import secrets
from datetime import datetime,timedelta
import smtplib
from smtplib import SMTP_SSL  # Add this import at the top
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from sqlalchemy import func


dashboardusers_bp=Blueprint("dashboardusers_bp",__name__)
print("Website URL from config: ",Config.WEBSITE_URL)

# ---------------The function that generate the confirmation key----------
def generate_confirm_token(length:int=32):
    alphabet=string.ascii_letters + string.digits + "_-"
    confirm_token=''.join(secrets.choice(alphabet)for _ in range(length))
    return confirm_token

def send_confirm_email(username,email,confirm_token):
    try:
        message_text=f"Hello, I am {username} and i would like to confirm my account. My token is: {confirm_token}"
        encoded_message=quote(message_text)
        WHATSAPP_LINK = f"https://wa.me/{Config.ORG_PHONE_NUMBER}?text={encoded_message}"
        message=MIMEMultipart("alternative")
        message['subject']='Account Confirmation via WhatsApp'
        message['From']=Config.EMAIL_USER
        message['To']=email
        body_html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #25D366; border-radius: 10px;">
              <h2 style="color: #075E54;">Final Step, {username}!</h2>
              <p>To complete your registration, we need to verify both your email and your WhatsApp account.</p>
              <p>Please click the button below. It will open WhatsApp with your confirmation token ready to send to us.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{WHATSAPP_LINK}" 
                   style="background-color: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 18px;">
                   Verify via WhatsApp
                </a>
                <p style="text-align: center; font-size: 12px; color: #666;">
                (Note: After clicking, you must press "Send" in WhatsApp to finish)
                </p>
              </div>
              
              <p style="font-size: 0.9em; color: #777; text-align: center;">
                Clicking this button confirms your email is active and links your WhatsApp account.
              </p>
            </div>
          </body>
        </html>
        """

        # Plain Text Body: For email clients that don't support HTML
        text_body = f"""
        Hello {username},

        To verify your account, please follow these two quick steps:

        1. Click this link: {WHATSAPP_LINK}
        2. Once WhatsApp opens, press the "SEND" button to submit your token.

        Your token is: {confirm_token}

        Thank you!
        """
        message.attach(MIMEText(text_body,"plain"))
        message.attach(MIMEText(body_html,'html'))
        with SMTP(Config.EMAIL_HOST,Config.EMAIL_PORT)as server:
            server.starttls()
            server.login(Config.EMAIL_USER ,Config.EMAIL_PASSWORD)
            server.send_message(message)
            print("Confirmation email has been send successfully!")
            return True
    except Exception as err:
        print("Error occured while sending the email",err)
        return False

@dashboardusers_bp.route("/",methods=["GET"])
def get_users():
    users=User.query.all()
    user=[{"username":u.username,"email":u.email} for u in users ]
    print(user)
    return jsonify([{"username": user.username,"email": user.email,"user_id": user.user_id} for user in users])

@dashboardusers_bp.route("/login",methods=["POST"])
def Login():
    missing={}
    try:
        data=request.json
        username=data.get('username')
        password=data.get('password')
        if not username:
            missing['username']="username is required"
        if not password:
            missing['password']="password is required"
        if missing:
            return jsonify({"missing":missing}),400
        user=User.query.filter_by(username=username).first()
        if user and check_password_hash(user.user_password,password) :
            session["user_id"]=user.user_id
            session["username"]=user.username
            session["role_id"]=user.role_id
            if user.role:
                session["role_name"]=user.role.role_name
            else:
                session["role_name"]="No Role Assigned"
            return jsonify({"message":"success","role":user.role_id,"user_id":user.user_id,
                            "username":user.username,"role_name":user.role.role_name,
                            "email":user.email,"phone":user.phone}),200
        return jsonify({"message":"Login fails please check your username and password"}),401
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"Error":str(e)}),500

    # -----------------------signup init----------------------
@dashboardusers_bp.route("/Signup_form-init",methods=["GET"])
def sign_form_init():
    try:
        roles=db.session.query(Role.role_id,Role.role_name).order_by(Role.role_id).all()
        if not roles:
            print("No roles found")
            return jsonify({"message":"No roles has found"})
        return jsonify({"message":"roles found","roles":[{"role_id":r.role_id,"role_name":r.role_name} for r in roles]})
    except Exception as e:
        print ("Server Error occurred: ",e)
        return jsonify({"message":"Server Error occurred: "})

   # ----------------------------sign up route-------------------
@dashboardusers_bp.route("/Signup",methods=["POST"])  
def Signup():
    try:
        data=request.json
        username=data.get('username')
        email=data.get('email')
        phone=data.get('phone')
        user_password=data.get('password')
        role_id=data.get('role_id')
        #______Basic validation_____________
        required_field=['username','email','phone','password','role_id']
        missing=[field for field in required_field if  not data.get(field) ]
        if missing:
            return jsonify({"missing":"Missing required fields","missing":list(missing)}),404
        #_________checking if email is not taken____________
        existing_user=User.query.filter_by(email=data.get('email')).first()
        if existing_user:
            print("User already exist")
            return jsonify({"message":"Email already registered"}),409
        #__________password hashing_______
        hashed_password=generate_password_hash(user_password,method='pbkdf2:sha256')
        #____________register new user_________
        new_user=User(username=username,email=email,phone=phone,user_password=hashed_password,role_id=role_id)
        db.session.add(new_user)
        new_user.confirm_token=generate_confirm_token()
        if send_confirm_email(username,email,new_user.confirm_token):
            new_user.confirm_token_expires=datetime.now()+timedelta(days=3)
            db.session.commit()
            print  ("Account registered successfully check your email to confirm account")
            return jsonify({"message":"Account registered successfully check your email to confirm account","user_id":new_user.user_id}),200
        else:
            print  ("Email not sent please register again")
            db.session.rollback()
            return jsonify({"message":"Account registration failed"}),500
    except Exception as e:
        db.session.rollback()
        print("Error:",e)
        return jsonify({'message':str(e)}),500

# --------The token generation function-------------
def generate_reset_token(length: int=32):
    alphabet=string.ascii_letters + string.digits + "-_"
    token=''.join(secrets.choice(alphabet)for _ in range(length ))
    return token

# # sending reset link 
def sending_reset_email(email, username, reset_token):
    print("Generating reset link...website url: ", Config.WEBSITE_URL)
    reset_link = f'{Config.WEBSITE_URL}/reset-password/{reset_token}'
    print("Reset link: ", reset_link)
    
    try:
        message = MIMEMultipart("alternative")
        message["subject"] = "Password reset request - shasha.ai"
        message["From"] = Config.EMAIL_USER
        message["To"] = email
        
        # HTML body template
        html_body = f"""
        <html>
            <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
                <div style="max-width:600px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:8px;">
                    <h2 style="color:#6366f1;">Password Reset Request</h2>
                    <p>Hi <strong>{username}</strong>,</p>
                    <p>We have received a request to reset your password. Click the button below to proceed:</p>
                    <div style="text-align:center;margin:30px 0;">
                        <a href="{reset_link}" style="background:linear-gradient(135deg,#6366f1,#818cf8);color:white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break:break-all;background:#fff;padding:10px;border-radius:4px;">
                        <a href="{reset_link}" style="color:#6366f1;text-decoration:none;">{reset_link}</a>
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        © 2026 shasha.ai - All rights reserved
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_body = f"\nHi {username},\n\nClick the link below to reset your password:\n\n{reset_link}\n"
        
        message.attach(MIMEText(text_body, "plain"))
        message.attach(MIMEText(html_body, "html"))
        
        print("Connecting to Brevo SMTP server via Port 587...")
    # Ensure EMAIL_PORT is explicitly cast to an int
        with smtplib.SMTP(Config.EMAIL_HOST, int(Config.EMAIL_PORT), timeout=15) as server:
            server.ehlo()        # Identify your application to Brevo
            server.starttls()    # Secure the connection stream using TLS
            server.ehlo()        # Re-identify over the newly secured layer
            
            server.login(Config.EMAIL_USER, Config.EMAIL_PASSWORD)
            server.send_message(message)
            
            print("Email sent successfully via Brevo!")
            return True
            
    except Exception as e:
        print("Error occurred while trying to send email:", e)
        return False

#--------forgot password function-----------------
@dashboardusers_bp.route("/forgot-password",methods=["GET","POST"])
def forgot_password():
    try:
        data=request.json
        userinput=data.get("userinput")
        if not userinput:
            return jsonify({"missing":"Enter your username or email recover your email"}),400
        if '@' in userinput:
            user=User.query.filter_by(email=userinput).first()
        else:
            user=User.query.filter_by(username=userinput).first()
        if not user:
            return jsonify({"message":"You email or password is not found"}),401
        username=user.username
        email=user.email
        token=generate_reset_token()
        token_expiry=datetime.now() + timedelta(hours=1)
        user.reset_token=token
        user.token_expiry=token_expiry
        if sending_reset_email(email,username,token):
            print("Email has been sent successfully")
            db.session.commit()
            return jsonify  ({"message":"Email has been sent successfully"}),200
        else:
            print("Email not send")
            return jsonify({"message":"Email not sent"}),500
    except Exception as e:
        print("Error occurred",e)
        return jsonify({"message","Email not sent"}),500

# -----------password reset function--------------
@dashboardusers_bp.route('/reset_password/<token>', methods=["GET", "POST"])
@dashboardusers_bp.route('/reset-password/<token>', methods=["GET", "POST"])
def reset_password(token):
    try:
        # Query using the database's internal clock
        user = User.query.filter(
            User.reset_token == token,
            User.token_expiry > func.now()  # DB handles the timezone check here
        ).first()

        if not user:
            # Check if user exists at all (ignoring expiry) to give a better error
            exists = User.query.filter_by(reset_token=token).first()
            if exists:
                return jsonify({"message": "Token has expired, tap the resend button to receive valid token!"}), 401
            return jsonify({"message": "Invalid token, tap the resend button to receive valid token!"}), 401

        if request.method == "GET":
            return jsonify({
                "message": "Token is still valid", 
                "username": user.username
            }), 200

        # POST logic for password update...
        data = request.get_json()
        user.user_password =generate_password_hash(data.get("new_password"),method="pbkdf2:sha256") # Make sure to hash this!
        user.reset_token = None
        user.token_expiry = None
        db.session.commit()
        
        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"message": "Internal Server Error"}), 500

@dashboardusers_bp.route("/confirm_whatsapp",methods=["POST"])
def confirm_whatsapp():
    errors={}
    try:
        data=request.json
        confirm_token=data.get("confirm_token")
        jid=data.get("jid")
        if not confirm_token:
           errors['confirm_token']="The reset token is missing"
        if not jid:
            errors["jid"]="The jid is missing"
        if errors:
            print(f"{errors}") 
            return jsonify({"missing":errors}),400
        user=User.query.filter(User.confirm_token==confirm_token,User.confirm_token_expires>=func.now()).first()
        if not user:
            print("Your account confimation link has been expired")
            return jsonify({"message":"Your reset link has expired please request another link"}),400
        user.confirm_token=None
        user.is_confirmed=True
        user.confirm_token_expires=None
        db.session.commit()
        print("Account confirmed successfully!")
        return jsonify({"message":"Account confirmed successfully"}),200
    except Exception as e:
        print("Error occurred: ",e)
        db.session.rollback()
        return jsonify({"message":"Error occurred while try to communicate to the database server"}),500

@dashboardusers_bp.route("/update_user_info",methods=["PUT"])
def update_profile():
    try:
        data=request.json
        user_id=data.get('user_id')
        user=db.session.get(User,user_id)
        if not user:
            return jsonify({"message":"User not found"}),404
        user.username=data.get("username") or user.username
        user.phone=data.get("phone") or user.phone
        user.email=data.get("email") or user.email
        db.session.commit()
        return jsonify({"message":"Profile updated successfully","user":[{"user_id":user.user_id,
                                                                          "role":user.role.role_name,
                                                                          "username":user.username,
                                                                          "phone":user.phone,
                                                                          "email":user.email
                                                                          }]}),200
    except Exception as err:
        db.session.rollback()
        print("Error occurred while processing your request",err)
        return jsonify({"message":"Server error Occurred"}),500

@dashboardusers_bp.route("/change_password",methods=["POST"])
def change_password():
    try:
        data=request.json
        user_id=data.get("user_id")
        user=db.session.get(User,user_id)
        if not user:
            return jsonify({"message":"User not found"})
        current_password=data.get("current_password")
        new_password=data.get("new_password")
        confirm_password=data.get("confirm_password")
        required_field=['current_password',"new_password",'confirm_password']
        missing_field=[field for field in required_field if not data.get(field)]
        if missing_field:
            print("Missing fields: ",missing_field)
            message=f"These fields cant be left empty: {', '.join(missing_field)}"
            return jsonify({"missing":message}),400
        if len(new_password) < 8:
            return jsonify({"message":"Password must be at least 8 characters long"}),400
        if new_password !=confirm_password:
            return jsonify({"message":"Confirm password does not match new password"}),400
        if not check_password_hash(user.user_password,current_password):
            return jsonify({"message":"Current password is incorrect"}),400
        user.user_password=generate_password_hash(new_password,method="pbkdf2:sha256")
        db.session.commit()
        return jsonify({"message":"Password changed successfully"}),200
    except Exception as err:
        print("Error occurred",err)
        return jsonify({"message":"Error occurred"}),500

@dashboardusers_bp.route("/users",methods=["GET"])
def users():
    users_list=db.session.query(User).all()
    if not users_list:
        return jsonify({"message":"Users not found "}),404
    return jsonify({"message":"users found ","users":[{"username":u.username,"phone":u.phone,
                                                       "email":u.email,"id":u.user_id,
                                                        "role": u.role.role_name,
                                                        "is_confirmed":u.is_confirmed,"status":u.is_active,
                                                        "sid":u.jid,"joined":u.created_at
                                                         }for u in users_list]}),200

if __name__=="__main__":
    from flask import Flask
    from models import db
    from config import Config
    from flask_cors import CORS
    test_app=Flask(__name__)
    test_app.config.from_object(Config)
    db.init_app(test_app)
    CORS(test_app,resources={r"/*":{"origins":["http://192.168.100.100:5173","http://localhost:5173"]}})
    test_app.register_blueprint(dashboardusers_bp)
    test_app.run (host="0.0.0.0",port=5000,debug=True)
