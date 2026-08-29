import os
import pandas as pd


# ============================================================
# SUPPLY PRESCRIPT
# Day 8 - Decision Tracking Logic
# Member 5 - Closed Loop & Analytics
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DECISION_FILE = os.path.join(
    BASE_DIR,
    "data",
    "sample",
    "decision_outcomes.csv"
)

SHIPMENT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "sample",
    "sample_shipments.csv"
)


# ============================================================
# Load data
# ============================================================

def load_decision_data():
    """Load existing decision/outcome data."""

    if not os.path.exists(DECISION_FILE):
        raise FileNotFoundError(
            f"Decision file not found: {DECISION_FILE}"
        )

    return pd.read_csv(DECISION_FILE)


def load_shipment_data():
    """Load existing Week 1 shipment data."""

    if not os.path.exists(SHIPMENT_FILE):
        raise FileNotFoundError(
            f"Shipment file not found: {SHIPMENT_FILE}"
        )

    return pd.read_csv(SHIPMENT_FILE)


# ============================================================
# Helper function
# ============================================================

def find_column(df, possible_names):
    """
    Find a column using several possible column names.
    This makes the code work with slightly different
    CSV naming conventions.
    """

    normalized = {
        str(column).strip().lower().replace(" ", "_"): column
        for column in df.columns
    }

    for name in possible_names:

        key = name.lower().replace(" ", "_")

        if key in normalized:
            return normalized[key]

    return None


# ============================================================
# Create decision record
# ============================================================

def create_decision(
    decision_id,
    shipment_id,
    recommended_action,
    selected_action,
    expected_cost,
    expected_delay
):
    """
    Create a new decision record.
    """

    decision = {
        "Decision_ID": decision_id,
        "Shipment_ID": shipment_id,
        "Recommended_Action": recommended_action,
        "Selected_Action": selected_action,
        "Expected_Cost": expected_cost,
        "Expected_Delay_Days": expected_delay,
        "Decision_Status": "Executed"
    }

    return decision


# ============================================================
# Evaluate decision
# ============================================================

def evaluate_decision(
    expected_cost,
    actual_cost,
    expected_delay,
    actual_delay
):
    """
    Compare expected and actual decision results.
    """

    cost_difference = None
    delay_difference = None

    if pd.notna(expected_cost) and pd.notna(actual_cost):
        cost_difference = actual_cost - expected_cost

    if pd.notna(expected_delay) and pd.notna(actual_delay):
        delay_difference = actual_delay - expected_delay

    # --------------------------------------------------------
    # Determine decision success
    # --------------------------------------------------------

    if cost_difference is not None and delay_difference is not None:

        if cost_difference <= 0 and delay_difference <= 0:
            success = "Successful"

        elif cost_difference <= 0 or delay_difference <= 0:
            success = "Partially Successful"

        else:
            success = "Unsuccessful"

    elif cost_difference is not None:

        if cost_difference <= 0:
            success = "Successful"
        else:
            success = "Unsuccessful"

    elif delay_difference is not None:

        if delay_difference <= 0:
            success = "Successful"
        else:
            success = "Unsuccessful"

    else:
        success = "Not Evaluated"

    return {
        "Cost_Difference": cost_difference,
        "Delay_Difference": delay_difference,
        "Decision_Success": success
    }


# ============================================================
# Track existing decisions
# ============================================================

def track_decisions():

    decisions = load_decision_data()
    shipments = load_shipment_data()

    print("\n==========================================")
    print("SUPPLY PRESCRIPT - DECISION TRACKING")
    print("==========================================")

    print("\nDecision/Outcome records:")
    print(f"Rows: {len(decisions)}")

    print("\nShipment records:")
    print(f"Rows: {len(shipments)}")

    # --------------------------------------------------------
    # Find Shipment_ID columns
    # --------------------------------------------------------

    decision_shipment_col = find_column(
        decisions,
        ["Shipment_ID", "shipment_id", "Shipment ID"]
    )

    shipment_id_col = find_column(
        shipments,
        ["Shipment_ID", "shipment_id", "Shipment ID"]
    )

    # --------------------------------------------------------
    # Connect decision data with Week 1 shipment data
    # --------------------------------------------------------

    if decision_shipment_col and shipment_id_col:

        merged = decisions.merge(
            shipments,
            left_on=decision_shipment_col,
            right_on=shipment_id_col,
            how="left",
            suffixes=("_decision", "_shipment")
        )

        print("\nDecision → Shipment connection successful.")

    else:

        merged = decisions.copy()

        print(
            "\nShipment_ID column was not found in "
            "one of the files."
        )

    return merged


# ============================================================
# Display decision lifecycle
# ============================================================

def show_decision_lifecycle():

    print("\n==========================================")
    print("DECISION LIFECYCLE")
    print("==========================================")

    print("""
Shipment
   ↓
Prediction
   ↓
Recommended Action
   ↓
Manager Selects Action
   ↓
Decision Logged
   ↓
Action Executed
   ↓
Actual Outcome
   ↓
Expected vs Actual
   ↓
Decision Success
""")


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    show_decision_lifecycle()

    result = track_decisions()

    print("\n==========================================")
    print("TRACKED DECISION DATA")
    print("==========================================")

    print(result.head(10).to_string(index=False))

    print("\nDay 8 decision tracking completed.")