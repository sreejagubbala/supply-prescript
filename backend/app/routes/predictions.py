from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.shipment import Shipment
from ..schemas.prediction import PredictionResponse
from ..services.ml_service import ml_service


router = APIRouter(
    prefix="/api/predictions",
    tags=["Predictions"]
)


@router.get(
    "/{shipment_id}",
    response_model=PredictionResponse
)
def get_prediction(
    shipment_id: int,
    db: Session = Depends(get_db)
):

    shipment = (
        db.query(Shipment)
        .filter(
            Shipment.id == shipment_id
        )
        .first()
    )

    if shipment is None:

        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )


    features = [
        shipment.historical_lead_time or 0,
        shipment.current_lead_time or 0,
        shipment.inventory_level or 0,
        shipment.quantity or 0
    ]


    prediction = ml_service.predict(
        features
    )


    return {
        "shipment_id": shipment.id,
        "riskScore": prediction["riskScore"],
        "prediction": prediction["prediction"],
        "confidence": prediction["confidence"]
    }
