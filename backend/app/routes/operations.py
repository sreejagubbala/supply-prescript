from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd

router = APIRouter(
    prefix="/api/operations",
    tags=["Operations"]
)

# Project root:
# C:\Users\SREEJA GUBBALA\Desktop\supply-prescript\supply-prescript
PROJECT_ROOT = Path(__file__).resolve().parents[3]

OUTCOME_FILE = PROJECT_ROOT / "data" / "processed" / "decision_outcomes.csv"


@router.get("/summary")
def get_operations_summary():
    """
    Returns Operations dashboard data from the same
    decision_outcomes.csv used by Shipments and ROI.
    """

    if not OUTCOME_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Decision outcome dataset not found: {OUTCOME_FILE}"
        )

    try:
        df = pd.read_csv(OUTCOME_FILE)

        # -----------------------------
        # KPI DATA
        # -----------------------------

        total_shipments = int(df["Shipment_ID"].nunique())

        on_time_mask = (
            df["On_Time"]
            .astype(str)
            .str.strip()
            .str.lower()
            .isin(["true", "1", "yes"])
        )

        on_time_count = int(on_time_mask.sum())
        delayed_count = int(total_shipments - on_time_count)

        # -----------------------------
        # DELAY TREND
        # -----------------------------
        # Group shipments by Decision_Date.
        # Each date contains the number of delayed shipments.

        df["Decision_Date"] = pd.to_datetime(
            df["Decision_Date"],
            errors="coerce"
        )

        trend_df = (
            df.dropna(subset=["Decision_Date"])
            .groupby("Decision_Date")
            .agg(
                total=("Shipment_ID", "nunique"),
                delays=("On_Time", lambda x: (
                    ~x.astype(str)
                    .str.strip()
                    .str.lower()
                    .isin(["true", "1", "yes"])
                ).sum())
            )
            .reset_index()
            .sort_values("Decision_Date")
        )

        # Keep only the most recent 7 days
        trend_df = trend_df.tail(7)

        trend_data = []

        for _, row in trend_df.iterrows():
            trend_data.append({
                "day": row["Decision_Date"].strftime("%b %d"),
                "delays": int(row["delays"]),
                "shipments": int(row["total"])
            })

        # -----------------------------
        # RECENT SHIPMENTS
        # -----------------------------
        # Latest 5 shipments based on Decision_Date.

        recent_df = (
            df.dropna(subset=["Decision_Date"])
            .sort_values("Decision_Date", ascending=False)
            .head(5)
        )

        recent_shipments = []

        for index, row in recent_df.iterrows():

            on_time = (
                str(row["On_Time"])
                .strip()
                .lower()
                in ["true", "1", "yes"]
            )

            recent_shipments.append({
                "id": str(row["Shipment_ID"]),
                "status": "On-Time" if on_time else "Delayed",
                "eta": row["Decision_Date"].strftime("%Y-%m-%d"),
                "origin": str(row["Customer_City"]),
                "destination": str(row["Order_Region"]),
                "riskScore": float(row["Late_delivery_risk"])
            })

        return {
            "totalShipments": total_shipments,
            "onTimeCount": on_time_count,
            "delayedCount": delayed_count,
            "trendData": trend_data,
            "recentShipments": recent_shipments
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate operations summary: {str(e)}"
        )