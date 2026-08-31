from pathlib import Path
from typing import Optional

import pandas as pd


# ============================================================
# SUPPLY PRESCRIPT
# Member 5 - Closed Loop & Analytics
# Outcome Recording
# ============================================================


PROJECT_ROOT = (
    Path(__file__)
    .resolve()
    .parent
    .parent
)

SOURCE_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "sample_shipments.csv"
)

OUTCOME_FILE = (
    PROJECT_ROOT
    / "data"
    / "sample"
    / "decision_outcomes.csv"
)


# ============================================================
# Load shipment data
# ============================================================

def load_shipments(
    file_path: Optional[Path] = None,
) -> pd.DataFrame:

    path = file_path or SOURCE_FILE

    if not path.exists():
        raise FileNotFoundError(
            f"Source file not found:\n{path}"
        )

    return pd.read_csv(path)


# ============================================================
# Validate shipment data
# ============================================================

def validate_shipments(
    df: pd.DataFrame,
) -> None:

    required_columns = [
        "Shipment_ID",
        "Shipment_Date",
        "Shipping_Mode",
        "Days_for_shipment_scheduled",
        "Category_Name",
        "Market",
        "Order_Region",
        "Customer_Country",
        "Customer_City",
        "Order_Item_Quantity",
        "Sales_per_customer",
        "Order_Item_Total",
        "Order_Profit_Per_Order",
        "Late_delivery_risk",
    ]

    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            "The source CSV is missing: "
            + ", ".join(missing)
        )


# ============================================================
# Recommended action
# ============================================================

def recommend_action(row) -> str:
    """
    Simple rule-based prescription.

    This is sample decision data for
    closed-loop testing and is not the
    final optimization algorithm.
    """

    risk = int(
        row["Late_delivery_risk"]
    )

    mode = str(
        row["Shipping_Mode"]
    )

    quantity = int(
        row["Order_Item_Quantity"]
    )

    # High-risk shipment
    if risk == 1:

        if mode == "Standard Class":
            return "Upgrade shipping mode"

        if quantity >= 5:
            return "Split shipment"

        return "Prioritize shipment"

    # Low-risk shipment
    if mode == "Same Day":
        return "Maintain current mode"

    if quantity >= 5:
        return "Consolidate shipment"

    return "Maintain current plan"


# ============================================================
# Expected delivery
# ============================================================

def expected_delivery_days(row) -> int:

    return int(
        row["Days_for_shipment_scheduled"]
    )


# ============================================================
# Expected operational cost
# ============================================================

def expected_operational_cost(row) -> float:
    """
    Assumed project-development formula:

        10% of order total
        + quantity handling cost
        + shipping-mode adjustment
    """

    order_total = float(
        row["Order_Item_Total"]
    )

    quantity = int(
        row["Order_Item_Quantity"]
    )

    mode = str(
        row["Shipping_Mode"]
    )

    mode_cost = {
        "Same Day": 25.0,
        "First Class": 18.0,
        "Second Class": 12.0,
        "Standard Class": 8.0,
    }

    base_cost = (
        order_total * 0.10
    )

    handling_cost = (
        quantity * 2.0
    )

    shipping_cost = mode_cost.get(
        mode,
        10.0,
    )

    return round(
        base_cost
        + handling_cost
        + shipping_cost,
        2,
    )


# ============================================================
# Synthetic actual delivery
# ============================================================

def actual_delivery_days(row) -> int:
    """
    Generate deterministic sample actual
    delivery data.

    High-risk shipments receive delays.
    Low-risk shipments are on time or
    slightly early.
    """

    scheduled = int(
        row["Days_for_shipment_scheduled"]
    )

    risk = int(
        row["Late_delivery_risk"]
    )

    shipment_text = str(
        row["Shipment_ID"]
    )

    try:
        shipment_number = int(
            shipment_text.split("-")[-1]
        )
    except ValueError:
        shipment_number = 1

    # Same Day
    if scheduled == 0:

        if risk == 1:
            return 1

        return 0

    # High-risk shipment
    if risk == 1:

        if shipment_number % 2 == 0:
            return scheduled + 2

        return scheduled + 1

    # Low-risk shipment
    if shipment_number % 2 == 0:
        return scheduled

    return max(
        scheduled - 1,
        0,
    )


# ============================================================
# Synthetic actual cost
# ============================================================

def actual_operational_cost(row) -> float:
    """
    Generate deterministic sample actual cost.

    This is synthetic testing data.
    """

    expected = expected_operational_cost(
        row
    )

    shipment_text = str(
        row["Shipment_ID"]
    )

    try:
        shipment_number = int(
            shipment_text.split("-")[-1]
        )
    except ValueError:
        shipment_number = 1

    risk = int(
        row["Late_delivery_risk"]
    )

    # High-risk shipments can incur
    # additional operational cost.
    if risk == 1:

        if shipment_number % 2 == 0:
            return round(
                expected * 1.04,
                2,
            )

        return round(
            expected * 0.96,
            2,
        )

    # Low-risk shipments
    if shipment_number % 2 == 0:
        return round(
            expected * 1.02,
            2,
        )

    return round(
        expected * 0.97,
        2,
    )


