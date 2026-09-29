from sqlalchemy import text
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
        # ============================================================
        # SUPPLIERS
        # ============================================================

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

        # Get suppliers
        suppliers = (
            db.query(Supplier)
            .order_by(Supplier.id)
            .all()
        )

        if len(suppliers) < 3:

            raise Exception(
                "At least 3 suppliers are required before creating shipments."
            )

        # ============================================================
        # SHIPMENTS
        # ============================================================

        # ------------------------------------------------------------
        # IMPORTANT:
        # We want shipment database IDs from 1 to 20.
        # ------------------------------------------------------------

        shipments = [

            Shipment(
                id=1,
                shipment_code="SHP001",
                product="Microchips",
                supplier_id=suppliers[0].id,
                quantity=5000,
                historical_lead_time=7,
                current_lead_time=21,
                inventory_level=2000,
                status="Delayed",
                origin="Delhi",
                destination="Mumbai",
                eta="2026-09-15",
                risk_score=87
            ),

            Shipment(
                id=2,
                shipment_code="SHP002",
                product="Processors",
                supplier_id=suppliers[1].id,
                quantity=3000,
                historical_lead_time=5,
                current_lead_time=6,
                inventory_level=4000,
                status="On-Time",
                origin="Mumbai",
                destination="Bangalore",
                eta="2026-09-12",
                risk_score=12
            ),

            Shipment(
                id=3,
                shipment_code="SHP003",
                product="Memory Modules",
                supplier_id=suppliers[2].id,
                quantity=7000,
                historical_lead_time=8,
                current_lead_time=18,
                inventory_level=1500,
                status="Delayed",
                origin="Bangalore",
                destination="Delhi",
                eta="2026-09-18",
                risk_score=76
            ),

            Shipment(
                id=4,
                shipment_code="SHP004",
                product="Sensors",
                supplier_id=suppliers[0].id,
                quantity=2500,
                historical_lead_time=6,
                current_lead_time=7,
                inventory_level=3500,
                status="On-Time",
                origin="Kolkata",
                destination="Chennai",
                eta="2026-09-20",
                risk_score=15
            ),

            Shipment(
                id=5,
                shipment_code="SHP005",
                product="Controllers",
                supplier_id=suppliers[1].id,
                quantity=4000,
                historical_lead_time=5,
                current_lead_time=12,
                inventory_level=1800,
                status="Delayed",
                origin="Delhi",
                destination="Mumbai",
                eta="2026-09-21",
                risk_score=85
            ),

            Shipment(
                id=6,
                shipment_code="SHP006",
                product="Processors",
                supplier_id=suppliers[2].id,
                quantity=3200,
                historical_lead_time=6,
                current_lead_time=7,
                inventory_level=4200,
                status="On-Time",
                origin="Pune",
                destination="Bengaluru",
                eta="2026-09-22",
                risk_score=20
            ),

            Shipment(
                id=7,
                shipment_code="SHP007",
                product="Microchips",
                supplier_id=suppliers[0].id,
                quantity=5200,
                historical_lead_time=7,
                current_lead_time=8,
                inventory_level=3000,
                status="On-Time",
                origin="Chennai",
                destination="Hyderabad",
                eta="2026-09-23",
                risk_score=8
            ),

            Shipment(
                id=8,
                shipment_code="SHP008",
                product="Memory Modules",
                supplier_id=suppliers[1].id,
                quantity=6500,
                historical_lead_time=8,
                current_lead_time=20,
                inventory_level=1200,
                status="Delayed",
                origin="Bengaluru",
                destination="Delhi",
                eta="2026-09-24",
                risk_score=91
            ),

            Shipment(
                id=9,
                shipment_code="SHP009",
                product="Sensors",
                supplier_id=suppliers[2].id,
                quantity=2800,
                historical_lead_time=5,
                current_lead_time=6,
                inventory_level=3600,
                status="On-Time",
                origin="Mumbai",
                destination="Pune",
                eta="2026-09-25",
                risk_score=25
            ),

            Shipment(
                id=10,
                shipment_code="SHP010",
                product="Controllers",
                supplier_id=suppliers[0].id,
                quantity=4500,
                historical_lead_time=7,
                current_lead_time=13,
                inventory_level=1900,
                status="Delayed",
                origin="Delhi",
                destination="Kolkata",
                eta="2026-09-26",
                risk_score=55
            ),

            Shipment(
                id=11,
                shipment_code="SHP011",
                product="Microchips",
                supplier_id=suppliers[1].id,
                quantity=3500,
                historical_lead_time=6,
                current_lead_time=7,
                inventory_level=4000,
                status="On-Time",
                origin="Pune",
                destination="Mumbai",
                eta="2026-09-27",
                risk_score=18
            ),

            Shipment(
                id=12,
                shipment_code="SHP012",
                product="Processors",
                supplier_id=suppliers[2].id,
                quantity=3000,
                historical_lead_time=5,
                current_lead_time=6,
                inventory_level=4500,
                status="On-Time",
                origin="Bengaluru",
                destination="Chennai",
                eta="2026-09-28",
                risk_score=10
            ),

            Shipment(
                id=13,
                shipment_code="SHP013",
                product="Sensors",
                supplier_id=suppliers[0].id,
                quantity=2200,
                historical_lead_time=5,
                current_lead_time=6,
                inventory_level=3200,
                status="On-Time",
                origin="Ahmedabad",
                destination="Surat",
                eta="2026-09-29",
                risk_score=22
            ),

            Shipment(
                id=14,
                shipment_code="SHP014",
                product="Controllers",
                supplier_id=suppliers[1].id,
                quantity=4100,
                historical_lead_time=6,
                current_lead_time=15,
                inventory_level=1600,
                status="Delayed",
                origin="Jaipur",
                destination="Delhi",
                eta="2026-09-30",
                risk_score=72
            ),

            Shipment(
                id=15,
                shipment_code="SHP015",
                product="Microchips",
                supplier_id=suppliers[2].id,
                quantity=5500,
                historical_lead_time=7,
                current_lead_time=7,
                inventory_level=5000,
                status="On-Time",
                origin="Chennai",
                destination="Coimbatore",
                eta="2026-10-01",
                risk_score=5
            ),

            Shipment(
                id=16,
                shipment_code="SHP016",
                product="Processors",
                supplier_id=suppliers[0].id,
                quantity=2800,
                historical_lead_time=6,
                current_lead_time=14,
                inventory_level=1700,
                status="Delayed",
                origin="Lucknow",
                destination="Kanpur",
                eta="2026-10-02",
                risk_score=60
            ),

            Shipment(
                id=17,
                shipment_code="SHP017",
                product="Memory Modules",
                supplier_id=suppliers[1].id,
                quantity=6200,
                historical_lead_time=8,
                current_lead_time=8,
                inventory_level=4000,
                status="On-Time",
                origin="Bengaluru",
                destination="Mysuru",
                eta="2026-10-03",
                risk_score=14
            ),

            Shipment(
                id=18,
                shipment_code="SHP018",
                product="Sensors",
                supplier_id=suppliers[2].id,
                quantity=2600,
                historical_lead_time=5,
                current_lead_time=16,
                inventory_level=1400,
                status="Delayed",
                origin="Mumbai",
                destination="Nagpur",
                eta="2026-10-04",
                risk_score=88
            ),

            Shipment(
                id=19,
                shipment_code="SHP019",
                product="Controllers",
                supplier_id=suppliers[0].id,
                quantity=3900,
                historical_lead_time=6,
                current_lead_time=7,
                inventory_level=3800,
                status="On-Time",
                origin="Kolkata",
                destination="Bhubaneswar",
                eta="2026-10-05",
                risk_score=30
            ),

            Shipment(
                id=20,
                shipment_code="SHP020",
                product="Microchips",
                supplier_id=suppliers[1].id,
                quantity=4800,
                historical_lead_time=7,
                current_lead_time=19,
                inventory_level=1300,
                status="Delayed",
                origin="Delhi",
                destination="Chandigarh",
                eta="2026-10-06",
                risk_score=95
            )
        ]

        # ============================================================
        # REMOVE OLD SHIPMENTS
        # ============================================================

        # Existing shipments may have IDs 4-23.
        # Delete their dependent predictions/prescriptions first.

        db.query(Prediction).delete()
        db.query(Prescription).delete()
        db.query(Shipment).delete()

        db.commit()

        # ============================================================
        # INSERT SHIPMENTS WITH IDs 1-20
        # ============================================================

        db.add_all(shipments)
        db.commit()

        print("Inserted 20 shipments with IDs 1-20.")

        # ============================================================
        # RESET POSTGRES SEQUENCE
        # ============================================================

        # Make sure the next automatically generated shipment ID
        # becomes 21.

        db.execute(
            text(
                """
                SELECT setval(
                    pg_get_serial_sequence('shipments', 'id'),
                    20,
                    true
                )
                """
           )
        )

        db.commit()

        # ============================================================
        # PREDICTIONS
        # ============================================================

        predictions = [

            Prediction(
                shipment_id=1,
                delay_probability=87,
                predicted_delay_days=14,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=2,
                delay_probability=12,
                predicted_delay_days=2,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=3,
                delay_probability=76,
                predicted_delay_days=10,
                model_name="XGBoost"
            )
        ]

        db.add_all(predictions)
        db.commit()

        # ============================================================
        # PRESCRIPTIONS
        # ============================================================

        prescriptions = [

            Prescription(
                shipment_id=1,
                option_name="Air Freight",
                description="Use air freight for faster delivery",
                estimated_cost=15000,
                delivery_days=3,
                risk_score=10,
                recommendation_rank=1
            ),

            Prescription(
                shipment_id=1,
                option_name="Secondary Supplier",
                description="Purchase from an alternate supplier",
                estimated_cost=16500,
                delivery_days=5,
                risk_score=20,
                recommendation_rank=2
            ),

            Prescription(
                shipment_id=1,
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

        # ============================================================
        # COMPLETE
        # ============================================================

        print("Sample database data is ready.")
        print("Shipment IDs: 1 to 20")

    finally:

        db.close()


if __name__ == "__main__":
    seed_database()