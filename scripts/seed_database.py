from sqlalchemy import text

from backend.app.database import SessionLocal

from backend.app.models import (
    Supplier,
    Shipment,
    Prediction,
    Prescription,
    Decision,
    Outcome
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
        # CLEAR OLD DATA
        # ============================================================

        # Important:
        # Delete child records first because of foreign keys.

        db.query(Outcome).delete()

        db.query(Decision).delete()

        db.query(Prediction).delete()

        db.query(Prescription).delete()

        db.query(Shipment).delete()

        db.commit()

        print("Old shipment and closed-loop data removed.")

        # ============================================================
        # INSERT 20 SHIPMENTS
        # ============================================================

        db.add_all(shipments)

        db.commit()

        print("Inserted 20 shipments.")

        # ============================================================
        # RESET SHIPMENT ID SEQUENCE
        # ============================================================

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
        # PREDICTIONS FOR ALL 20 SHIPMENTS
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
            ),

            Prediction(
                shipment_id=4,
                delay_probability=15,
                predicted_delay_days=1,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=5,
                delay_probability=85,
                predicted_delay_days=7,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=6,
                delay_probability=20,
                predicted_delay_days=1,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=7,
                delay_probability=8,
                predicted_delay_days=1,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=8,
                delay_probability=91,
                predicted_delay_days=12,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=9,
                delay_probability=25,
                predicted_delay_days=1,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=10,
                delay_probability=55,
                predicted_delay_days=6,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=11,
                delay_probability=18,
                predicted_delay_days=1,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=12,
                delay_probability=10,
                predicted_delay_days=1,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=13,
                delay_probability=22,
                predicted_delay_days=1,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=14,
                delay_probability=72,
                predicted_delay_days=9,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=15,
                delay_probability=5,
                predicted_delay_days=1,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=16,
                delay_probability=60,
                predicted_delay_days=7,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=17,
                delay_probability=14,
                predicted_delay_days=1,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=18,
                delay_probability=88,
                predicted_delay_days=11,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=19,
                delay_probability=30,
                predicted_delay_days=2,
                model_name="XGBoost"
            ),

            Prediction(
                shipment_id=20,
                delay_probability=95,
                predicted_delay_days=13,
                model_name="XGBoost"
            )
        ]

        db.add_all(predictions)

        db.commit()

        print("Inserted 20 predictions.")

        # ============================================================
        # PRESCRIPTIONS FOR ALL 20 SHIPMENTS
        # ============================================================

        prescription_data = [

            ("Air Freight", "Use air freight for faster delivery",
             15000, 3, 10),

            ("Standard Transport", "Continue with standard transportation",
             9000, 2, 12),

            ("Air Freight", "Use air freight to reduce delay risk",
             18000, 4, 15),

            ("Standard Transport", "Continue with standard transportation",
             8000, 2, 15),

            ("Air Freight", "Use air freight to handle high delay risk",
             14500, 4, 12),

            ("Standard Transport", "Use standard transport for stable shipment",
             9500, 2, 20),

            ("Standard Transport", "Continue with normal transportation",
             8500, 2, 8),

            ("Air Freight", "Use air freight for high-risk shipment",
             19000, 4, 10),

            ("Standard Transport", "Continue with standard transportation",
             8200, 2, 25),

            ("Secondary Supplier", "Use an alternate supplier to reduce delay",
             12500, 5, 30),

            ("Standard Transport", "Continue with standard transportation",
             9000, 2, 18),

            ("Standard Transport", "Continue with normal transportation",
             8800, 2, 10),

            ("Standard Transport", "Continue with normal transportation",
             7600, 2, 22),

            ("Air Freight", "Use air freight to reduce high delay risk",
             15500, 4, 15),

            ("Standard Transport", "Continue with normal transportation",
             9500, 2, 5),

            ("Secondary Supplier", "Use alternate supplier to reduce delay",
             12000, 5, 35),

            ("Standard Transport", "Continue with normal transportation",
             9200, 2, 14),

            ("Air Freight", "Use air freight for high-risk shipment",
             16000, 4, 12),

            ("Standard Transport", "Continue with normal transportation",
             8700, 2, 30),

            ("Air Freight", "Use air freight for extremely high-risk shipment",
             17000, 4, 10)
        ]

        prescriptions = []

        for index, data in enumerate(
            prescription_data,
            start=1
        ):

            option_name = data[0]
            description = data[1]
            estimated_cost = data[2]
            delivery_days = data[3]
            risk_score = data[4]

            prescription = Prescription(

                shipment_id=index,

                option_name=option_name,

                description=description,

                estimated_cost=estimated_cost,

                delivery_days=delivery_days,

                risk_score=risk_score,

                recommendation_rank=1
            )

            prescriptions.append(prescription)

        db.add_all(prescriptions)

        db.commit()

        for prescription in prescriptions:
            db.refresh(prescription)

        print("Inserted 20 prescriptions.")

        # ============================================================
        # DECISIONS FOR ALL 20 SHIPMENTS
        # ============================================================

        decisions = []

        for index, prescription in enumerate(
            prescriptions,
            start=1
        ):

            decision = Decision(

                shipment_id=index,

                prescription_id=prescription.id,

                selected_option=prescription.option_name,

                estimated_cost=prescription.estimated_cost,

                user_name="Manager",

                decision_status="Executed"
            )

            decisions.append(decision)

        db.add_all(decisions)

        db.commit()

        for decision in decisions:
            db.refresh(decision)

        print("Inserted 20 decisions.")

        # ============================================================
        # OUTCOMES FOR ALL 20 DECISIONS
        # ============================================================

        outcomes = []

        # Actual delivery days and actual cost are intentionally
        # varied so the Decision History page demonstrates:
        #
        # - Successful decisions
        # - Delayed decisions
        # - Cost savings
        # - Negative savings
        # - On-time deliveries
        # - Late deliveries

        actual_delivery_days = [

            3,   # Shipment 1
            2,   # Shipment 2
            5,   # Shipment 3
            2,   # Shipment 4
            6,   # Shipment 5
            2,   # Shipment 6
            2,   # Shipment 7
            6,   # Shipment 8
            2,   # Shipment 9
            7,   # Shipment 10
            2,   # Shipment 11
            2,   # Shipment 12
            2,   # Shipment 13
            6,   # Shipment 14
            2,   # Shipment 15
            7,   # Shipment 16
            2,   # Shipment 17
            6,   # Shipment 18
            2,   # Shipment 19
            7    # Shipment 20
        ]

        actual_costs = [

            14000,   # Shipment 1
            8500,    # Shipment 2
            17500,   # Shipment 3
            7600,    # Shipment 4
            15000,   # Shipment 5
            9000,    # Shipment 6
            8000,    # Shipment 7
            18500,   # Shipment 8
            7900,    # Shipment 9
            13000,   # Shipment 10
            8500,    # Shipment 11
            8200,    # Shipment 12
            7400,    # Shipment 13
            16000,   # Shipment 14
            9000,    # Shipment 15
            12500,   # Shipment 16
            8800,    # Shipment 17
            16500,   # Shipment 18
            8300,    # Shipment 19
            18000    # Shipment 20
        ]

        outcome_statuses = [

            "Successful",
            "Successful",
            "Successful",
            "Successful",
            "Delayed",
            "Successful",
            "Successful",
            "Delayed",
            "Successful",
            "Delayed",
            "Successful",
            "Successful",
            "Successful",
            "Delayed",
            "Successful",
            "Delayed",
            "Successful",
            "Delayed",
            "Successful",
            "Delayed"
        ]

        outcome_notes = [

            "Air freight delivered on time and below estimated cost.",

            "Standard transport delivered on time with cost savings.",

            "Air freight reduced the expected delivery delay.",

            "Shipment delivered on schedule.",

            "Shipment arrived later than expected.",

            "Shipment delivered successfully within expected time.",

            "Shipment delivered on time with low risk.",

            "High-risk shipment experienced a delivery delay.",

            "Shipment delivered successfully.",

            "Shipment experienced a moderate delivery delay.",

            "Shipment delivered successfully with cost savings.",

            "Shipment delivered on time.",

            "Shipment delivered successfully.",

            "Shipment arrived later than expected.",

            "Shipment delivered on time with low risk.",

            "Alternate supplier decision still experienced a delay.",

            "Shipment delivered successfully.",

            "High-risk shipment experienced a delivery delay.",

            "Shipment delivered successfully.",

            "High-risk shipment experienced a delivery delay."
        ]

        for index, decision in enumerate(
            decisions
        ):

            outcome = Outcome(

                decision_id=decision.id,

                actual_cost=actual_costs[index],

                actual_delivery_days=actual_delivery_days[index],

                outcome_status=outcome_statuses[index],

                notes=outcome_notes[index]
            )

            outcomes.append(outcome)

        db.add_all(outcomes)

        db.commit()

        print("Inserted 20 outcomes.")

        # ============================================================
        # COMPLETE
        # ============================================================

        print("")
        print("================================================")
        print("SAMPLE DATABASE DATA IS READY")
        print("================================================")
        print("Suppliers      : 3")
        print("Shipments      : 20")
        print("Predictions    : 20")
        print("Prescriptions  : 20")
        print("Decisions      : 20")
        print("Outcomes       : 20")
        print("================================================")
        print("Closed-loop data is ready.")
        print("Decision History should show 20 records.")
        print("================================================")


    except Exception as error:

        db.rollback()

        print("")
        print("================================================")
        print("DATABASE SEED ERROR")
        print("================================================")
        print(error)
        print("================================================")

        raise

    finally:

        db.close()


if __name__ == "__main__":

    seed_database()