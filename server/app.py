import os

from flask_jwt_extended import JWTManager,jwt_required,get_jwt_identity,get_jwt
from model import User,db,BorrowedBook,Book,Reservation,TokenBlocklist
from flask_migrate import Migrate
from flask import Flask,make_response,jsonify,request,render_template
from flask_cors import CORS
from flask_restful import Api,Resource
from flask_bcrypt import Bcrypt
from werkzeug.exceptions import NotFound
from auth import auth_bp
from user import user_bp
import random
from flask_mail import Mail
from datetime import datetime,timedelta

from dotenv import load_dotenv
load_dotenv()

app = Flask(
    __name__,
    static_url_path='',
    static_folder='../client/build',
    template_folder='../client/build'
    )
app.config.from_prefixed_env()



# app.config['JWT_SECRET_KEY'] ="62417259c32f8fef92b1c1f6b135a302f435d726ffafad8a035e7e798c0dbad4"
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 24 * 60 * 60
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
# # app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI') #render database url
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
# app.config['MAIL_PORT'] = 587
# app.config['MAIL_USE_TLS'] = True
# app.config['MAIL_USERNAME'] = ''
# app.config['MAIL_PASSWORD'] = 'hmnzrzeikmkwrsal'
# app.config['MAIL_DEFAULT_SENDER'] = ''

app.json.compact = False


db.init_app(app)
migrate = Migrate(app,db)
api=Api(app)
bcrypt = Bcrypt(app)
CORS(app) #connect frontend 
jwt = JWTManager()
jwt.init_app(app)
# mail = Mail(app)

# register blueprint
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(user_bp, url_prefix='/user')


#additional claims
@jwt.additional_claims_loader
def make_additional_claims(identity):
    if identity == 'abd':
        return {"is_admin": True}
    return{"is_admin": False}

         



# jwt error handler
@jwt.expired_token_loader
def expired_token(jwt_header,jwt_data):
    return jsonify({'message': 'The token has expired.','error':'token expired'}), 401

@jwt.invalid_token_loader
def invalid_token(error):
    return jsonify({'message': 'Does not contain a valid token.','error':'invalid token'}), 401

@jwt.unauthorized_loader
def missing_token(error):
    return jsonify({'message': 'Request does not contain an access token.', 'error':'token missing'}), 401


@jwt.token_in_blocklist_loader #check if the jwt is revocked
def token_in_blocklist(jwt_header,jwt_data):
    jti = jwt_data['jti']

    token = db.session.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).scalar()
# if token is none : it will return false 
    return token is not None


# @app.errorhandler(NotFound)
# def handle_not_found(e):
#     return render_template('index.html', title='Homepage', message='Welcome to our website!')


class BookResource(Resource):
    def get(self, book_id=None):
        """Retrieve all books or a specific book."""
        if book_id:
            book = Book.query.get(book_id)
            if not book:
                return {'message': 'Book not found'}, 404
            return make_response(jsonify(book.serialize()), 200)

        books = Book.query.all()
        return make_response(jsonify([book.serialize() for book in books]), 200)

    @jwt_required()
    def post(self):
        """Add a new book (Admin only)."""
        data = request.get_json()
        claims = get_jwt()  # Get additional claims

        # Check if the user is an admin
        if not claims.get("is_admin", False):
            return {'message': 'Unauthorized: Admins only'}, 403

        # Ensure ISBN is unique
        if Book.query.filter_by(isbn=data.get("isbn")).first():
            return {'message': 'Book with this ISBN already exists'}, 400

        new_book = Book(
            name=data.get("name"),
            author=data.get("author"),
            isbn=data.get("isbn"),
            publication_year=data.get("publication_year"),
            category=data.get("category"),
            copies_available=data.get("copies_available", 1)
        )

        db.session.add(new_book)
        db.session.commit()

        return make_response(jsonify(new_book.serialize()), 201)

    @jwt_required()
    def patch(self, book_id):
        """Update book details (Admin only)."""
        data = request.get_json()
        claims = get_jwt()  # Get additional claims

        # Check if the user is an admin
        if not claims.get("is_admin", False):
            return {'message': 'Unauthorized: Admins only'}, 403

        book = Book.query.get(book_id)
        if not book:
            return {'message': 'Book not found'}, 404

        book.name = data.get("name", book.name)
        book.author = data.get("author", book.author)
        book.isbn = data.get("isbn", book.isbn)
        book.publication_year = data.get("publication_year", book.publication_year)
        book.category = data.get("category", book.category)
        book.copies_available = data.get("copies_available", book.copies_available)

        db.session.commit()

        return make_response(jsonify(book.serialize()), 200)

    @jwt_required()
    def delete(self, book_id):
        claims = get_jwt()
        if not claims.get("is_admin", False):
            return {'message': 'Unauthorized: Admins only'}, 403
        
        book = Book.query.get(book_id)
        if not book:
            return {'message': 'Book not found'}, 404
        
        db.session.delete(book)
        db.session.commit()
        return make_response(jsonify({'message': 'Book deleted successfully'}), 200)
    
