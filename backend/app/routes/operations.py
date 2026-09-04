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

    total_shipments = (
        db.query(Shipment)
        .count()
    )

    on_time_count = (
        db.query(Shipment)
        .filter(
            func.lower(Shipment.status)
            == "on time"
        )
        .count()
    )

    delayed_count = (
        db.query(Shipment)
        .filter(
            func.lower(Shipment.status)
            == "delayed"
        )
        .count()
    )

    trend_data = []

    return {
        "totalShipments": total_shipments,
        "onTimeCount": on_time_count,
        "delayedCount": delayed_count,
        "trendData": trend_data
    }
