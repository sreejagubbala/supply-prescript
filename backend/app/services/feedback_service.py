"""
Supply Prescript
Member 5 - Feedback Service
"""

from pathlib import Path
import json

import pandas as pd


PROJECT_ROOT = Path(
    __file__
).resolve().parents[3]

OUTCOME_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "decision_outcomes.csv"
)

FEEDBACK_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "decision_feedback.csv"
)

WEIGHTS_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "learning_weights.json"
)


def get_feedback():

    if not FEEDBACK_FILE.exists():
        return []

    df = pd.read_csv(
        FEEDBACK_FILE
    )

    return (
        df.fillna("")
        .to_dict(
            orient="records"
        )
    )


def get_learning_weights():

    if not WEIGHTS_FILE.exists():
        return {}

    with open(
        WEIGHTS_FILE,
        "r",
        encoding="utf-8",
    ) as file:

        return json.load(file)


def get_action_performance():

    if not OUTCOME_FILE.exists():
        return []

    df = pd.read_csv(
        OUTCOME_FILE
    )

    result = (
        df.groupby(
            "Selected_Action"
        )
        .agg(
            decisions=(
                "Decision_ID",
                "count",
            ),

            success_rate=(
                "Action_Success",
                "mean",
            ),

            average_cost_variance=(
                "Cost_Variance",
                "mean",
            ),

            average_delay_variance=(
                "Delay_Variance_Days",
                "mean",
            ),
        )
        .reset_index()
    )

    result["success_rate"] *= 100

    return (
        result
        .round(2)
        .fillna(0)
        .to_dict(
            orient="records"
        )
    )


def get_closed_loop_summary():

    feedback = get_feedback()

    weights = get_learning_weights()

    performance = get_action_performance()

    return {
        "feedback": feedback,
        "learning_weights": weights,
        "action_performance": performance,
    }