class ReservationResource(Resource):
    @jwt_required()
    def get(self):
        """Fetch all reservations for the authenticated user."""
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()

        if not user:
            return {'message': 'User not found'}, 404

        reservations = Reservation.query.filter_by(user_id=user.id).all()
        if not reservations:
            return {'message': 'No reservations found'}, 404

        return make_response(jsonify([r.serialize() for r in reservations]), 200)

    @jwt_required()
    def post(self):
        """Reserve a book."""
        data = request.get_json()
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()

        if not user:
            return {'message': 'User not found'}, 404

        book = Book.query.get(data.get("book_id"))
        if not book:
            return {'message': 'Book not found'}, 404

        reservation = Reservation(
            user_id=user.id,
            book_id=book.id,
            status="pending",
            reserved_at=datetime.utcnow()
        )

        db.session.add(reservation)
        db.session.commit()

        return make_response(jsonify(reservation.serialize()), 201)

    @jwt_required()
    def patch(self):
        """Cancel a reservation."""
        data = request.get_json()
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()

        if not user:
            return {'message': 'User not found'}, 404

        reservation = Reservation.query.filter_by(user_id=user.id, book_id=data.get("book_id"), status="pending").first()
        if not reservation:
            return {'message': 'Reservation not found or already completed'}, 404

        reservation.status = "canceled"
        db.session.commit()

        return make_response(jsonify({'message': 'Reservation canceled'}), 200)
class BorrowedBookResource(Resource):

    @jwt_required()
    def get(self, book_id=None):
        """Fetch all borrowed books for the authenticated user or a specific borrowed book."""
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()

        if not user:
            return {'message': 'User not found'}, 404

        if book_id:
            borrowed_book = BorrowedBook.query.filter_by(user_id=user.id, book_id=book_id).first()
            if not borrowed_book:
                return {'message': 'No borrowed book found with this ID'}, 404
            return make_response(jsonify(borrowed_book.serialize()), 200)

        borrowed_books = BorrowedBook.query.filter_by(user_id=user.id).all()
        if not borrowed_books:
            return {'message': 'No borrowed books found'}, 404

        return make_response(jsonify([b.serialize() for b in borrowed_books]), 200)

    @jwt_required()
    def post(self):
        """Borrow a book (only if copies are available)."""
        data = request.get_json()
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()

        if not user:
            return {'message': 'User not found'}, 404

        book = Book.query.get(data.get("book_id"))
        if not book:
            return {'message': 'Book not found'}, 404
        
        if book.copies_available < 1:
            return {'message': 'No copies available for borrowing'}, 400

        # Reduce book availability
        book.copies_available -= 1

        borrowed_book = BorrowedBook(
            user_id=user.id,
            book_id=book.id,
            borrowed_at=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=14)
        )

        db.session.add(borrowed_book)
        db.session.commit()

        return make_response(jsonify(borrowed_book.serialize()), 201)

    @jwt_required()
    def patch(self, book_id):
        """Return a borrowed book."""
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()

        if not user:
            return {'message': 'User not found'}, 404

        borrowed_book = BorrowedBook.query.filter_by(user_id=user.id, book_id=book_id, returned_at=None).first()
        if not borrowed_book:
            return {'message': 'No borrowed book found to return'}, 404

        borrowed_book.returned_at = datetime.utcnow()

        # Increase book availability
        book = Book.query.get(borrowed_book.book_id)
        if book:
            book.copies_available += 1

        db.session.commit()

        return make_response(jsonify({'message': 'Book returned successfully', 'borrowed_book': borrowed_book.serialize()}), 200)

    @jwt_required()
    def delete(self, book_id):
        """Cancel a borrowed book before returning it."""
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()

        if not user:
            return {'message': 'User not found'}, 404

        borrowed_book = BorrowedBook.query.filter_by(user_id=user.id, book_id=book_id, returned_at=None).first()
        if not borrowed_book:
            return {'message': 'No active borrowed book found to delete'}, 404

        # Restore book availability
        book = Book.query.get(borrowed_book.book_id)
        if book:
            book.copies_available += 1

        db.session.delete(borrowed_book)
        db.session.commit()

        return make_response(jsonify({'message': 'Borrowed book record deleted successfully'}), 200)

        # return make_response(jsonify({'message': 'Book returned successfully'}), 200)
api.add_resource(BookResource, '/books', '/books/<int:book_id>')
  # For book operations
api.add_resource(ReservationResource, '/reservations')  # For reservation operations
api.add_resource(BorrowedBookResource, '/borrowed-books', '/borrowed-books/<int:book_id>')


if __name__ == '__main__':
    app.run(port=5555, debug=True)