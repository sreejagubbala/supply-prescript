from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db

from ..models.decision import Decision
from ..models.shipment import Shipment
from ..models.prescription import Prescription

from ..schemas.decision import (
    DecisionCreate,
    DecisionResponse,
)


router = APIRouter(
    tags=["Decisions"]
)


# ============================================================
# CREATE DECISION
#
# Called ONLY after user clicks Confirm & Execute.
# ============================================================

@router.post(
    "/",
    response_model=DecisionResponse
)
def create_decision(
    decision_data: DecisionCreate,
    db: Session = Depends(get_db),
):

    print("=" * 60)
    print("CREATE DECISION")
    print("Received:", decision_data)
    print("=" * 60)

    # --------------------------------------------------------
    # CHECK SHIPMENT
    # --------------------------------------------------------

    shipment = (
        db.query(Shipment)
        .filter(
            Shipment.id
            == decision_data.shipment_id
        )
        .first()
    )

    if not shipment:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Shipment "
                f"{decision_data.shipment_id} "
                f"not found"
            ),
        )

    # --------------------------------------------------------
    # CHECK PRESCRIPTION
    # --------------------------------------------------------

    prescription = (
        db.query(Prescription)
        .filter(
            Prescription.id
            == decision_data.prescription_id
        )
        .first()
    )

    if not prescription:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Prescription "
                f"{decision_data.prescription_id} "
                f"not found"
            ),
        )

    # --------------------------------------------------------
    # CHECK PRESCRIPTION BELONGS TO SHIPMENT
    # --------------------------------------------------------

    if (
        prescription.shipment_id
        != shipment.id
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Selected prescription does not "
                "belong to this shipment"
            ),
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE EXECUTED DECISION
    # --------------------------------------------------------

    existing_decision = (
        db.query(Decision)
        .filter(
            Decision.shipment_id
            == shipment.id,
            Decision.decision_status
            == "Executed",
        )
        .first()
    )

    if existing_decision:

        raise HTTPException(
            status_code=400,
            detail=(
                "A decision has already been "
                "executed for this shipment"
            ),
        )

    # --------------------------------------------------------
    # COST
    # --------------------------------------------------------

    estimated_cost = (
        decision_data.estimated_cost
    )

    if estimated_cost is None:

        estimated_cost = (
            prescription.estimated_cost
        )

    # --------------------------------------------------------
    # SELECTED OPTION
    # --------------------------------------------------------

    selected_option = (
        decision_data.selected_option
    )

    if not selected_option:

        selected_option = (
            prescription.option_name
        )

    # --------------------------------------------------------
    # CREATE DECISION
    # --------------------------------------------------------

    new_decision = Decision(

        shipment_id=shipment.id,

        prescription_id=prescription.id,

        selected_option=selected_option,

        estimated_cost=estimated_cost,

        user_name=(
            decision_data.user_name
            or "User"
        ),

        decision_status="Executed",
    )

    db.add(new_decision)

    try:

        db.commit()

    except Exception as error:

        db.rollback()

        print(
            "DECISION INSERT FAILED:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save decision "
                "to database"
            ),
        )

    db.refresh(new_decision)

    print("=" * 60)
    print(
        "DECISION CREATED:",
        new_decision.id
    )
    print("=" * 60)

    return new_decision


# ============================================================
# GET ALL DECISIONS
# ============================================================

@router.get(
    "/",
    response_model=list[DecisionResponse]
)
def get_decisions(
    db: Session = Depends(get_db)
):

    decisions = (
        db.query(Decision)
        .order_by(
            Decision.id.desc()
        )
        .all()
    )

    print(
        "GET DECISIONS:",
        len(decisions)
    )

    return decisions


# ============================================================
# GET SINGLE DECISION
# ============================================================

@router.get(
    "/{decision_id}",
    response_model=DecisionResponse
)
def get_decision(
    decision_id: int,
    db: Session = Depends(get_db),
):

    decision = (
        db.query(Decision)
        .filter(
            Decision.id == decision_id
        )
        .first()
    )

    if not decision:

        raise HTTPException(
            status_code=404,
            detail="Decision not found"
        )

    return decision