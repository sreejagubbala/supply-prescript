from backend.app.database import SessionLocal
from backend.app.models import (
    Supplier,
    Shipment,
    Prediction,
    Prescription
)


def seed_database():

    db = SessionLocal()

    try:

        # Check whether suppliers already exist
        supplier_count = db.query(Supplier).count()

        if supplier_count == 0:

            suppliers = [
                Supplier(
                    supplier_name="Alpha Electronics",
                    reliability_score=92.50,
                    location="Delhi"
                ),
                Supplier(
                    supplier_name="Beta Components",
                    reliability_score=87.00,
                    location="Mumbai"
                ),
                Supplier(
                    supplier_name="Gamma Industries",
                    reliability_score=95.00,
                    location="Bangalore"
                )
            ]

            db.add_all(suppliers)
            db.commit()

        # Check whether shipments already exist
        shipment_count = db.query(Shipment).count()

        if shipment_count == 0:

            suppliers = (
                db.query(Supplier)
                .order_by(Supplier.id)
                .all()
            )

            shipments = [
                Shipment(
                    shipment_code="SHP001",
                    product="Microchips",
                    supplier_id=suppliers[0].id,
                    quantity=5000,
                    historical_lead_time=7,
                    current_lead_time=21,
                    inventory_level=2000,
                    status="At Risk",
                    origin="Delhi",
                    destination="Mumbai",
                    eta="2026-09-15",
                    risk_score=87
                ),
                Shipment(
                    shipment_code="SHP002",
                    product="Processors",
                    supplier_id=suppliers[1].id,
                    quantity=3000,
                    historical_lead_time=5,
                    current_lead_time=6,
                    inventory_level=4000,
                    status="On Track",
                    origin="Mumbai",
                    destination="Bangalore",
                    eta="2026-09-12",
                    risk_score=12
                ),
                Shipment(
                    shipment_code="SHP003",
                    product="Memory Modules",
                    supplier_id=suppliers[2].id,
                    quantity=7000,
                    historical_lead_time=8,
                    current_lead_time=18,
                    inventory_level=1500,
                    status="At Risk",
                    origin="Bangalore",
                    destination="Delhi",
                    eta="2026-09-18",
                    risk_score=76
                )
            ]

            db.add_all(shipments)
            db.commit()

        # Add predictions if none exist
        prediction_count = db.query(Prediction).count()

        if prediction_count == 0:

            shipments = (
                db.query(Shipment)
                .order_by(Shipment.id)
                .all()
            )

            predictions = [
                Prediction(
                    shipment_id=shipments[0].id,
                    delay_probability=87,
                    predicted_delay_days=14,
                    model_name="XGBoost"
                ),
                Prediction(
                    shipment_id=shipments[1].id,
                    delay_probability=12,
                    predicted_delay_days=2,
                    model_name="XGBoost"
                ),
                Prediction(
                    shipment_id=shipments[2].id,
                    delay_probability=76,
                    predicted_delay_days=10,
                    model_name="XGBoost"
                )
            ]

            db.add_all(predictions)
            db.commit()

        # Add prescriptions if none exist
        prescription_count = db.query(Prescription).count()

        if prescription_count == 0:

            shipments = (
                db.query(Shipment)
                .order_by(Shipment.id)
                .all()
            )

            prescriptions = [
                Prescription(
                    shipment_id=shipments[0].id,
                    option_name="Air Freight",
                    description="Use air freight for faster delivery",
                    estimated_cost=15000,
                    delivery_days=3,
                    risk_score=10,
                    recommendation_rank=1
                ),
                Prescription(
                    shipment_id=shipments[0].id,
                    option_name="Secondary Supplier",
                    description="Purchase from an alternate supplier",
                    estimated_cost=16500,
                    delivery_days=5,
                    risk_score=20,
                    recommendation_rank=2
                ),
                Prescription(
                    shipment_id=shipments[0].id,
                    option_name="Delay Product Launch",
                    description="Delay final product launch",
                    estimated_cost=5000,
                    delivery_days=14,
                    risk_score=60,
                    recommendation_rank=3
                )
            ]

            db.add_all(prescriptions)
            db.commit()

        print("Sample database data is ready.")

    finally:

        db.close()


if __name__ == "__main__":
    seed_database()
  
