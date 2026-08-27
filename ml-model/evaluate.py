import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

from config import MODEL_PATH, PROCESSED_DATA_PATH, TARGET_COLUMN
from feature_engineering import create_features


def evaluate_model():
    data = pd.read_csv(PROCESSED_DATA_PATH, encoding="latin1")
    data = create_features(data)

    X = data.drop(columns=[TARGET_COLUMN])
    y = data[TARGET_COLUMN]

    _, X_test, _, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = joblib.load(MODEL_PATH)

    predictions = pipeline.predict(X_test)
    probabilities = pipeline.predict_proba(X_test)[:, 1]

    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(f"Precision: {precision_score(y_test, predictions):.4f}")
    print(f"Recall: {recall_score(y_test, predictions):.4f}")
    print(f"F1 score: {f1_score(y_test, predictions):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, probabilities):.4f}")

    print("\nConfusion matrix:")
    print(confusion_matrix(y_test, predictions))


if __name__ == "__main__":
    evaluate_model()