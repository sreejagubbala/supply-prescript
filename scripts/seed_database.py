from datetime import date
from pathlib import Path
import sys

from sqlalchemy import text

PROJECT_ROOT = Path(__file__).resolve().parents[1]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.database import SessionLocal

from backend.app.models.supplier import Supplier
from backend.app.models.shipment import Shipment
from backend.app.models.prediction import Prediction
from backend.app.models.prescription import Prescription
from backend.app.models.decision import Decision
from backend.app.models.outcome import Outcome

SUPPLIERS = [
    {
        "supplier_name": "Alpha Electronics",
        "reliability_score": 92.50,
        "location": "Delhi",
    },
    {
        "supplier_name": "Beta Components",
        "reliability_score": 87.00,
        "location": "Mumbai",
    },
    {
        "supplier_name": "Gamma Industries",
        "reliability_score": 95.00,
        "location": "Bangalore",
    },
]

SHIPMENTS = [
    {
        "shipment_code": "SHP001",
        "product": "Microchips",
        "quantity": 5000,
        "historical_lead_time": 7,
        "current_lead_time": 10,
        "inventory_level": 8500,
        "status": "Delayed",
        "origin": "Delhi",
        "destination": "Mumbai",
        "eta": date(2026, 9, 15),
        "risk_score": 87,
        "supplier_index": 0,
    },
    {
        "shipment_code": "SHP002",
        "product": "Processors",
        "quantity": 3000,
        "historical_lead_time": 6,
        "current_lead_time": 6,
        "inventory_level": 6200,
        "status": "On-Time",
        "origin": "Mumbai",
        "destination": "Bangalore",
        "eta": date(2026, 9, 12),
        "risk_score": 12,
        "supplier_index": 1,
    },
    {
        "shipment_code": "SHP003",
        "product": "Memory Modules",
        "quantity": 7000,
        "historical_lead_time": 8,
        "current_lead_time": 11,
        "inventory_level": 9200,
        "status": "Delayed",
        "origin": "Bangalore",
        "destination": "Delhi",
        "eta": date(2026, 9, 18),
        "risk_score": 76,
        "supplier_index": 2,
    },
    {
        "shipment_code": "SHP004",
        "product": "Microcontrollers",
        "quantity": 2500,
        "historical_lead_time": 5,
        "current_lead_time": 5,
        "inventory_level": 5000,
        "status": "On-Time",
        "origin": "Kolkata",
        "destination": "Chennai",
        "eta": date(2026, 9, 20),
        "risk_score": 15,
        "supplier_index": 0,
    },
    {
        "shipment_code": "SHP005",
        "product": "Sensors",
        "quantity": 4000,
        "historical_lead_time": 7,
        "current_lead_time": 10,
        "inventory_level": 7000,
        "status": "Delayed",
        "origin": "Delhi",
        "destination": "Mumbai",
        "eta": date(2026, 9, 21),
        "risk_score": 85,
        "supplier_index": 1,
    },
    {
        "shipment_code": "SHP006",
        "product": "Circuit Boards",
        "quantity": 3200,
        "historical_lead_time": 6,
        "current_lead_time": 6,
        "inventory_level": 6500,
        "status": "On-Time",
        "origin": "Pune",
        "destination": "Bengaluru",
        "eta": date(2026, 9, 22),
        "risk_score": 20,
        "supplier_index": 2,
    },
    {
        "shipment_code": "SHP007",
        "product": "Connectors",
        "quantity": 5200,
        "historical_lead_time": 5,
        "current_lead_time": 5,
        "inventory_level": 8000,
        "status": "On-Time",
        "origin": "Chennai",
        "destination": "Hyderabad",
        "eta": date(2026, 9, 23),
        "risk_score": 8,
        "supplier_index": 0,
    },
    {
        "shipment_code": "SHP008",
        "product": "Processors",
        "quantity": 6500,
        "historical_lead_time": 8,
        "current_lead_time": 12,
        "inventory_level": 11000,
        "status": "Delayed",
        "origin": "Bengaluru",
        "destination": "Delhi",
        "eta": date(2026, 9, 24),
        "risk_score": 91,
        "supplier_index": 1,
    },
    {
        "shipment_code": "SHP009",
        "product": "Memory Chips",
        "quantity": 2800,
        "historical_lead_time": 6,
        "current_lead_time": 6,
        "inventory_level": 5500,
        "status": "On-Time",
        "origin": "Mumbai",
        "destination": "Pune",
        "eta": date(2026, 9, 25),
        "risk_score": 25,
        "supplier_index": 2,
    },
    {
        "shipment_code": "SHP010",
        "product": "Display Modules",
        "quantity": 4500,
        "historical_lead_time": 7,
        "current_lead_time": 9,
        "inventory_level": 7500,
        "status": "Delayed",
        "origin": "Delhi",
        "destination": "Kolkata",
        "eta": date(2026, 9, 26),
        "risk_score": 55,
        "supplier_index": 0,
    },
    {
        "shipment_code": "SHP011",
        "product": "Power Units",
        "quantity": 3500,
        "historical_lead_time": 6,
        "current_lead_time": 6,
        "inventory_level": 7000,
        "status": "On-Time",
        "origin": "Pune",
        "destination": "Mumbai",
        "eta": date(2026, 9, 27),
        "risk_score": 18,
        "supplier_index": 1,
    },
    {
        "shipment_code": "SHP012",
        "product": "Control Boards",
        "quantity": 3000,
        "historical_lead_time": 5,
        "current_lead_time": 5,
        "inventory_level": 6000,
        "status": "On-Time",
        "origin": "Bengaluru",
        "destination": "Chennai",
        "eta": date(2026, 9, 28),
        "risk_score": 10,
        "supplier_index": 2,
    },
    {
        "shipment_code": "SHP013",
        "product": "Capacitors",
        "quantity": 2200,
        "historical_lead_time": 6,
        "current_lead_time": 6,
        "inventory_level": 4500,
        "status": "On-Time",
        "origin": "Ahmedabad",
        "destination": "Surat",
        "eta": date(2026, 9, 29),
        "risk_score": 22,
        "supplier_index": 0,
    },
    {
        "shipment_code": "SHP014",
        "product": "Resistors",
        "quantity": 4100,
        "historical_lead_time": 7,
        "current_lead_time": 10,
        "inventory_level": 8000,
        "status": "Delayed",
        "origin": "Jaipur",
        "destination": "Delhi",
        "eta": date(2026, 9, 30),
        "risk_score": 72,
        "supplier_index": 1,
    },
    {
        "shipment_code": "SHP015",
        "product": "LED Modules",
        "quantity": 5500,
        "historical_lead_time": 5,
        "current_lead_time": 5,
        "inventory_level": 9000,
        "status": "On-Time",
        "origin": "Chennai",
        "destination": "Coimbatore",
        "eta": date(2026, 10, 1),
        "risk_score": 5,
        "supplier_index": 2,
    },
    {
        "shipment_code": "SHP016",
        "product": "Battery Packs",
        "quantity": 2800,
        "historical_lead_time": 6,
        "current_lead_time": 8,
        "inventory_level": 5500,
        "status": "Delayed",
        "origin": "Lucknow",
        "destination": "Kanpur",
        "eta": date(2026, 10, 2),
        "risk_score": 60,
        "supplier_index": 0,
    },
    {
        "shipment_code": "SHP017",
        "product": "Power Controllers",
        "quantity": 6200,
        "historical_lead_time": 5,
        "current_lead_time": 5,
        "inventory_level": 10000,
        "status": "On-Time",
        "origin": "Bengaluru",
        "destination": "Mysuru",
        "eta": date(2026, 10, 3),
        "risk_score": 14,
        "supplier_index": 1,
    },
    {
        "shipment_code": "SHP018",
        "product": "Communication Modules",
        "quantity": 2600,
        "historical_lead_time": 7,
        "current_lead_time": 10,
        "inventory_level": 5200,
        "status": "Delayed",
        "origin": "Mumbai",
        "destination": "Nagpur",
        "eta": date(2026, 10, 4),
        "risk_score": 88,
        "supplier_index": 2,
    },
    {
        "shipment_code": "SHP019",
        "product": "Memory Modules",
        "quantity": 3900,
        "historical_lead_time": 6,
        "current_lead_time": 6,
        "inventory_level": 7800,
        "status": "On-Time",
        "origin": "Kolkata",
        "destination": "Bhubaneswar",
        "eta": date(2026, 10, 5),
        "risk_score": 30,
        "supplier_index": 0,
    },
    {
        "shipment_code": "SHP020",
        "product": "Microchips",
        "quantity": 4800,
        "historical_lead_time": 7,
        "current_lead_time": 11,
        "inventory_level": 8500,
        "status": "Delayed",
        "origin": "Delhi",
        "destination": "Chandigarh",
        "eta": date(2026, 10, 6),
        "risk_score": 95,
        "supplier_index": 1,
    },
]

