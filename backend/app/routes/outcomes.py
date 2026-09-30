from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db

from ..models.outcome import Outcome
from ..models.decision import Decision
from ..models.shipment import Shipment
from ..models.prescription import Prescription

from ..schemas.outcome import (
    OutcomeCreate,
    OutcomeResponse,
)


router = APIRouter(
    tags=["Outcomes"]
)


# ============================================================
# CREATE / UPDATE OUTCOME
# ============================================================

@router.post(
    "/",
    response_model=OutcomeResponse
)
def create_outcome(
    outcome: OutcomeCreate,
    db: Session = Depends(get_db)
):

    decision = (
        db.query(Decision)
        .filter(
            Decision.id == outcome.decision_id
        )
        .first()
    )

    if not decision:

        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    existing_outcome = (
        db.query(Outcome)
        .filter(
            Outcome.decision_id
            == outcome.decision_id
        )
        .first()
    )

    if existing_outcome:

        existing_outcome.actual_cost = (
            outcome.actual_cost
        )

        existing_outcome.actual_delivery_days = (
            outcome.actual_delivery_days
        )

        existing_outcome.outcome_status = (
            outcome.outcome_status
        )

        existing_outcome.notes = (
            outcome.notes
        )

        db.commit()
        db.refresh(existing_outcome)

        return existing_outcome

    new_outcome = Outcome(
        decision_id=outcome.decision_id,
        actual_cost=outcome.actual_cost,
        actual_delivery_days=(
            outcome.actual_delivery_days
        ),
        outcome_status=(
            outcome.outcome_status
        ),
        notes=outcome.notes,
    )

    db.add(new_outcome)

    db.commit()
    db.refresh(new_outcome)

    return new_outcome


# ============================================================
# GET ALL OUTCOMES
# ============================================================

@router.get("/")
def get_outcomes(
    db: Session = Depends(get_db)
):

    return (
        db.query(Outcome)
        .order_by(Outcome.id.desc())
        .all()
    )


# ============================================================
# DECISION HISTORY
#
# IMPORTANT:
# Start from Decision.
#
# A Decision is created when the user clicks:
# Confirm & Execute
#
# Outcome is optional because actual results may not exist yet.
# ============================================================

