from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.outcome import Outcome
from ..models.decision import Decision
from ..schemas.outcome import (
    OutcomeCreate,
    OutcomeResponse
)


router = APIRouter(
    prefix="/api/outcomes",
    tags=["Outcomes"]
)


@router.post(
    "/",
    response_model=OutcomeResponse,
    status_code=201
)
def create_outcome(
    outcome_data: OutcomeCreate,
    db: Session = Depends(get_db)
):

    # Check whether the decision exists
    decision = (
        db.query(Decision)
        .filter(
            Decision.id == outcome_data.decision_id
        )
        .first()
    )

    if decision is None:

        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    outcome = Outcome(
        decision_id=outcome_data.decision_id,
        actual_cost=outcome_data.actual_cost,
        actual_delivery_days=(
            outcome_data.actual_delivery_days
        ),
        outcome_status=(
            outcome_data.outcome_status
        ),
        notes=outcome_data.notes
    )

    db.add(outcome)

    db.commit()

    db.refresh(outcome)

    return {
        "id": outcome.id,
        "decision_id": outcome.decision_id,
        "actual_cost": outcome.actual_cost,
        "actual_delivery_days": (
            outcome.actual_delivery_days
        ),
        "outcome_status": outcome.outcome_status,
        "notes": outcome.notes,
        "created_at": (
            outcome.created_at.isoformat()
            if outcome.created_at
            else None
        )
    }


@router.get(
    "/",
    response_model=list[OutcomeResponse]
)
def get_outcomes(
    db: Session = Depends(get_db)
):

    outcomes = (
        db.query(Outcome)
        .order_by(Outcome.id.desc())
        .all()
    )

    return [
        {
            "id": outcome.id,
            "decision_id": outcome.decision_id,
            "actual_cost": outcome.actual_cost,
            "actual_delivery_days": (
                outcome.actual_delivery_days
            ),
            "outcome_status": (
                outcome.outcome_status
            ),
            "notes": outcome.notes,
            "created_at": (
                outcome.created_at.isoformat()
                if outcome.created_at
                else None
            )
        }
        for outcome in outcomes
    ]


@router.get(
    "/{outcome_id}",
    response_model=OutcomeResponse
)
def get_outcome(
    outcome_id: int,
    db: Session = Depends(get_db)
):

    outcome = (
        db.query(Outcome)
        .filter(
            Outcome.id == outcome_id
        )
        .first()
    )

    if outcome is None:

        raise HTTPException(
            status_code=404,
            detail="Outcome not found"
        )

    return {
        "id": outcome.id,
        "decision_id": outcome.decision_id,
        "actual_cost": outcome.actual_cost,
        "actual_delivery_days": (
            outcome.actual_delivery_days
        ),
        "outcome_status": (
            outcome.outcome_status
        ),
        "notes": outcome.notes,
        "created_at": (
            outcome.created_at.isoformat()
            if outcome.created_at
            else None
        )
    }
