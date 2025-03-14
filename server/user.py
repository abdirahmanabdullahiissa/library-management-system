from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask import Blueprint, jsonify
from model import User

user_bp = Blueprint('user', __name__)

# Admin route to get all users
@user_bp.get("/admin")
@jwt_required()
def get_all_users():
    claims = get_jwt()
    if claims.get("is_admin"):
        users = [user.serialize() for user in User.query.all()]
        return jsonify(users), 200  # Return the users in JSON format
    return jsonify({"message": "You are not authorized to access this data"}), 403  # 403 Forbidden

# User route to get current user data
@user_bp.get('/user_data')
@jwt_required()
def get_user_data():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if user:
        user_data = {"username": user.username, "email": user.email}
        return jsonify(user_data), 200
    else:
        return jsonify({"error": "User not found"}), 404