def seed_database():

    db = SessionLocal()

    try:

        print("=" * 60)
        print("SUPPLY PRESCRIPT DATABASE SEED")
        print("=" * 60)

        # ----------------------------------------------------
        # SUPPLIERS
        # ----------------------------------------------------

        suppliers = []

        for supplier_data in SUPPLIERS:

            supplier = (
                db.query(Supplier)
                .filter(
                    Supplier.supplier_name
                    == supplier_data["supplier_name"]
                )
                .first()
            )

            if supplier is None:

                supplier = Supplier(
                    supplier_name=supplier_data["supplier_name"],
                    reliability_score=supplier_data["reliability_score"],
                    location=supplier_data["location"],
                )

                db.add(supplier)
                db.flush()

            else:

                supplier.reliability_score = (
                    supplier_data["reliability_score"]
                )

                supplier.location = (
                    supplier_data["location"]
                )

            suppliers.append(supplier)

        db.commit()

        print(f"Suppliers ready: {len(suppliers)}")

        # ----------------------------------------------------
        # DELETE OLD CLOSED-LOOP DATA
        #
        # Important:
        # Outcomes -> Decisions -> Predictions ->
        # Prescriptions -> Shipments
        # ----------------------------------------------------

        deleted_outcomes = (
            db.query(Outcome)
            .delete(synchronize_session=False)
        )

        db.commit()

        print(
            f"Old outcomes deleted: "
            f"{deleted_outcomes}"
        )

        deleted_decisions = (
            db.query(Decision)
            .delete(synchronize_session=False)
        )

        db.commit()

        print(
            f"Old decisions deleted: "
            f"{deleted_decisions}"
        )

        deleted_predictions = (
            db.query(Prediction)
            .delete(synchronize_session=False)
        )

        db.commit()

        print(
            f"Old predictions deleted: "
            f"{deleted_predictions}"
        )

        deleted_prescriptions = (
            db.query(Prescription)
            .delete(synchronize_session=False)
        )

        db.commit()

        print(
            f"Old prescriptions deleted: "
            f"{deleted_prescriptions}"
        )

        deleted_shipments = (
            db.query(Shipment)
            .delete(synchronize_session=False)
        )

        db.commit()

        print(
            f"Old shipments deleted: "
            f"{deleted_shipments}"
        )

        db.execute(
            text(
                "ALTER SEQUENCE shipments_id_seq "
                "RESTART WITH 1"
            )
        )

        db.execute(
            text(
                "ALTER SEQUENCE decisions_id_seq "
                "RESTART WITH 1"
            )
        )

        db.execute(
            text(
                "ALTER SEQUENCE outcomes_id_seq "
                "RESTART WITH 1"
            )
        )

        db.commit()

        print("Shipment ID sequence reset to 1")
        print("Decision ID sequence reset to 1")
        print("Outcome ID sequence reset to 1")

        shipment_objects = []

        for item in SHIPMENTS:

            supplier = suppliers[
                item["supplier_index"]
            ]

            shipment = Shipment(
                shipment_code=item["shipment_code"],
                product=item["product"],
                supplier_id=supplier.id,
                quantity=item["quantity"],
                historical_lead_time=item[
                    "historical_lead_time"
                ],
                current_lead_time=item[
                    "current_lead_time"
                ],
                inventory_level=item[
                    "inventory_level"
                ],
                status=item["status"],
                origin=item["origin"],
                destination=item["destination"],
                eta=item["eta"],
                risk_score=item["risk_score"],
            )

            db.add(shipment)
            shipment_objects.append(shipment)

        db.commit()

        for shipment in shipment_objects:
            db.refresh(shipment)

        print(
            f"Shipments created: "
            f"{len(shipment_objects)}"
        )

        print()
        print("Shipment IDs:")

        for shipment in shipment_objects:

            print(
                f"{shipment.id:2d} -> "
                f"{shipment.shipment_code}"
            )

        prediction_objects = []

        for shipment in shipment_objects:

            delay_probability = (
                shipment.risk_score / 100.0
            )

            if (
                shipment.current_lead_time
                > shipment.historical_lead_time
            ):

                predicted_delay_days = (
                    shipment.current_lead_time
                    - shipment.historical_lead_time
                )

            else:

                predicted_delay_days = 0

            prediction = Prediction(
                shipment_id=shipment.id,
                delay_probability=delay_probability,
                predicted_delay_days=predicted_delay_days,
                model_name="Supply Prescript Risk Model",
            )

            db.add(prediction)
            prediction_objects.append(prediction)

        db.commit()

        print(
            f"Predictions created: "
            f"{len(prediction_objects)}"
        )

  
        prescription_objects = []

        for shipment in shipment_objects:

            air_cost = round(
                10000 + (
                    shipment.quantity * 1.25
                ),
                2
            )

            air_delivery_days = max(
                2,
                round(
                    shipment.historical_lead_time
                    * 0.5
                )
            )

            air_prescription = Prescription(
                shipment_id=shipment.id,
                option_name="Air Freight",
                description=(
                    "Use expedited air freight "
                    "to reduce delivery time "
                    "and minimize delay risk."
                ),
                estimated_cost=air_cost,
                delivery_days=air_delivery_days,
                risk_score=10,
                recommendation_rank=1,
            )

            db.add(air_prescription)
            prescription_objects.append(
                air_prescription
            )

            secondary_cost = round(
                air_cost * 1.10,
                2
            )

            secondary_delivery_days = max(
                3,
                shipment.historical_lead_time
            )

            secondary_prescription = Prescription(
                shipment_id=shipment.id,
                option_name="Secondary Supplier",
                description=(
                    "Use a secondary supplier "
                    "to reduce dependency on "
                    "the current supplier."
                ),
                estimated_cost=secondary_cost,
                delivery_days=secondary_delivery_days,
                risk_score=20,
                recommendation_rank=2,
            )

            db.add(secondary_prescription)
            prescription_objects.append(
                secondary_prescription
            )

            launch_cost = round(
                max(
                    5000,
                    air_cost * 0.35
                ),
                2
            )

            launch_delivery_days = (
                shipment.current_lead_time
            )

            launch_prescription = Prescription(
                shipment_id=shipment.id,
                option_name="Delay Product Launch",
                description=(
                    "Delay the product launch "
                    "to absorb the expected "
                    "supply delay."
                ),
                estimated_cost=launch_cost,
                delivery_days=launch_delivery_days,
                risk_score=60,
                recommendation_rank=3,
            )

            db.add(launch_prescription)
            prescription_objects.append(
                launch_prescription
            )

        db.commit()

        print(
            f"Prescriptions created: "
            f"{len(prescription_objects)}"
        )

        supplier_count = db.query(Supplier).count()
        shipment_count = db.query(Shipment).count()
        prediction_count = db.query(Prediction).count()
        prescription_count = db.query(Prescription).count()
        decision_count = db.query(Decision).count()
        outcome_count = db.query(Outcome).count()

        print()
        print("=" * 60)
        print("DATABASE SEED COMPLETED")
        print("=" * 60)

        print(f"Suppliers       : {supplier_count}")
        print(f"Shipments       : {shipment_count}")
        print(f"Predictions     : {prediction_count}")
        print(f"Prescriptions   : {prescription_count}")
        print(f"Decisions       : {decision_count}")
        print(f"Outcomes        : {outcome_count}")

        print("=" * 60)

    except Exception as error:

        db.rollback()

        print()
        print("=" * 60)
        print("SEED FAILED")
        print("=" * 60)
        print(f"Error: {error}")
        print("=" * 60)

        raise

    finally:

        db.close()

if __name__ == "__main__":
    seed_database()