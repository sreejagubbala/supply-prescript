"""
Supply Prescript
Member 5 - Closed Loop Learning Pipeline

Flow:

Decision
   |
   v
Outcome
   |
   v
Feedback
   |
   v
Action Performance
   |
   v
Learning Weights
   |
   v
Future Optimization
"""

from pathlib import Path
import json

import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

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


# ============================================================
# LOAD DATA
# ============================================================

def load_data():

    if not OUTCOME_FILE.exists():
        raise FileNotFoundError(
            f"Missing: {OUTCOME_FILE}"
        )

    if not FEEDBACK_FILE.exists():
        raise FileNotFoundError(
            f"Missing: {FEEDBACK_FILE}"
        )

    outcomes = pd.read_csv(
        OUTCOME_FILE
    )

    feedback = pd.read_csv(
        FEEDBACK_FILE
    )

    return outcomes, feedback


# ============================================================
# CALCULATE ACTION PERFORMANCE
# ============================================================

def calculate_action_performance(
    outcomes: pd.DataFrame,
) -> pd.DataFrame:

    result = (
        outcomes.groupby(
            "Selected_Action"
        )
        .agg(
            decision_count=(
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

            average_saving=(
                "Cost_Saving",
                "mean",
            ),
        )
        .reset_index()
    )

    return result


# ============================================================
# LEARNING SCORE
# ============================================================

def calculate_learning_score(
    success_rate: float,
    cost_variance: float,
    delay_variance: float,
) -> float:
    """
    Higher score means better historical performance.

    Score components:

    Success        -> positive
    Cost variance  -> negative
    Delay variance -> negative
    """

    success_component = success_rate * 100

    cost_penalty = max(
        cost_variance / 100,
        0,
    )

    delay_penalty = max(
        delay_variance * 5,
        0,
    )

    score = (
        success_component
        - cost_penalty
        - delay_penalty
    )

    return round(
        max(score, 0),
        2,
    )


# ============================================================
# CREATE LEARNING WEIGHTS
# ============================================================

def create_learning_weights(
    performance_df: pd.DataFrame,
) -> dict:

    weights = {}

    for _, row in performance_df.iterrows():

        action = row[
            "Selected_Action"
        ]

        score = calculate_learning_score(
            success_rate=float(
                row["success_rate"]
            ),

            cost_variance=float(
                row["average_cost_variance"]
            ),

            delay_variance=float(
                row["average_delay_variance"]
            ),
        )

        weights[action] = {
            "decision_count":
                int(row["decision_count"]),

            "success_rate":
                round(
                    float(
                        row["success_rate"]
                    ) * 100,
                    2,
                ),

            "average_cost_variance":
                round(
                    float(
                        row[
                            "average_cost_variance"
                        ]
                    ),
                    2,
                ),

            "average_delay_variance":
                round(
                    float(
                        row[
                            "average_delay_variance"
                        ]
                    ),
                    2,
                ),

            "average_saving":
                round(
                    float(
                        row[
                            "average_saving"
                        ]
                    ),
                    2,
                ),

            "learning_score":
                score,
        }

    return weights


# ============================================================
# SAVE WEIGHTS
# ============================================================

def save_learning_weights(
    weights: dict,
) -> None:

    WEIGHTS_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        WEIGHTS_FILE,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            weights,
            file,
            indent=4,
        )

    print(
        f"Learning weights saved to: "
        f"{WEIGHTS_FILE}"
    )


# ============================================================
# MAIN
# ============================================================

def main() -> None:

    print("=" * 60)
    print("SUPPLY PRESCRIPT - LEARNING PIPELINE")
    print("=" * 60)

    outcomes, feedback = load_data()

    performance = calculate_action_performance(
        outcomes
    )

    weights = create_learning_weights(
        performance
    )

    save_learning_weights(weights)

    print("\nAction Performance:")
    print(
        performance.to_string(
            index=False
        )
    )

    print("\nLearning Weights:")

    print(
        json.dumps(
            weights,
            indent=4,
        )
    )


if __name__ == "__main__":
    main()