from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.shipment import Shipment
from ..schemas.shipment import ShipmentCreate, ShipmentResponse


router = APIRouter(
    prefix="/api/shipments",
    tags=["Shipments"]
)


@router.get(
    "/",
    response_model=list[ShipmentResponse]
)
def get_shipments(
    db: Session = Depends(get_db)
):

    shipments = (
        db.query(Shipment)
        .order_by(Shipment.id)
        .all()
    )

    return shipments


@router.get(
    "/{shipment_id}",
    response_model=ShipmentResponse
)
def get_shipment(
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

    return shipment


@router.post(
    "/",
    response_model=ShipmentResponse,
    status_code=201
)
def create_shipment(
    shipment_data: ShipmentCreate,
    db: Session = Depends(get_db)
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
        status=shipment_data.status
    )

    db.add(shipment)

    db.commit()

    db.refresh(shipment)

    return shipment
