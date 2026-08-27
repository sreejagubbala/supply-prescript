from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DATA_PATH = BASE_DIR / "data" / "raw" / "DataCoSupplyChainDataset.csv"
PROCESSED_DATA_PATH = BASE_DIR / "data" / "processed" / "processed_supply_chain.csv"

TARGET_COLUMN = "Late_delivery_risk"
MODEL_PATH = BASE_DIR / "ml-model" / "models" / "xgboost_delay_model.pkl"