import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor

from config import DURATION_MODEL_PATH, PROCESSED_DATA_PATH
from feature_engineering import create_features

DURATION_TARGET = "Days for shipping (real)"


def train_duration_model():
    data = pd.read_csv(PROCESSED_DATA_PATH, encoding="latin1")
    data = data.dropna(subset=[DURATION_TARGET])

    X = create_features(data, include_target=False)
    y = data[DURATION_TARGET]

    categorical_features = X.select_dtypes(
        include=["object", "string"]
    ).columns.tolist()

    numeric_features = X.select_dtypes(
        exclude=["object", "string"]
    ).columns.tolist()

    preprocessor = ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical_features),
            ("numeric", "passthrough", numeric_features),
        ]
    )

    model = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model),
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
    )

    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)

    print(f"MAE: {mean_absolute_error(y_test, predictions):.4f}")
    print(f"RMSE: {mean_squared_error(y_test, predictions) ** 0.5:.4f}")
    print(f"R² score: {r2_score(y_test, predictions):.4f}")

    DURATION_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, DURATION_MODEL_PATH)
    print(f"Duration model saved to: {DURATION_MODEL_PATH}")


if __name__ == "__main__":
    train_duration_model()