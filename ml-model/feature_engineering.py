import pandas as pd
from config import PROCESSED_DATA_PATH, TARGET_COLUMN


FEATURE_COLUMNS = [
    "Shipping Mode",
    "Days for shipment (scheduled)",
    "Type",
    "Category Name",
    "Department Name",
    "Market",
    "Order Region",
    "Customer Country",
    "Customer City",
    "Order Item Quantity",
    "Sales per customer",
    "Order Item Total",
    "Order Profit Per Order",
    "shipping_month",
    "shipping_day_of_week",
]


def create_features(df):
    df = df.copy()

    date_column = "shipping date (DateOrders)"
    df[date_column] = pd.to_datetime(df[date_column], errors="coerce")

    df["shipping_month"] = df[date_column].dt.month
    df["shipping_day_of_week"] = df[date_column].dt.dayofweek

    df = df.drop(columns=[date_column], errors="ignore")

    required_columns = FEATURE_COLUMNS + [TARGET_COLUMN]
    missing_columns = [col for col in required_columns if col not in df.columns]

    if missing_columns:
        raise ValueError(f"Missing columns: {missing_columns}")

    return df[required_columns]


if __name__ == "__main__":
    data = pd.read_csv(PROCESSED_DATA_PATH, encoding="latin1")
    features = create_features(data)

    print("Feature data shape:", features.shape)
    print("\nFeatures:")
    print(features.columns.tolist())
    print("\nMissing values:")
    print(features.isnull().sum())