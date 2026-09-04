"""
Supply Prescript
Member 5 - ROI API
"""

from pathlib import Path

import pandas as pd

from fastapi import APIRouter, HTTPException


router = APIRouter(
    prefix="/roi",
    tags=["ROI"],
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


def load_data():

    if not OUTCOME_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="Outcome data not found.",
        )

    return pd.read_csv(
        OUTCOME_FILE
    )


@router.get("/")
def get_roi():

    df = load_data()

    expected = df[
        "Expected_Cost"
    ].sum()

    actual = df[
        "Actual_Cost"
    ].sum()

    savings = expected - actual

    roi = (
        savings / expected * 100
        if expected != 0
        else 0
    )

    success_rate = (
        df["Action_Success"]
        .astype(bool)
        .mean()
        * 100
    )

    on_time_rate = (
        df["On_Time"]
        .astype(bool)
        .mean()
        * 100
    )

    return {
        "total_decisions": int(
            len(df)
        ),

        "expected_cost": round(
            expected,
            2,
        ),

        "actual_cost": round(
            actual,
            2,
        ),

        "savings": round(
            savings,
            2,
        ),

        "roi_percentage": round(
            roi,
            2,
        ),

        "success_rate": round(
            success_rate,
            2,
        ),

        "on_time_rate": round(
            on_time_rate,
            2,
        ),
    }


@router.get("/by-action")
def get_roi_by_action():

    df = load_data()

    result = (
        df.groupby(
            "Selected_Action"
        )
        .agg(
            decisions=(
                "Decision_ID",
                "count",
            ),

            expected_cost=(
                "Expected_Cost",
                "sum",
            ),

            actual_cost=(
                "Actual_Cost",
                "sum",
            ),

            savings=(
                "Cost_Saving",
                "sum",
            ),

            success_rate=(
                "Action_Success",
                "mean",
            ),
        )
        .reset_index()
    )

    result["roi_percentage"] = (
        result["savings"]
        / result["expected_cost"]
        .replace(0, pd.NA)
        * 100
    )

    result["success_rate"] *= 100

    return {
        "data": result
        .round(2)
        .fillna(0)
        .to_dict(
            orient="records"
        )
    }


@router.get("/by-market")
def get_roi_by_market():

    df = load_data()

    result = (
        df.groupby("Market")
        .agg(
            decisions=(
                "Decision_ID",
                "count",
            ),

            expected_cost=(
                "Expected_Cost",
                "sum",
            ),

            actual_cost=(
                "Actual_Cost",
                "sum",
            ),

            savings=(
                "Cost_Saving",
                "sum",
            ),

            success_rate=(
                "Action_Success",
                "mean",
            ),
        )
        .reset_index()
    )

    result["roi_percentage"] = (
        result["savings"]
        / result["expected_cost"]
        .replace(0, pd.NA)
        * 100
    )

    result["success_rate"] *= 100

    return {
        "data": result
        .round(2)
        .fillna(0)
        .to_dict(
            orient="records"
        )
    }