@router.get("/history")
def get_decision_history(
    db: Session = Depends(get_db)
):

    records = (
        db.query(
            Decision,
            Shipment,
            Prescription,
            Outcome,
        )
        .outerjoin(
            Shipment,
            Decision.shipment_id
            == Shipment.id,
        )
        .outerjoin(
            Prescription,
            Decision.prescription_id
            == Prescription.id,
        )
        .outerjoin(
            Outcome,
            Outcome.decision_id
            == Decision.id,
        )
        .order_by(
            Decision.id.desc()
        )
        .all()
    )

    print("=" * 60)
    print("DECISION HISTORY DEBUG")
    print(
        "Number of records:",
        len(records)
    )

    for (
        decision,
        shipment,
        prescription,
        outcome,
    ) in records:

        print(
            "Decision:",
            decision.id,
            "| Shipment:",
            decision.shipment_id,
            "| Prescription:",
            decision.prescription_id,
            "| Shipment:",
            shipment is not None,
            "| Prescription:",
            prescription is not None,
            "| Outcome:",
            outcome is not None,
        )

    print("=" * 60)

    history = []

    for (
        decision,
        shipment,
        prescription,
        outcome,
    ) in records:

        # ----------------------------------------------------
        # EXPECTED COST
        # ----------------------------------------------------

        if decision.estimated_cost is not None:

            expected_cost = (
                decision.estimated_cost
            )

        elif prescription is not None:

            expected_cost = (
                prescription.estimated_cost
            )

        else:

            expected_cost = None

        # ----------------------------------------------------
        # EXPECTED DELIVERY
        # ----------------------------------------------------

        expected_delivery_days = (
            prescription.delivery_days
            if prescription is not None
            else None
        )

        # ----------------------------------------------------
        # ACTUAL VALUES
        # ----------------------------------------------------

        actual_cost = (
            outcome.actual_cost
            if outcome is not None
            else None
        )

        actual_delivery_days = (
            outcome.actual_delivery_days
            if outcome is not None
            else None
        )

        # ----------------------------------------------------
        # COST SAVING
        # ----------------------------------------------------

        cost_saving = None

        if (
            actual_cost is not None
            and expected_cost is not None
        ):

            cost_saving = round(
                expected_cost
                - actual_cost,
                2,
            )

        # ----------------------------------------------------
        # DELIVERY DIFFERENCE
        # ----------------------------------------------------

        delivery_difference = None

        if (
            actual_delivery_days is not None
            and expected_delivery_days is not None
        ):

            delivery_difference = round(
                actual_delivery_days
                - expected_delivery_days,
                2,
            )

        # ----------------------------------------------------
        # OUTCOME STATUS
        # ----------------------------------------------------

        outcome_status = (
            outcome.outcome_status
            if (
                outcome is not None
                and outcome.outcome_status
            )
            else "Executed"
        )

        # ----------------------------------------------------
        # SUCCESS
        # ----------------------------------------------------

        action_success = None

        if outcome is not None:

            action_success = (
                outcome_status
                in [
                    "Success",
                    "Successful",
                    "On-Time",
                    "Completed",
                ]
            )

        # ----------------------------------------------------
        # ON TIME
        # ----------------------------------------------------

        on_time = None

        if (
            actual_delivery_days is not None
            and expected_delivery_days is not None
        ):

            on_time = (
                actual_delivery_days
                <= expected_delivery_days
            )

        # ----------------------------------------------------
        # RECOMMENDED ACTION
        # ----------------------------------------------------

        recommended_action = (
            prescription.option_name
            if prescription is not None
            else None
        )

        # ----------------------------------------------------
        # SELECTED ACTION
        # ----------------------------------------------------

        selected_action = (
            decision.selected_option
        )

        # ----------------------------------------------------
        # MANAGER OVERRIDE
        # ----------------------------------------------------

        manager_override = False

        if recommended_action is not None:

            manager_override = (
                selected_action
                != recommended_action
            )

        # ----------------------------------------------------
        # HISTORY RECORD
        # ----------------------------------------------------

        history.append({

            "decision_id": decision.id,

            "shipment_id": (
                shipment.shipment_code
                if shipment is not None
                else str(decision.shipment_id)
            ),

            # IMPORTANT:
            # Frontend uses record.date
            "date": (
                decision.created_at.isoformat()
                if decision.created_at
                else None
            ),

            "product": (
                shipment.product
                if shipment is not None
                else None
            ),

            "quantity": (
                shipment.quantity
                if shipment is not None
                else None
            ),

            "origin": (
                shipment.origin
                if shipment is not None
                else None
            ),

            "destination": (
                shipment.destination
                if shipment is not None
                else None
            ),

            "risk_score": (
                shipment.risk_score
                if shipment is not None
                else None
            ),

            "recommended_action":
                recommended_action,

            "selected_action":
                selected_action,

            "manager_override":
                manager_override,

            "expected_cost":
                expected_cost,

            "actual_cost":
                actual_cost,

            "expected_delivery_days":
                expected_delivery_days,

            "actual_delivery_days":
                actual_delivery_days,

            "delivery_difference":
                delivery_difference,

            "cost_saving":
                cost_saving,

            "outcome_status":
                outcome_status,

            "action_success":
                action_success,

            "on_time":
                on_time,

            "notes": (
                outcome.notes
                if outcome is not None
                else None
            ),

            "user_name":
                decision.user_name,

        })

    print(
        "History records returned:",
        len(history)
    )

    return history


# ============================================================
# GET SINGLE OUTCOME
# ============================================================

@router.get("/{outcome_id}")
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

    if not outcome:

        raise HTTPException(
            status_code=404,
            detail="Outcome not found"
        )

    return outcome