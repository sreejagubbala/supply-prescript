from backend.app.database import Base, engine

from backend.app.models import (
    Shipment,
    Supplier,
    Prediction,
    Prescription,
    Decision,
    Outcome
)


def initialize_database():

    print("Creating database tables...")

    Base.metadata.create_all(
        bind=engine
    )

    print("Database tables created successfully!")


if __name__ == "__main__":

    initialize_database()
