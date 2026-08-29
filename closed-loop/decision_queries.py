import os
import pandas as pd


# ============================================================
# SUPPLY PRESCRIPT
# Day 9 - Decision / Outcome Analytics Queries
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
# Load files
# ============================================================

def load_data():

    decisions = pd.read_csv(DECISION_FILE)
    shipments = pd.read_csv(SHIPMENT_FILE)

    return decisions, shipments


# ============================================================
# Column helper
# ============================================================

def find_column(df, possible_names):

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
# Prepare decision/outcome data
# ============================================================

def prepare_data():

    df, shipments = load_data()

    print("\n==========================================")
    print("PREPARING DECISION / OUTCOME DATA")
    print("==========================================")

    # --------------------------------------------------------
    # Identify important columns
    # --------------------------------------------------------

    shipment_col = find_column(
        df,
        ["Shipment_ID", "shipment_id", "Shipment ID"]
    )

    expected_cost_col = find_column(
        df,
        [
            "Expected_Cost",
            "expected_cost",
            "Expected Cost"
        ]
    )

    actual_cost_col = find_column(
        df,
        [
            "Actual_Cost",
            "actual_cost",
            "Actual Cost"
        ]
    )

    expected_delay_col = find_column(
        df,
        [
            "Expected_Delay_Days",
            "expected_delay_days",
            "Expected Delay Days"
        ]
    )

    actual_delay_col = find_column(
        df,
        [
            "Actual_Delay_Days",
            "actual_delay_days",
            "Actual Delay Days"
        ]
    )

    # --------------------------------------------------------
    # Calculate cost difference
    # --------------------------------------------------------

    if expected_cost_col and actual_cost_col:

        df["Calculated_Cost_Difference"] = (
            pd.to_numeric(
                df[actual_cost_col],
                errors="coerce"
            )
            -
            pd.to_numeric(
                df[expected_cost_col],
                errors="coerce"
            )
        )

    # --------------------------------------------------------
    # Calculate delay difference
    # --------------------------------------------------------

    if expected_delay_col and actual_delay_col:

        df["Calculated_Delay_Difference"] = (
            pd.to_numeric(
                df[actual_delay_col],
                errors="coerce"
            )
            -
            pd.to_numeric(
                df[expected_delay_col],
                errors="coerce"
            )
        )

    # --------------------------------------------------------
    # Connect with Week 1 shipment data
    # --------------------------------------------------------

    shipment_id_col = find_column(
        shipments,
        ["Shipment_ID", "shipment_id", "Shipment ID"]
    )

    if shipment_col and shipment_id_col:

        df = df.merge(
            shipments,
            left_on=shipment_col,
            right_on=shipment_id_col,
            how="left",
            suffixes=("", "_shipment")
        )

    return df


# ============================================================
# Query 1
# All decisions
# ============================================================

def query_all_decisions(df):

    print("\n==========================================")
    print("QUERY 1 - ALL DECISIONS")
    print("==========================================")

    print(df.to_string(index=False))

    return df


# ============================================================
# Query 2
# Expected vs Actual Cost
# ============================================================

def query_cost_comparison(df):

    print("\n==========================================")
    print("QUERY 2 - EXPECTED VS ACTUAL COST")
    print("==========================================")

    columns = [
        column
        for column in [
            "Decision_ID",
            "Shipment_ID",
            "Expected_Cost",
            "Actual_Cost",
            "Calculated_Cost_Difference"
        ]
        if column in df.columns
    ]

    if columns:
        result = df[columns]

    else:
        result = df

    print(result.to_string(index=False))

    return result


# ============================================================
# Query 3
# Expected vs Actual Delay
# ============================================================

def query_delay_comparison(df):

    print("\n==========================================")
    print("QUERY 3 - EXPECTED VS ACTUAL DELAY")
    print("==========================================")

    columns = [
        column
        for column in [
            "Decision_ID",
            "Shipment_ID",
            "Expected_Delay_Days",
            "Actual_Delay_Days",
            "Calculated_Delay_Difference"
        ]
        if column in df.columns
    ]

    if columns:
        result = df[columns]

    else:
        result = df

    print(result.to_string(index=False))

    return result


# ============================================================
# Query 4
# Total savings
# ============================================================

def query_total_savings(df):

    print("\n==========================================")
    print("QUERY 4 - TOTAL SAVINGS")
    print("==========================================")

    savings_col = find_column(
        df,
        ["Savings", "savings"]
    )

    if savings_col:

        savings = pd.to_numeric(
            df[savings_col],
            errors="coerce"
        ).sum()

    elif "Calculated_Cost_Difference" in df.columns:

        savings = -df[
            "Calculated_Cost_Difference"
        ].sum()

    else:

        savings = 0

    print(f"Total Savings: {savings:.2f}")

    return savings


# ============================================================
# Query 5
# Decision success rate
# ============================================================

