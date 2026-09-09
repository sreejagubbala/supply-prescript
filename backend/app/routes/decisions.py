from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.decision import Decision
from ..schemas.decision import (
    DecisionCreate,
    DecisionResponse
)


router = APIRouter(
    prefix="/api/decisions",
    tags=["Decisions"]
)


@router.post(
    "/",
    response_model=DecisionResponse,
    status_code=201
)
def create_decision(
    decision_data: DecisionCreate,
    db: Session = Depends(get_db)
):

    decision = Decision(
        shipment_id=decision_data.shipment_id,
        prescription_id=decision_data.prescription_id,
        selected_option=decision_data.selected_option,
        estimated_cost=decision_data.estimated_cost,
        user_name=decision_data.user_name,
        decision_status=decision_data.decision_status
    )

    db.add(decision)

    db.commit()

    db.refresh(decision)

    return {
        "id": decision.id,
        "shipment_id": decision.shipment_id,
        "prescription_id": decision.prescription_id,
        "selected_option": decision.selected_option,
        "estimated_cost": decision.estimated_cost,
        "user_name": decision.user_name,
        "decision_status": decision.decision_status,
        "created_at": (
            decision.created_at.isoformat()
            if decision.created_at
            else None
        )
    }


@router.get(
    "/",
    response_model=list[DecisionResponse]
)
def get_decisions(
    db: Session = Depends(get_db)
):

    decisions = (
        db.query(Decision)
        .order_by(Decision.id.desc())
        .all()
    )

    return [
        {
            "id": decision.id,
            "shipment_id": decision.shipment_id,
            "prescription_id": decision.prescription_id,
            "selected_option": decision.selected_option,
            "estimated_cost": decision.estimated_cost,
            "user_name": decision.user_name,
            "decision_status": decision.decision_status,
            "created_at": (
                decision.created_at.isoformat()
                if decision.created_at
                else None
            )
        }
        for decision in decisions
    ]


@router.get(
    "/{decision_id}",
    response_model=DecisionResponse
)
def get_decision(
    decision_id: int,
    db: Session = Depends(get_db)
):

    decision = (
        db.query(Decision)
        .filter(
            Decision.id == decision_id
        )
        .first()
    )

    if decision is None:

        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    return {
        "id": decision.id,
        "shipment_id": decision.shipment_id,
        "prescription_id": decision.prescription_id,
        "selected_option": decision.selected_option,
        "estimated_cost": decision.estimated_cost,
        "user_name": decision.user_name,
        "decision_status": decision.decision_status,
        "created_at": (
            decision.created_at.isoformat()
            if decision.created_at
            else None
        )
    }
