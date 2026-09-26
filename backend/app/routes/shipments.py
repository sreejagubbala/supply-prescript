from fastapi import APIRouter, Depends, HTTPException
from pathlib import Path
import pandas as pd

from ..schemas.shipment import ShipmentCreate, ShipmentResponse
from ..database import get_db
from ..models.shipment import Shipment

router = APIRouter(
    prefix="/api/shipments",
    tags=["Shipments"]
)

# Common dashboard dataset
BASE_DIR = Path(__file__).resolve().parents[3]
OUTCOME_FILE = BASE_DIR / "data" / "processed" / "decision_outcomes.csv"


@router.get(
    "/",
    response_model=list[ShipmentResponse]
)
def get_shipments(
    db=Depends(get_db)
):
    shipments = (
        db.query(Shipment)
        .order_by(Shipment.id)
        .all()
    )

    return [
        {
            "id": shipment.id,
            "origin": shipment.origin,
            "destination": shipment.destination,
            "status": shipment.status,
            "eta": shipment.eta,
            "riskScore": shipment.risk_score
        }
        for shipment in shipments
    ]


@router.get(
    "/{shipment_id}",
    response_model=ShipmentResponse
)
def get_shipment(shipment_id: int):

    df = pd.read_csv(OUTCOME_FILE)

    if shipment_id < 1 or shipment_id > len(df):
        raise HTTPException(
            status_code=404,
            detail="Shipment not found"
        )

    row = df.iloc[shipment_id - 1]

    on_time = str(row["On_Time"]).lower() in ["true", "1", "yes"]

    status = "On Track" if on_time else "At Risk"

    risk_score = float(row["Late_delivery_risk"])

    return {
        "id": shipment_id,
        "origin": str(row["Customer_City"]),
        "destination": str(row["Order_Region"]),
        "status": status,
        "eta": None,
        "riskScore": risk_score
    }


@router.post(
    "/",
    response_model=ShipmentResponse,
    status_code=201
)
def create_shipment(
    shipment_data: ShipmentCreate,
    db = Depends(get_db)
):

    existing_shipment = (
        db.query(Shipment)
        .filter(
            Shipment.shipment_code
            == shipment_data.shipment_code
        )
        .first()
    )

    if existing_shipment:
        raise HTTPException(
            status_code=400,
            detail="Shipment code already exists"
        )

    shipment = Shipment(
        shipment_code=shipment_data.shipment_code,
        product=shipment_data.product,
        supplier_id=shipment_data.supplier_id,
        quantity=shipment_data.quantity,
        historical_lead_time=shipment_data.historical_lead_time,
        current_lead_time=shipment_data.current_lead_time,
        inventory_level=shipment_data.inventory_level,
        status=shipment_data.status,
        origin=shipment_data.origin,
        destination=shipment_data.destination,
        eta=shipment_data.eta,
        risk_score=shipment_data.risk_score
    )

    db.add(shipment)
    db.commit()
    db.refresh(shipment)

    return {
        "id": shipment.id,
        "origin": shipment.origin,
        "destination": shipment.destination,
        "status": shipment.status,
        "eta": shipment.eta,
        "riskScore": shipment.risk_score
    }