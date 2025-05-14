from flask import Blueprint, jsonify, request
from model import User, bcrypt, db, TokenBlocklist
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt

auth_bp = Blueprint('auth', __name__)

# Register Route
@auth_bp.post('/register')
def register():
    data = request.get_json()
    
    if 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "Missing required fields"}), 400

    username = data['username']
    email = data['email']
    
    user = User.query.filter_by(username=username).first()
    existing_email = User.query.filter_by(email=email).first()

    if user:
        return {'error': 'Username already exists, please choose another one'}, 404
    if existing_email:
        return {'error': 'Email already exists, please use a different email address'}, 404

    # Don't hash password manually, let the setter handle it
    new_user = User(username=username, email=email, password=data['password'])
    db.session.add(new_user)
    db.session.commit()

    # Commenting out OTP-related email function
    # send_user_signup_mail(new_user)  # OTP email function can be commented out for now

    
    return jsonify({
        "message": "User registered successfully",
        "user": new_user.serialize()
    }), 200


# Send Signup Email (Commented out OTP-related logic)
def send_user_signup_mail(user):
    from app import mail
    subject = "Welcome to Hekima Library management system"
    body = f"Dear {user.username},\n\nThank you for registering on our Hekima library management system..."
    recipients = [user.email]
    mail.send_message(subject=subject, recipients=recipients, body=body)

# Login Route
@auth_bp.post('/login')
def login(): 
    # data = request.get_json()
    
    # # Check if required fields are in the request body
    # if 'username' not in data or 'password' not in data:
    #     return jsonify({"error": "Missing required fields"}), 400

    # username = data['username']
    # user = User.query.filter_by(username=username).first()
    
    # if not user:
    #     return {'error': 'User not registered'}, 401 

    # if not bcrypt.check_password_hash(user.password, data['password']):
    #     return {'error': '401 Unauthorized'}, 401
        username = request.json.get("username")
        password = request.json.get("password")

        user = User.query.filter_by(username=username).first()
        if not user:
            return {"message": "User not found"}, 404
        if not user.authenticate(password):
            return {"message": "Invalid password"}, 401

        access_token = create_access_token(identity=user.username)
        refresh_token = create_refresh_token(identity=user.username)  

        return jsonify({

          
            "access": access_token,
            "refresh": refresh_token
    }), 200

# Whoami Route
@auth_bp.get('/whoami')
@jwt_required()
def whoami():
    claims = get_jwt()
    return jsonify({"message": "token", "claims": claims})

# Refresh Access Token
@auth_bp.get('/refresh')
@jwt_required(refresh=True)
def refresh_access():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token})

# Logout Route
@auth_bp.get('/logout')
@jwt_required(verify_type=False)
def logout_user():
    jwt = get_jwt()
    jti = jwt['jti']
    token_type = jwt['type']
    
    # Get the user_id from the JWT
    user_id = jwt.get("sub")  # Ensure "sub" is included when creating the JWT
    
    if not user_id:
        return jsonify({"message": "User ID missing from token"}), 400

    # Check if the token is already in the blocklist
    existing_token = TokenBlocklist.query.filter_by(jti=jti).first()
    if existing_token:
        return jsonify({"message": f"{token_type} token already revoked"}), 400

    # Add the token to the blocklist
    token_blocklist = TokenBlocklist(jti=jti, user_id=user_id)
    db.session.add(token_blocklist)
    db.session.commit()

    return jsonify({"message": f"{token_type} token revoked successfully"}), 200


# Commenting out OTP-related email function
    # send_user_signup_mail(new_user)  # OTP email function can be commented out for now