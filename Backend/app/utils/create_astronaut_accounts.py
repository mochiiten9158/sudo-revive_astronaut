
from getpass import getpass

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import User, Astronaut
from app.core.security import hash_password
from app.services.data_service import load_synthetic_data


def get_available_astronauts():
    """Get astronaut identities available in the operational dataset."""
    data = load_synthetic_data()

    astronauts = (
        data[["Astronaut_ID", "Name"]]
        .dropna(subset=["Astronaut_ID", "Name"])
        .drop_duplicates(subset=["Astronaut_ID"])
        .sort_values("Astronaut_ID")
    )

    return {
        str(row["Astronaut_ID"]).strip(): str(row["Name"]).strip()
        for _, row in astronauts.iterrows()
    }


def create_account(
    db: Session,
    astronaut_code: str,
    display_name: str,
    password: str,
):
    """Create one astronaut account without modifying existing accounts."""

    existing_user = (
        db.query(User)
        .filter(User.username == astronaut_code)
        .first()
    )

    existing_profile = (
        db.query(Astronaut)
        .filter(Astronaut.astronaut_code == astronaut_code)
        .first()
    )

    existing_dataset_mapping = (
        db.query(Astronaut)
        .filter(Astronaut.dataset_subject_id == astronaut_code)
        .first()
    )

    if existing_user or existing_profile:
        print(f"SKIPPED: {astronaut_code} already exists.")
        return False

    if existing_dataset_mapping:
        print(
            f"SKIPPED: Dataset {astronaut_code} is already "
            "assigned to another astronaut."
        )
        return False

    user = User(
        username=astronaut_code,
        password_hash=hash_password(password),
        role="astronaut",
        is_active=True,
    )

    db.add(user)
    db.flush()

    profile = Astronaut(
        user_id=user.id,
        astronaut_code=astronaut_code,
        display_name=display_name,
        mission_id=None,
        dataset_subject_id=astronaut_code,
    )

    db.add(profile)

    print(f"CREATED: {astronaut_code} — {display_name}")
    return True


def main():
    print("\n========== ASTRA ASTRONAUT ACCOUNT SETUP ==========\n")

    available = get_available_astronauts()

    if not available:
        print("No astronaut identities found in the dataset.")
        return

    print("Available dataset identities:\n")

    for code, name in available.items():
        print(f"  {code}: {name}")

    print("\nEnter astronaut IDs separated by commas.")
    print("Enter ALL to create accounts for every available identity.\n")

    selection = input("Astronaut IDs: ").strip()

    if selection.upper() == "ALL":
        selected_codes = list(available.keys())
    else:
        selected_codes = list(
            dict.fromkeys(
                code.strip()
                for code in selection.split(",")
                if code.strip()
            )
        )

    invalid_codes = [
        code for code in selected_codes
        if code not in available
    ]

    if invalid_codes:
        print(f"\nUnknown astronaut IDs: {', '.join(invalid_codes)}")
        return

    if not selected_codes:
        print("No astronauts selected.")
        return

    db = SessionLocal()
    created = 0
    skipped = 0

    try:
        for code in selected_codes:
            print(f"\n--- Account: {code} ---")

            password = getpass("Set password: ")
            confirmation = getpass("Confirm password: ")

            if password != confirmation:
                print("SKIPPED: Passwords do not match.")
                skipped += 1
                continue

            if len(password) < 12:
                print("SKIPPED: Password must be at least 12 characters.")
                skipped += 1
                continue

            was_created = create_account(
                db=db,
                astronaut_code=code,
                display_name=available[code],
                password=password,
            )

            if was_created:
                created += 1
            else:
                skipped += 1

        db.commit()

        print("\n========== SETUP COMPLETE ==========")
        print(f"Accounts created: {created}")
        print(f"Accounts skipped: {skipped}")

    except Exception:
        db.rollback()
        print("\nERROR: Account creation failed. Changes rolled back.")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()