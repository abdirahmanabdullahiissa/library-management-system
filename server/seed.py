from faker import Faker
from model import User, Book, Reservation, BorrowedBook, TokenBlocklist, db
from app import app
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, timezone

fake = Faker()
bcrypt = Bcrypt()

with app.app_context():
    # # Delete existing data
    # User.query.delete()
    # Book.query.delete()
    # Reservation.query.delete()
    BorrowedBook.query.delete()
    # TokenBlocklist.query.delete()
    db.session.commit()

    # # Create users
    # users = []
    # for _ in range(5):  # Creating 5 users
    #     user = User(
    #         username=fake.user_name(),
    #         email=fake.email(),
    #         password="password123"  # Hashed automatically by the model
    #     )
    #     users.append(user)
    #     db.session.add(user)

    # db.session.commit()

    # # Create books
    # books = []
    # for _ in range(10):  # Creating 10 books
    #     book = Book(
    #         name=fake.sentence(nb_words=3),
    #         author=fake.name(),
    #         isbn=fake.isbn13(),
    #         publication_year=fake.year(),
    #         category=fake.random_element(['Science', 'Literature', 'History', 'Technology', 'Arts']),
    #         copies_available=fake.random_int(min=1, max=5)
    #     )
    #     books.append(book)
    #     db.session.add(book)

    # db.session.commit()

    # # Create reservations
    # for _ in range(5):  # Creating 5 reservations
    #     reservation = Reservation(
    #         user_id=fake.random_element(users).id,
    #         book_id=fake.random_element(books).id,
    #         status=fake.random_element(["pending", "completed", "canceled"]),
    #         reserved_at=datetime.now(timezone.utc)
    #     )
    #     db.session.add(reservation)

    # db.session.commit()

    # Create borrowed books only
    users = User.query.all()
    books = Book.query.all()

    for _ in range(5):  # Creating 5 borrow records
        borrowed_book = BorrowedBook(
            user_id=fake.random_element(users).id,
            book_id=fake.random_element(books).id,
        )
        db.session.add(borrowed_book)

    db.session.commit()

    # # Optionally, add TokenBlocklist entries
    # user = db.session.query(User).first()
    # if user:
    #     for _ in range(3):
    #         token = TokenBlocklist(
    #             jti=fake.uuid4(),
    #             created_at=datetime.now(timezone.utc),
    #             user_id=user.id
    #         )
    #         db.session.add(token)

    # db.session.commit()

    print("Only borrowed books seeded successfully!")