def query_success_rate(df):

    print("\n==========================================")
    print("QUERY 5 - DECISION SUCCESS RATE")
    print("==========================================")

    success_col = find_column(
        df,
        [
            "Decision_Success",
            "decision_success",
            "Decision Success"
        ]
    )

    if not success_col:

        print(
            "Decision success column not found."
        )

        return None

    total = len(df)

    successful = (
        df[success_col]
        .astype(str)
        .str.strip()
        .str.lower()
        == "successful"
    ).sum()

    if total > 0:
        rate = (
            successful / total
        ) * 100
    else:
        rate = 0

    print(f"Total Decisions: {total}")
    print(f"Successful Decisions: {successful}")
    print(f"Success Rate: {rate:.2f}%")

    return rate


# ============================================================
# Query 6
# Success distribution
# ============================================================

def query_success_distribution(df):

    print("\n==========================================")
    print("QUERY 6 - DECISION SUCCESS DISTRIBUTION")
    print("==========================================")

    success_col = find_column(
        df,
        [
            "Decision_Success",
            "decision_success",
            "Decision Success"
        ]
    )

    if not success_col:
        return None

    result = (
        df[success_col]
        .value_counts()
        .reset_index()
    )

    result.columns = [
        "Decision_Success",
        "Decision_Count"
    ]

    print(result.to_string(index=False))

    return result


# ============================================================
# Query 7
# Action performance
# ============================================================

def query_action_performance(df):

    print("\n==========================================")
    print("QUERY 7 - ACTION PERFORMANCE")
    print("==========================================")

    action_col = find_column(
        df,
        [
            "Selected_Action",
            "selected_action",
            "Selected Action"
        ]
    )

    if not action_col:

        print(
            "Selected action column not found."
        )

        return None

    grouped = df.groupby(action_col)

    result = grouped.size().reset_index(
        name="Decision_Count"
    )

    if "Expected_Cost" in df.columns:

        expected = (
            grouped["Expected_Cost"]
            .mean()
            .reset_index(
                name="Average_Expected_Cost"
            )
        )

        result = result.merge(
            expected,
            on=action_col
        )

    if "Actual_Cost" in df.columns:

        actual = (
            grouped["Actual_Cost"]
            .mean()
            .reset_index(
                name="Average_Actual_Cost"
            )
        )

        result = result.merge(
            actual,
            on=action_col
        )

    if "Calculated_Cost_Difference" in df.columns:

        difference = (
            grouped["Calculated_Cost_Difference"]
            .mean()
            .reset_index(
                name="Average_Cost_Difference"
            )
        )

        result = result.merge(
            difference,
            on=action_col
        )

    print(result.to_string(index=False))

    return result


# ============================================================
# Query 8
# Recommended vs Selected
# ============================================================

def query_manager_overrides(df):

    print("\n==========================================")
    print("QUERY 8 - MANAGER OVERRIDES")
    print("==========================================")

    recommended_col = find_column(
        df,
        [
            "Recommended_Action",
            "recommended_action",
            "Recommended Action"
        ]
    )

    selected_col = find_column(
        df,
        [
            "Selected_Action",
            "selected_action",
            "Selected Action"
        ]
    )

    if not recommended_col or not selected_col:

        print(
            "Recommendation/selection columns "
            "not found."
        )

        return None

    total = len(df)

    overrides = (
        df[recommended_col].astype(str).str.strip()
        !=
        df[selected_col].astype(str).str.strip()
    ).sum()

    if total > 0:
        override_rate = (
            overrides / total
        ) * 100
    else:
        override_rate = 0

    print(f"Total Decisions: {total}")
    print(f"Manager Overrides: {overrides}")
    print(f"Override Rate: {override_rate:.2f}%")

    return override_rate


# ============================================================
# Query 9
# Successful decisions
# ============================================================

def query_successful_decisions(df):

    print("\n==========================================")
    print("QUERY 9 - SUCCESSFUL DECISIONS")
    print("==========================================")

    success_col = find_column(
        df,
        [
            "Decision_Success",
            "decision_success",
            "Decision Success"
        ]
    )

    if not success_col:
        return None

    result = df[
        df[success_col]
        .astype(str)
        .str.lower()
        .str.strip()
        == "successful"
    ]

    print(result.to_string(index=False))

    return result


# ============================================================
# Query 10
# Unsuccessful decisions
# ============================================================

def query_unsuccessful_decisions(df):

    print("\n==========================================")
    print("QUERY 10 - UNSUCCESSFUL DECISIONS")
    print("==========================================")

    success_col = find_column(
        df,
        [
            "Decision_Success",
            "decision_success",
            "Decision Success"
        ]
    )

    if not success_col:
        return None

    result = df[
        df[success_col]
        .astype(str)
        .str.lower()
        .str.strip()
        == "unsuccessful"
    ]

    print(result.to_string(index=False))

    return result


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":

    print("\n")
    print("==========================================")
    print("SUPPLY PRESCRIPT")
    print("DAY 9 - DECISION / OUTCOME QUERIES")
    print("==========================================")

    data = prepare_data()

    query_all_decisions(data)

    query_cost_comparison(data)

    query_delay_comparison(data)

    query_total_savings(data)

    query_success_rate(data)

    query_success_distribution(data)

    query_action_performance(data)

    query_manager_overrides(data)

    query_successful_decisions(data)

    query_unsuccessful_decisions(data)

    print("\n==========================================")
    print("DAY 9 COMPLETED")
    print("==========================================")