# ============================================================
# Create decision outcomes
# ============================================================

def create_decision_outcomes(
    shipments: pd.DataFrame,
) -> pd.DataFrame:

    validate_shipments(
        shipments
    )

    records = []

    for _, row in shipments.iterrows():

        action = recommend_action(
            row
        )

        expected_days = (
            expected_delivery_days(row)
        )

        expected_cost = (
            expected_operational_cost(row)
        )

        actual_days = (
            actual_delivery_days(row)
        )

        actual_cost = (
            actual_operational_cost(row)
        )

        if actual_days > expected_days:
            delivery_status = "Delayed"
        else:
            delivery_status = "On Time"

        if (
            actual_days <= expected_days
            and actual_cost <= expected_cost
        ):
            outcome_status = "Successful"
        else:
            outcome_status = "Unsuccessful"

        records.append(
            {
                # Original shipment information
                "Shipment_ID":
                    row["Shipment_ID"],

                "Shipment_Date":
                    row["Shipment_Date"],

                "Shipping_Mode":
                    row["Shipping_Mode"],

                "Days_for_shipment_scheduled":
                    row[
                        "Days_for_shipment_scheduled"
                    ],

                "Category_Name":
                    row["Category_Name"],

                "Market":
                    row["Market"],

                "Order_Region":
                    row["Order_Region"],

                "Customer_Country":
                    row["Customer_Country"],

                "Customer_City":
                    row["Customer_City"],

                "Order_Item_Quantity":
                    row[
                        "Order_Item_Quantity"
                    ],

                "Sales_per_customer":
                    row["Sales_per_customer"],

                "Order_Item_Total":
                    row["Order_Item_Total"],

                "Order_Profit_Per_Order":
                    row[
                        "Order_Profit_Per_Order"
                    ],

                "Late_delivery_risk":
                    row["Late_delivery_risk"],

                # Decision
                "recommended_action":
                    action,

                # Expected outcome
                "expected_delivery_days":
                    expected_days,

                "expected_cost":
                    expected_cost,

                # Actual outcome
                "actual_delivery_days":
                    actual_days,

                "actual_cost":
                    actual_cost,

                "delivery_status":
                    delivery_status,

                "outcome_status":
                    outcome_status,
            }
        )

    return pd.DataFrame(
        records
    )


# ============================================================
# Save generated outcomes
# ============================================================

def save_decision_outcomes(
    df: pd.DataFrame,
    file_path: Optional[Path] = None,
) -> None:

    path = file_path or OUTCOME_FILE

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    df.to_csv(
        path,
        index=False,
    )


# ============================================================
# Record an actual outcome
# ============================================================

def record_outcome(
    shipment_id: str,
    actual_delivery_days: float,
    actual_cost: float,
    file_path: Optional[Path] = None,
) -> pd.Series:
    """
    Update one existing shipment's actual result.

    Used for the closed-loop feedback stage.
    """

    path = file_path or OUTCOME_FILE

    if not path.exists():
        raise FileNotFoundError(
            f"Outcome file not found:\n{path}\n\n"
            "Generate decision outcomes first."
        )

    df = pd.read_csv(path)

    if "Shipment_ID" not in df.columns:
        raise ValueError(
            "Shipment_ID column not found."
        )

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

    # Store actual values
    df.loc[
        index,
        "actual_delivery_days",
    ] = float(actual_delivery_days)

    df.loc[
        index,
        "actual_cost",
    ] = float(actual_cost)

    # Delivery status
    if (
        float(actual_delivery_days)
        > expected_delivery
    ):
        delivery_status = "Delayed"
    else:
        delivery_status = "On Time"

    df.loc[
        index,
        "delivery_status",
    ] = delivery_status

    # Outcome status
    if (
        float(actual_delivery_days)
        <= expected_delivery
        and float(actual_cost)
        <= expected_cost
    ):
        outcome_status = "Successful"
    else:
        outcome_status = "Unsuccessful"

    df.loc[
        index,
        "outcome_status",
    ] = outcome_status

    df.to_csv(
        path,
        index=False,
    )

    return df.loc[index]


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    print("=" * 65)
    print("SUPPLY PRESCRIPT")
    print("DECISION / OUTCOME DATA GENERATION")
    print("=" * 65)

    shipments = load_shipments()

    outcomes = create_decision_outcomes(
        shipments
    )

    save_decision_outcomes(
        outcomes
    )

    print(
        f"Source rows   : {len(shipments)}"
    )

    print(
        f"Generated rows: {len(outcomes)}"
    )

    print(
        f"Output file   : {OUTCOME_FILE}"
    )

    print()
    print(
        outcomes[
            [
                "Shipment_ID",
                "recommended_action",
                "expected_delivery_days",
                "actual_delivery_days",
                "expected_cost",
                "actual_cost",
                "delivery_status",
                "outcome_status",
            ]
        ].to_string(
            index=False
        )
    )