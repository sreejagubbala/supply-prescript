import pandas as pd
from config import RAW_DATA_PATH, PROCESSED_DATA_PATH, TARGET_COLUMN


def load_data():
    return pd.read_csv(RAW_DATA_PATH, encoding="latin1")


def preprocess_data(df):
    # Remove columns that reveal delivery outcome after it happens
    leakage_columns = [
        "Delivery Status",
        "Days for shipping (real)"
    ]

    df = df.drop(columns=leakage_columns, errors="ignore")
    df = df.dropna(subset=[TARGET_COLUMN])

    return df


if __name__ == "__main__":
    data = load_data()
    processed_data = preprocess_data(data)

    PROCESSED_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    processed_data.to_csv(PROCESSED_DATA_PATH, index=False)

    print("Processed data saved successfully.")
    print(processed_data.shape)