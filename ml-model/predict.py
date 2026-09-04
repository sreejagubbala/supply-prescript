import joblib
import pandas as pd

from config import DURATION_MODEL_PATH, MODEL_PATH
from feature_engineering import create_features


DELAY_THRESHOLD = 0.35
HIGH_RISK_THRESHOLD = 0.70


def predict_delay(shipment):
    """
    Predict shipment delay risk and shipping duration.

    shipment: dictionary containing shipment details
    returns: delay prediction, probability, risk level,
             and predicted shipping days
    """

    input_df = pd.DataFrame([shipment])

    features = create_features(
        input_df,
        include_target=False
    )

    delay_pipeline = joblib.load(MODEL_PATH)
    duration_pipeline = joblib.load(DURATION_MODEL_PATH)

    delay_probability = float(
        delay_pipeline.predict_proba(features)[0][1]
    )

    predicted_shipping_days = float(
        duration_pipeline.predict(features)[0]
    )

    predicted_delay = int(
        delay_probability >= DELAY_THRESHOLD
    )

    if delay_probability >= HIGH_RISK_THRESHOLD:
        risk_level = "High"
    elif delay_probability >= DELAY_THRESHOLD:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "predicted_delay": predicted_delay,
        "delay_probability": round(delay_probability, 4),
        "risk_level": risk_level,
        "predicted_shipping_days": round(
            predicted_shipping_days,
            2
        ),
    }


if __name__ == "__main__":
    sample_shipment = {
        "Shipping Mode": "Standard Class",
        "Days for shipment (scheduled)": 4,
        "Type": "DEBIT",
        "Category Name": "Sporting Goods",
        "Department Name": "Fitness",
        "Market": "Pacific Asia",
        "Order Region": "Southeast Asia",
        "Customer Country": "India",
        "Customer City": "Hyderabad",
        "Order Item Quantity": 2,
        "Sales per customer": 245.50,
        "Order Item Total": 221.00,
        "Order Profit Per Order": 24.50,
        "shipping date (DateOrders)": "2026-08-27 10:00:00",
    }

    print(predict_delay(sample_shipment))