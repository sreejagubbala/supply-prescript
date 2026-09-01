from datetime import date
from pathlib import Path
from typing import Optional

import pandas as pd


# ============================================================
# SUPPLY PRESCRIPT
# Member 5 - Closed Loop & Analytics
# Decision Tracking
# ============================================================


PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

DATA_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "decision_outcomes.csv"
)


# ============================================================
# Load decision data
# ============================================================

def load_decisions(
    file_path: Optional[Path] = None,
) -> pd.DataFrame:

    path = file_path or DATA_FILE

    if not path.exists():
        raise FileNotFoundError(
            f"Decision file not found:\n{path}"
        )

    return pd.read_csv(path)


# ============================================================
# Create decision ID
# ============================================================

def create_decision_id(
    shipment_id: str,
    existing_ids=None,
) -> str:
    """
    Create a simple decision identifier.

    Example:
        DEC-SHP-1001
    """

    decision_id = (
        f"DEC-{str(shipment_id).strip()}"
    )

    if existing_ids is None:
        return decision_id

    existing_ids = {
        str(value)
        for value in existing_ids
    }

    if decision_id not in existing_ids:
        return decision_id

    counter = 2

    while (
        f"{decision_id}-{counter}"
        in existing_ids
    ):
        counter += 1

    return (
        f"{decision_id}-{counter}"
    )


# ============================================================
# Track a decision
# ============================================================

def track_decision(
    shipment_id: str,
    recommended_action: str,
    expected_cost: float,
    expected_delivery_days: float,
    selected_action: Optional[str] = None,
    decision_date: Optional[str] = None,
    file_path: Optional[Path] = None,
) -> dict:
    """
    Record a business decision.

    If selected_action is not supplied,
    the recommended action is used.

    Manager override is automatically detected.
    """

    path = file_path or DATA_FILE

    if path.exists():
        df = pd.read_csv(path)
    else:
        df = pd.DataFrame()

    existing_ids = (
        df["Decision_ID"].tolist()
        if "Decision_ID" in df.columns
        else []
    )

    decision_id = create_decision_id(
        shipment_id,
        existing_ids,
    )

    if selected_action is None:
        selected_action = recommended_action

    if decision_date is None:
        decision_date = date.today().isoformat()

    manager_override = (
        str(selected_action).strip()
        !=
        str(recommended_action).strip()
    )

    record = {
        "Decision_ID": decision_id,
        "Shipment_ID": shipment_id,
        "Decision_Date": decision_date,
        "Recommended_Action": recommended_action,
        "Selected_Action": selected_action,
        "Expected_Cost": round(
            float(expected_cost),
            2,
        ),
        "Expected_Delay_Days": round(
            float(expected_delivery_days),
            2,
        ),
        "Manager_Override": manager_override,
    }

    return record


# ============================================================
# Add decision to CSV
# ============================================================

def save_decision(
    record: dict,
    file_path: Optional[Path] = None,
) -> pd.DataFrame:

    path = file_path or DATA_FILE

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    if path.exists():
        df = pd.read_csv(path)
    else:
        df = pd.DataFrame()

    record_df = pd.DataFrame(
        [record]
    )

    # Avoid duplicate Decision_ID
    if (
        "Decision_ID" in df.columns
        and "Decision_ID" in record_df.columns
    ):
        df = df[
            df["Decision_ID"].astype(str)
            !=
            str(record["Decision_ID"])
        ]

    result = pd.concat(
        [
            df,
            record_df,
        ],
        ignore_index=True,
    )

    result.to_csv(
        path,
        index=False,
    )

    return result


# ============================================================
# Manager override analysis
# ============================================================

def calculate_override_rate(
    df: pd.DataFrame,
) -> float:

    if len(df) == 0:
        return 0.0

    if (
        "Recommended_Action" not in df.columns
        or "Selected_Action" not in df.columns
    ):
        return 0.0

    overrides = (
        df["Recommended_Action"]
        .astype(str)
        .str.strip()
        !=
        df["Selected_Action"]
        .astype(str)
        .str.strip()
    ).sum()

    return round(
        overrides / len(df) * 100,
        2,
    )


# ============================================================
# Decision summary
# ============================================================

def decision_summary(
    df: pd.DataFrame,
) -> dict:

    total = len(df)

    if total == 0:
        return {
            "total_decisions": 0,
            "manager_overrides": 0,
            "override_rate": 0.0,
        }

    if (
        "Recommended_Action" in df.columns
        and "Selected_Action" in df.columns
    ):

        overrides = (
            df["Recommended_Action"]
            .astype(str)
            .str.strip()
            !=
            df["Selected_Action"]
            .astype(str)
            .str.strip()
        ).sum()

    else:
        overrides = 0

    return {
        "total_decisions": int(total),
        "manager_overrides": int(
            overrides
        ),
        "override_rate": round(
            overrides / total * 100,
            2,
        ),
    }


# ============================================================
# Test
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SUPPLY PRESCRIPT")
    print("DECISION TRACKING")
    print("=" * 60)

    if DATA_FILE.exists():

        decisions = load_decisions()

        print(
            f"Decisions loaded: {len(decisions)}"
        )

        print(
            decision_summary(decisions)
        )

    else:

        print(
            "decision_outcomes.csv not found."
        )