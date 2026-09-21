import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

from config import PROCESSED_DATA_PATH
from feature_engineering import create_features


def evaluate_tuned_model():

    data = pd.read_csv(
        PROCESSED_DATA_PATH,
        encoding="latin1"
    )

    data = create_features(data)

    X = data.drop(columns=["Late_delivery_risk"])
    y = data["Late_delivery_risk"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model_path = (
        "ml-model/models/xgboost_delay_model_tuned.pkl"
    )

    model = joblib.load(model_path)

    probabilities = model.predict_proba(X_test)[:, 1]

    roc_auc = roc_auc_score(
        y_test,
        probabilities
    )

    print("=" * 70)
    print("TUNED MODEL THRESHOLD EVALUATION")
    print("=" * 70)

    print(f"\nROC-AUC: {roc_auc:.4f}\n")

    print(
        f"{'Threshold':<12}"
        f"{'Accuracy':<12}"
        f"{'Precision':<12}"
        f"{'Recall':<12}"
        f"{'F1':<12}"
    )

    print("-" * 60)

    results = []

    for threshold in [0.30, 0.35, 0.40, 0.45, 0.50, 0.55]:

        predictions = (
            probabilities >= threshold
        ).astype(int)

        accuracy = accuracy_score(
            y_test,
            predictions
        )

        precision = precision_score(
            y_test,
            predictions,
            zero_division=0
        )

        recall = recall_score(
            y_test,
            predictions,
            zero_division=0
        )

        f1 = f1_score(
            y_test,
            predictions,
            zero_division=0
        )

        results.append(
            (
                threshold,
                accuracy,
                precision,
                recall,
                f1
            )
        )

        print(
            f"{threshold:<12.2f}"
            f"{accuracy:<12.4f}"
            f"{precision:<12.4f}"
            f"{recall:<12.4f}"
            f"{f1:<12.4f}"
        )

    best = max(
        results,
        key=lambda x: x[4]
    )

    print("\n" + "=" * 70)
    print("BEST THRESHOLD BY F1")
    print("=" * 70)

    print(f"Threshold : {best[0]:.2f}")
    print(f"Accuracy  : {best[1]:.4f}")
    print(f"Precision : {best[2]:.4f}")
    print(f"Recall    : {best[3]:.4f}")
    print(f"F1 Score  : {best[4]:.4f}")


if __name__ == "__main__":
    evaluate_tuned_model()