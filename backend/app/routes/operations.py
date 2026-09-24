from fastapi import APIRouter
from pathlib import Path
import pandas as pd

router = APIRouter(
    prefix="/api/operations",
    tags=["Operations"]
)

# Path to the common decision outcome dataset
BASE_DIR = Path(__file__).resolve().parents[3]
OUTCOME_FILE = BASE_DIR / "data" / "processed" / "decision_outcomes.csv"


@router.get("/summary")
def get_operations_summary():

    # Read the same dataset used by ROI
    df = pd.read_csv(OUTCOME_FILE)

    # Total number of shipments
    total_shipments = df["Shipment_ID"].nunique()

    # Shipments that were on time
    on_time_count = int(
        df["On_Time"]
        .astype(str)
        .str.lower()
        .isin(["true", "1", "yes"])
        .sum()
    )

    # Shipments that were delayed
    delayed_count = total_shipments - on_time_count

    # Trend data
    trend_data = []

    return {
        "totalShipments": int(total_shipments),
        "onTimeCount": on_time_count,
        "delayedCount": delayed_count,
        "trendData": trend_data
    }