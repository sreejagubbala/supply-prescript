import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier

from config import MODEL_PATH, PROCESSED_DATA_PATH
from feature_engineering import create_features


def train_tuned_model():

    print("Loading dataset...")

    data = pd.read_csv(
        PROCESSED_DATA_PATH,
        encoding="latin1"
    )

    print("Creating features...")

    data = create_features(data)

    X = data.drop(columns=["Late_delivery_risk"])
    y = data["Late_delivery_risk"]

    categorical_features = X.select_dtypes(
        include=["object", "string"]
    ).columns.tolist()

    numeric_features = X.select_dtypes(
        exclude=["object", "string"]
    ).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                categorical_features,
            ),
            (
                "numeric",
                "passthrough",
                numeric_features,
            ),
        ]
    )

    # Best parameters from Day 11 tuning
    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.2,
        subsample=1.0,
        colsample_bytree=0.8,
        min_child_weight=3,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model),
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    print(f"Training rows: {len(X_train)}")
    print(f"Testing rows: {len(X_test)}")

    print("\nTraining tuned XGBoost model...")

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

    probabilities = pipeline.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)
    roc_auc = roc_auc_score(y_test, probabilities)

    print("\n" + "=" * 60)
    print("TUNED MODEL RESULTS")
    print("=" * 60)

    print(f"Accuracy : {accuracy:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"ROC-AUC  : {roc_auc:.4f}")

    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    # Save tuned model
    tuned_model_path = MODEL_PATH.parent / "xgboost_delay_model_tuned.pkl"

    joblib.dump(
        pipeline,
        tuned_model_path
    )

    print(
        f"\nTuned model saved to: {tuned_model_path}"
    )


if __name__ == "__main__":
    train_tuned_model()