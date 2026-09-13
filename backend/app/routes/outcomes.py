from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db

from ..models.outcome import Outcome
from ..models.decision import Decision
from ..models.shipment import Shipment
from ..models.prescription import Prescription

from ..schemas.outcome import (
    OutcomeCreate,
    OutcomeResponse
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/outcomes",
    tags=["Outcomes"]
)


# ============================================================
# CREATE OUTCOME
# ============================================================

@router.post(
    "/",
    response_model=OutcomeResponse,
    status_code=201
)
def create_outcome(
    outcome_data: OutcomeCreate,
    db: Session = Depends(get_db)
):
    """
    Record the actual outcome of a decision.
    """

    # --------------------------------------------------------
    # Check whether the decision exists
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Create outcome
    # --------------------------------------------------------

    outcome = Outcome(
        decision_id=outcome_data.decision_id,
        actual_cost=outcome_data.actual_cost,
        actual_delivery_days=outcome_data.actual_delivery_days,
        outcome_status=outcome_data.outcome_status,
        notes=outcome_data.notes
    )

    db.add(outcome)
    db.commit()
    db.refresh(outcome)

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return {
        "id": outcome.id,
        "decision_id": outcome.decision_id,
        "actual_cost": outcome.actual_cost,
        "actual_delivery_days": outcome.actual_delivery_days,
        "outcome_status": outcome.outcome_status,
        "notes": outcome.notes,
        "created_at": (
            outcome.created_at.isoformat()
            if outcome.created_at
            else None
        )
    }


# ============================================================
# GET ALL OUTCOMES
# ============================================================

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
            "actual_delivery_days": outcome.actual_delivery_days,
            "outcome_status": outcome.outcome_status,
            "notes": outcome.notes,
            "created_at": (
                outcome.created_at.isoformat()
                if outcome.created_at
                else None
            )
        }
        for outcome in outcomes
    ]


# ============================================================
# DECISION HISTORY
# ============================================================

@router.get(
    "/history"
)
def get_decision_history(
    db: Session = Depends(get_db)
):

    records = (
        db.query(
            Outcome,
            Decision,
            Shipment,
            Prescription
        )
        .join(
            Decision,
            Outcome.decision_id == Decision.id
        )
        .join(
            Shipment,
            Decision.shipment_id == Shipment.id
        )
        .join(
            Prescription,
            Decision.prescription_id == Prescription.id
        )
        .order_by(
            Outcome.id.desc()
        )
        .all()
    )

    history = []

    for outcome, decision, shipment, prescription in records:

        expected_cost = decision.estimated_cost

        if expected_cost is None:
            expected_cost = prescription.estimated_cost

        expected_delivery = prescription.delivery_days

        actual_delivery = outcome.actual_delivery_days

        delivery_difference = None

        if (
            expected_delivery is not None
            and actual_delivery is not None
        ):
            delivery_difference = (
                actual_delivery - expected_delivery
            )

        cost_saving = None

        if (
            expected_cost is not None
            and outcome.actual_cost is not None
        ):
            cost_saving = (
                expected_cost - outcome.actual_cost
            )

        recommended_action = prescription.option_name

        selected_action = decision.selected_option

        manager_override = (
            selected_action != recommended_action
        )

        status = (
            str(outcome.outcome_status).strip().lower()
            if outcome.outcome_status
            else ""
        )

        action_success = status in [
            "success",
            "successful",
            "completed",
            "on-time",
            "on time",
            "ontime"
        ]

        on_time = None

        if (
            expected_delivery is not None
            and actual_delivery is not None
        ):
            on_time = (
                actual_delivery <= expected_delivery
            )

        decision_date = decision.created_at

        history.append(
            {
                "decision_id": decision.id,

                "shipment_id": shipment.shipment_code,

                "decision_date": (
                    decision_date.isoformat()
                    if decision_date
                    else None
                ),

                "product": shipment.product,

                "quantity": shipment.quantity,

                "origin": shipment.origin,

                "destination": shipment.destination,

                "risk_score": shipment.risk_score,

                "recommended_action": recommended_action,

                "selected_action": selected_action,

                "manager_override": manager_override,

                "expected_delivery_days": expected_delivery,

                "actual_delivery_days": actual_delivery,

                "delivery_difference": delivery_difference,

                "expected_cost": expected_cost,

                "actual_cost": outcome.actual_cost,

                "cost_saving": cost_saving,

                "action_success": action_success,

                "on_time": on_time,

                "outcome_status": outcome.outcome_status,

                "notes": outcome.notes,

                "user_name": decision.user_name,

                "decision_status": decision.decision_status,

                "prescription_id": prescription.id,

                "recommendation_rank": (
                    prescription.recommendation_rank
                ),

                "created_at": (
                    outcome.created_at.isoformat()
                    if outcome.created_at
                    else None
                )
            }
        )

    return history


# ============================================================
# GET SINGLE OUTCOME
# ============================================================

@router.get(
    "/{outcome_id}",
    response_model=OutcomeResponse
)
def get_outcome(
    outcome_id: int,
    db: Session = Depends(get_db)
):
    """
    Return one outcome by ID.
    """

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
        "actual_delivery_days": outcome.actual_delivery_days,
        "outcome_status": outcome.outcome_status,
        "notes": outcome.notes,
        "created_at": (
            outcome.created_at.isoformat()
            if outcome.created_at
            else None
        )
    }