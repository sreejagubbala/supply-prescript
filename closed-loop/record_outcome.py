from pathlib import Path

import pandas as pd


# ============================================================
# Project paths
# ============================================================

PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

OUTCOME_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "decision_outcomes.csv"
)


# ============================================================
# Record actual outcome
# ============================================================

def record_outcome(
    shipment_id: str,
    actual_delivery_days: int,
    actual_cost: float,
) -> pd.Series:
    """
    Record the actual result of an executed decision.

    The original expected values are preserved.

    Day 11:
    Outcome recording logic.
    """

    if not OUTCOME_FILE.exists():
        raise FileNotFoundError(
            f"Outcome file not found:\n{OUTCOME_FILE}"
        )

    df = pd.read_csv(
        OUTCOME_FILE
    )

    if "Shipment_ID" not in df.columns:
        raise ValueError(
            "Shipment_ID column is missing."
        )

    # --------------------------------------------------------
    # Find shipment
    # --------------------------------------------------------

    matches = (
        df["Shipment_ID"].astype(str)
        == str(shipment_id)
    )

    if not matches.any():
        raise ValueError(
            f"Shipment '{shipment_id}' "
            "was not found."
        )

    index = df.index[matches][0]

    # --------------------------------------------------------
    # Get expected values
    # --------------------------------------------------------

    expected_delivery = float(
        df.loc[
            index,
            "expected_delivery_days",
        ]
    )

    expected_cost = float(
        df.loc[
            index,
            "expected_cost",
        ]
    )

    # --------------------------------------------------------
    # Store actual values
    # --------------------------------------------------------

    df.loc[
        index,
        "actual_delivery_days",
    ] = actual_delivery_days

    df.loc[
        index,
        "actual_cost",
    ] = actual_cost

    # --------------------------------------------------------
    # Calculate delivery status
    # --------------------------------------------------------

    if actual_delivery_days > expected_delivery:
        delivery_status = "Delayed"
    else:
        delivery_status = "On Time"

    df.loc[
        index,
        "delivery_status",
    ] = delivery_status

    # --------------------------------------------------------
    # Calculate outcome status
    # --------------------------------------------------------

    if (
        actual_delivery_days <= expected_delivery
        and actual_cost <= expected_cost
    ):
        outcome_status = "Successful"
    else:
        outcome_status = "Unsuccessful"

    df.loc[
        index,
        "outcome_status",
    ] = outcome_status

    # --------------------------------------------------------
    # Save updated outcome
    # --------------------------------------------------------

    df.to_csv(
        OUTCOME_FILE,
        index=False,
    )

    return df.loc[index]


# ============================================================
# Main test
# ============================================================

if __name__ == "__main__":

    result = record_outcome(
        shipment_id="SHIP-001",
        actual_delivery_days=7,
        actual_cost=110.00,
    )

    print()
    print("=" * 65)
    print(
        "SUPPLY PRESCRIPT - DAY 11"
    )
    print(
        "OUTCOME RECORDED"
    )
    print("=" * 65)

    print(
        f"Shipment ID       : "
        f"{result['Shipment_ID']}"
    )

    print(
        f"Expected Delivery : "
        f"{result['expected_delivery_days']} days"
    )

    print(
        f"Actual Delivery   : "
        f"{result['actual_delivery_days']} days"
    )

    print(
        f"Expected Cost     : "
        f"₹{result['expected_cost']}"
    )

    print(
        f"Actual Cost       : "
        f"₹{result['actual_cost']}"
    )

    print(
        f"Delivery Status   : "
        f"{result['delivery_status']}"
    )

    print(
        f"Outcome Status    : "
        f"{result['outcome_status']}"
    )

    print()
    print(
        f"Updated file: {OUTCOME_FILE}"
    )