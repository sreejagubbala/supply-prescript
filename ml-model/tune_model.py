import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.metrics import f1_score
from sklearn.model_selection import RandomizedSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier

from config import PROCESSED_DATA_PATH
from feature_engineering import create_features


def tune_model():

    print("Loading dataset...")
    data = pd.read_csv(
        PROCESSED_DATA_PATH,
        encoding="latin1"
    )

    print("Creating features...")
    data = create_features(data)

    X = data.drop(columns=["Late_delivery_risk"])
    y = data["Late_delivery_risk"]

    # Use a representative sample for hyperparameter tuning
    X_sample, _, y_sample, _ = train_test_split(
        X,
        y,
        train_size=20000,
        random_state=42,
        stratify=y
    )

    print(f"Tuning sample size: {len(X_sample)}")

    categorical_features = X_sample.select_dtypes(
        include=["object", "string"]
    ).columns.tolist()

    numeric_features = X_sample.select_dtypes(
        exclude=["object", "string"]
    ).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                categorical_features
            ),
            (
                "numeric",
                "passthrough",
                numeric_features
            ),
        ]
    )

    model = XGBClassifier(
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model),
    ])

    # Parameters to test
    param_distributions = {
        "model__n_estimators": [100, 200, 300],
        "model__max_depth": [4, 6, 8],
        "model__learning_rate": [0.05, 0.1, 0.2],
        "model__subsample": [0.8, 1.0],
        "model__colsample_bytree": [0.8, 1.0],
        "model__min_child_weight": [1, 3, 5],
    }

    print("\nStarting XGBoost hyperparameter tuning...")
    print("Please wait...\n")

    search = RandomizedSearchCV(
        estimator=pipeline,
        param_distributions=param_distributions,
        n_iter=8,
        scoring="f1",
        cv=3,
        random_state=42,
        n_jobs=1,
        verbose=2
    )

    search.fit(X_sample, y_sample)

    print("\n" + "=" * 60)
    print("BEST XGBOOST PARAMETERS")
    print("=" * 60)

    for parameter, value in search.best_params_.items():
        print(f"{parameter}: {value}")

    print(f"\nBest CV F1 score: {search.best_score_:.4f}")

    print("\nDay 11 hyperparameter tuning completed successfully.")


if __name__ == "__main__":
    tune_model()