"""
Supply Prescript
Member 5 - Decision Feedback

Compares:

Expected outcome
        vs
Actual outcome

and creates feedback labels.
"""

from pathlib import Path

import pandas as pd


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "decision_outcomes.csv"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "decision_feedback.csv"
)


# ============================================================
# FEEDBACK CLASSIFICATION
# ============================================================

def classify_feedback(
    row: pd.Series,
) -> str:

    if bool(row["Action_Success"]):
        return "SUCCESS"

    cost_variance = float(
        row["Cost_Variance"]
    )

    delay_variance = float(
        row["Delay_Variance_Days"]
    )

    if cost_variance > 0 and delay_variance > 0:
        return "COST_AND_DELAY_FAILURE"

    if cost_variance > 0:
        return "COST_FAILURE"

    if delay_variance > 0:
        return "DELAY_FAILURE"

    return "OTHER"


# ============================================================
# CREATE FEEDBACK
# ============================================================

def create_feedback(
    df: pd.DataFrame,
) -> pd.DataFrame:

    records = []

    for _, row in df.iterrows():

        recommended = str(
            row["Recommended_Action"]
        ).strip()

        selected = str(
            row["Selected_Action"]
        ).strip()

        recommendation_selected = (
            recommended.lower()
            == selected.lower()
        )

        feedback_label = classify_feedback(
            row
        )

        records.append(
            {
                "Decision_ID":
                    row["Decision_ID"],

                "Shipment_ID":
                    row["Shipment_ID"],

                "Recommended_Action":
                    recommended,

                "Selected_Action":
                    selected,

                "Expected_Cost":
                    row["Expected_Cost"],

                "Actual_Cost":
                    row["Actual_Cost"],

                "Cost_Variance":
                    row["Cost_Variance"],

                "Expected_Delay_Days":
                    row[
                        "Expected_Delay_Days"
                    ],

                "Actual_Delay_Days":
                    row[
                        "Actual_Delay_Days"
                    ],

                "Delay_Variance_Days":
                    row[
                        "Delay_Variance_Days"
                    ],

                "Decision_Success":
                    row["Action_Success"],

                "Feedback_Label":
                    feedback_label,

                "Recommendation_Selected":
                    recommendation_selected,
            }
        )

    return pd.DataFrame(records)


# ============================================================
# SAVE FEEDBACK
# ============================================================

def save_feedback(
    feedback_df: pd.DataFrame,
) -> None:

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    feedback_df.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print(
        f"Feedback saved to: {OUTPUT_FILE}"
    )


# ============================================================
# MAIN
# ============================================================

def main() -> None:

    print("=" * 60)
    print("SUPPLY PRESCRIPT - FEEDBACK GENERATION")
    print("=" * 60)

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Missing: {INPUT_FILE}"
        )

    df = pd.read_csv(INPUT_FILE)

    feedback = create_feedback(df)

    save_feedback(feedback)

    print()
    print(
        feedback[
            [
                "Decision_ID",
                "Selected_Action",
                "Feedback_Label",
                "Decision_Success",
            ]
        ].to_string(index=False)
    )


if __name__ == "__main__":
    main()