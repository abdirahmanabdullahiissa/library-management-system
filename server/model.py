#models
from sqlalchemy_serializer import SerializerMixin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from flask_bcrypt import Bcrypt 
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime,timedelta
import re

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model,SerializerMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String, nullable = False, unique = True)
    email = db.Column(db.String)
    hashed_password = db.Column(db.String, nullable = False)
    created_at = db.Column(db.DateTime,server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    borrowed_books = db.relationship("BorrowedBook", back_populates="user", cascade="all, delete-orphan")
    reservations = db.relationship("Reservation", back_populates="user", cascade="all, delete-orphan")
    revoked_tokens = db.relationship('TokenBlocklist', back_populates='user', lazy=True)

    @validates('email')
    def validate_email(self, key, email):
        email_pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'    
        if not re.match(email_pattern, email):
            raise ValueError('Invalid email format')
        
        return email
        
     # Password getter and setter methods

    @hybrid_property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        hashed_password = bcrypt.generate_password_hash(password.encode('utf-8'))
        self.hashed_password = hashed_password.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self.hashed_password, password.encode('utf-8'))
        
    def serialize(self):
        return{
            'id':self.id,
            'username':self.username,
            'email':self.email
             
        }

class Book(db.Model, SerializerMixin):
    __tablename__ = "books"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    author = db.Column(db.String, nullable=False)
    isbn = db.Column(db.String(13), unique=True, nullable=False)
    publication_year = db.Column(db.Integer, nullable=True)
    category = db.Column(db.String, nullable=True)
    copies_available = db.Column(db.Integer, default=1, nullable=False)

    borrowed_books = db.relationship("BorrowedBook", back_populates="book", cascade="all, delete-orphan")
    reservations = db.relationship("Reservation", back_populates="book", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "author": self.author,
            "isbn": self.isbn,
            "publication_year": self.publication_year,
            "copies_available": self.copies_available,
            "category":self.category
            # "borrowed_books": [borrow.serialize() for borrow in self.borrowed_books]
        }
class Reservation(db.Model, SerializerMixin):
    __tablename__ = "reservations"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id', ondelete="CASCADE"), nullable=False)
    status = db.Column(db.String, default="pending", nullable=False)  # e.g "pending", "completed", "canceled"
    reserved_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


    user = db.relationship("User", back_populates="reservations")
    book = db.relationship("Book", back_populates="reservations")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "book_id": self.book_id,
            "status": self.status,
            "reserved_at": self.reserved_at
        }
class BorrowedBook(db.Model, SerializerMixin):
    __tablename__ = "borrowed_books"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id', ondelete="CASCADE"), nullable=False)
    borrowed_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=14))  # Auto-set due date
    returned_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", back_populates="borrowed_books")
    book = db.relationship("Book", back_populates="borrowed_books")

    def serialize(self):
        return {
            "id": self.id,
            "book_id": self.book_id,
            "user_id": self.user_id,
            "borrowed_at": self.borrowed_at,
            "due_date": self.due_date,
            "returned_at": self.returned_at
        }
class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(), nullable=True)
    created_at = db.Column(db.DateTime , default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), nullable=False)

    user = db.relationship('User', back_populates='revoked_tokens')

    def __repr__ (self):
        return f"<tokem {self.jti}>"


