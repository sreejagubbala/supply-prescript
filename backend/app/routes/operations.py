from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models.shipment import Shipment


router = APIRouter(
    prefix="/api/operations",
    tags=["Operations"]
)


@router.get("/summary")
def get_operations_summary(
    db: Session = Depends(get_db)
):

    # Total number of shipments
    total_shipments = (
        db.query(Shipment)
        .count()
    )

    # Shipments that are on time
    on_time_count = (
        db.query(Shipment)
        .filter(
            func.lower(Shipment.status) == "on time"
        )
        .count()
    )

    # Shipments that are delayed
    delayed_count = (
        db.query(Shipment)
        .filter(
            func.lower(Shipment.status) == "delayed"
        )
        .count()
    )

    # Trend data
    trend_data = []

    return {
        "totalShipments": total_shipments,
        "onTimeCount": on_time_count,
        "delayedCount": delayed_count,
        "trendData": trend_data
    }
