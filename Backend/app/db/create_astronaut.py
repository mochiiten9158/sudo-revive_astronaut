from getpass import getpass

from sqlalchemy.exc import IntegrityError

from app.db.database import SessionLocal
from app.db.models import User, Astronaut
from app.core.security import hash_password


def create_astronaut():
    db = SessionLocal()

    try:
        astronaut_id = input("Astronaut ID: ").strip()
        display_name = input("Display name: ").strip()

        if not astronaut_id or not display_name:
            print("Astronaut ID and display name are required.")
            return

        existing = (
            db.query(User)
            .filter(User.username == astronaut_id)
            .first()
        )

        if existing:
            print("An account with this astronaut ID already exists.")
            return

        password = getpass("Password (minimum 12 characters): ")
        confirm_password = getpass("Confirm password: ")

        if len(password) < 12:
            print("Password must be at least 12 characters.")
            return

        if password != confirm_password:
            print("Passwords do not match.")
            return

        user = User(
            username=astronaut_id,
            password_hash=hash_password(password),
            role="astronaut",
            is_active=True,
        )

        db.add(user)
        db.flush()

        astronaut = Astronaut(
            user_id=user.id,
            astronaut_code=astronaut_id,
            display_name=display_name,
        )

        db.add(astronaut)
        db.commit()

        print("\nAstronaut account created successfully.")
        print(f"Astronaut ID: {astronaut_id}")
        print(f"Display name: {display_name}")

    except IntegrityError:
        db.rollback()
        print("Could not create account: this ID may already exist.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_astronaut()