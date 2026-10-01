from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd


router = APIRouter(
    tags=["Decisions"]
)


PROJECT_ROOT = Path(__file__).resolve().parents[3]

OUTCOME_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "decision_outcomes.csv"
)


def load_outcome_data():
    if not OUTCOME_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Decision outcome dataset not found: {OUTCOME_FILE}"
        )

    try:
        return pd.read_csv(OUTCOME_FILE)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read decision outcome dataset: {str(e)}"
        )

        existing_outcome.actual_delivery_days = (
            outcome.actual_delivery_days
        )

@router.get("/")
def get_outcomes():

    df = load_outcome_data()

    outcomes = []

    for index, row in df.iterrows():

        on_time = (
            str(row["On_Time"])
            .strip()
            .lower()
            in ["true", "1", "yes"]
        )

        action_success = (
            str(row["Action_Success"])
            .strip()
            .lower()
            in ["true", "1", "yes"]
        )

        outcomes.append({

            "id": index + 1,

            "decision_id": str(
                row["Decision_ID"]
            ),

            "shipment_id": str(
                row["Shipment_ID"]
            ),

            "decision_date": str(
                row["Decision_Date"]
            ),

            "product": str(
                row["Category_Name"]
            ),

            "quantity": int(
                row["Order_Item_Quantity"]
            ),

            "origin": str(
                row["Customer_City"]
            ),

            "destination": str(
                row["Order_Region"]
            ),

            "risk_score": float(
                row["Late_delivery_risk"]
            ),

            "recommended_action": str(
                row["Recommended_Action"]
            ),

            "selected_action": str(
                row["Selected_Action"]
            ),

            "manager_override": False,

            "expected_delivery_days": float(
                row["Expected_Delay_Days"]
            ),

            "actual_delivery_days": float(
                row["Actual_Delay_Days"]
            ),

            "delivery_difference": float(
                row["Delay_Variance_Days"]
            ),

            "expected_cost": float(
                row["Expected_Cost"]
            ),

            "actual_cost": float(
                row["Actual_Cost"]
            ),

            "cost_saving": float(
                row["Cost_Saving"]
            ),

            "cost_saving_percentage": float(
                row["Cost_Saving_Percentage"]
            ),

            "on_time": on_time,

            "action_success": action_success,

            "outcome_status": (
                "Successful"
                if action_success
                else "Delayed"
            ),

            "notes": (
                "Closed-loop outcome evaluation"
            ),

            "user_name": "Closed-Loop Analytics"

        })

    return outcomes
