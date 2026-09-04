"""
Supply Prescript
Member 5 - Outcome API
"""

from pathlib import Path
from typing import Optional

import pandas as pd

from fastapi import APIRouter, HTTPException


router = APIRouter(
    prefix="/outcomes",
    tags=["Outcomes"],
)


PROJECT_ROOT = Path(
    __file__
).resolve().parents[3]

OUTCOME_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "decision_outcomes.csv"
)


def load_outcomes() -> pd.DataFrame:

    if not OUTCOME_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="Decision outcome file not found.",
        )

    try:
        return pd.read_csv(
            OUTCOME_FILE
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


@router.get("/")
def get_outcomes(
    shipment_id: Optional[str] = None,
    action: Optional[str] = None,
):

    df = load_outcomes()

    if shipment_id:
        df = df[
            df["Shipment_ID"]
            .astype(str)
            == shipment_id
        ]

    if action:
        df = df[
            df["Selected_Action"]
            .astype(str)
            .str.lower()
            == action.lower()
        ]

    return {
        "count": len(df),
        "data": df
        .fillna("")
        .to_dict(
            orient="records"
        ),
    }


@router.get("/{decision_id}")
def get_outcome(
    decision_id: str,
):

    df = load_outcomes()

    result = df[
        df["Decision_ID"]
        .astype(str)
        == decision_id
    ]

    if result.empty:
        raise HTTPException(
            status_code=404,
            detail="Decision not found.",
        )

    return result.iloc[0].fillna("").to_dict()