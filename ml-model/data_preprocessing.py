import pandas as pd
from config import RAW_DATA_PATH, PROCESSED_DATA_PATH, TARGET_COLUMN


def load_data():
    return pd.read_csv(RAW_DATA_PATH, encoding="latin1")


def preprocess_data(df):
    leakage_columns = [
        "Delivery Status",
        "Days for shipping (real)"
    ]

    df = df.drop(columns=leakage_columns, errors="ignore")
    df = df.dropna(subset=[TARGET_COLUMN])
    df = df.drop_duplicates()

    return df


if __name__ == "__main__":
    df = load_data()
    processed_df = preprocess_data(df)

    PROCESSED_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    processed_df.to_csv(PROCESSED_DATA_PATH, index=False)

    print(f"Original shape: {df.shape}")
    print(f"Processed shape: {processed_df.shape}")
    print("Preprocessing completed.")