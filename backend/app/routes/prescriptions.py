from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.prescription import Prescription
from ..schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse
)


router = APIRouter(
    prefix="/api/prescriptions",
    tags=["Prescriptions"]
)


@router.post(
    "/",
    response_model=PrescriptionResponse,
    status_code=201
)
def create_prescription(
    prescription_data: PrescriptionCreate,
    db: Session = Depends(get_db)
):

    prescription = Prescription(
        shipment_id=prescription_data.shipment_id,
        option_name=prescription_data.option_name,
        description=prescription_data.description,
        estimated_cost=prescription_data.estimated_cost,
        delivery_days=prescription_data.delivery_days,
        risk_score=prescription_data.risk_score,
        recommendation_rank=prescription_data.recommendation_rank
    )

    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    return {
        "id": prescription.id,
        "shipment_id": prescription.shipment_id,
        "option_name": prescription.option_name,
        "description": prescription.description,
        "estimated_cost": prescription.estimated_cost,
        "delivery_days": prescription.delivery_days,
        "risk_score": prescription.risk_score,
        "recommendation_rank": prescription.recommendation_rank,
        "created_at": (
            prescription.created_at.isoformat()
            if prescription.created_at
            else None
        )
    }


@router.get(
    "/",
    response_model=list[PrescriptionResponse]
)
def get_prescriptions(
    db: Session = Depends(get_db)
):

    prescriptions = (
        db.query(Prescription)
        .order_by(
            Prescription.recommendation_rank,
            Prescription.id
        )
        .all()
    )

    return [
        {
            "id": prescription.id,
            "shipment_id": prescription.shipment_id,
            "option_name": prescription.option_name,
            "description": prescription.description,
            "estimated_cost": prescription.estimated_cost,
            "delivery_days": prescription.delivery_days,
            "risk_score": prescription.risk_score,
            "recommendation_rank": prescription.recommendation_rank,
            "created_at": (
                prescription.created_at.isoformat()
                if prescription.created_at
                else None
            )
        }
        for prescription in prescriptions
    ]


@router.get(
    "/shipment/{shipment_id}",
    response_model=list[PrescriptionResponse]
)
def get_shipment_prescriptions(
    shipment_id: int,
    db: Session = Depends(get_db)
):

    prescriptions = (
        db.query(Prescription)
        .filter(
            Prescription.shipment_id == shipment_id
        )
        .order_by(
            Prescription.recommendation_rank,
            Prescription.id
        )
        .all()
    )

    return [
        {
            "id": prescription.id,
            "shipment_id": prescription.shipment_id,
            "option_name": prescription.option_name,
            "description": prescription.description,
            "estimated_cost": prescription.estimated_cost,
            "delivery_days": prescription.delivery_days,
            "risk_score": prescription.risk_score,
            "recommendation_rank": prescription.recommendation_rank,
            "created_at": (
                prescription.created_at.isoformat()
                if prescription.created_at
                else None
            )
        }
        for prescription in prescriptions
    ]


@router.get(
    "/{prescription_id}",
    response_model=PrescriptionResponse
)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db)
):

    prescription = (
        db.query(Prescription)
        .filter(
            Prescription.id == prescription_id
        )
        .first()
    )

    if prescription is None:
        raise HTTPException(
            status_code=404,
            detail="Prescription not found"
        )

    return {
        "id": prescription.id,
        "shipment_id": prescription.shipment_id,
        "option_name": prescription.option_name,
        "description": prescription.description,
        "estimated_cost": prescription.estimated_cost,
        "delivery_days": prescription.delivery_days,
        "risk_score": prescription.risk_score,
        "recommendation_rank": prescription.recommendation_rank,
        "created_at": (
            prescription.created_at.isoformat()
            if prescription.created_at
            else None
        )
    }
