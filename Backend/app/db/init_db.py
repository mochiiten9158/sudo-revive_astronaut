from app.db.database import Base, engine
from app.db import models


def initialize_database():
    Base.metadata.create_all(bind=engine)
    print("ASTRA database tables created successfully.")

    print("Tables:")
    for table_name in Base.metadata.tables:
        print(f"  - {table_name}")


if __name__ == "__main__":
    initialize_database()