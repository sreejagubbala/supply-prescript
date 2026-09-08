import os
import joblib


MODEL_PATH = os.path.join(
    "ml-model",
    "models",
    "xgboost_delay_model.pkl"
)


class MLService:

    def __init__(self):

        self.model = None

        if os.path.exists(MODEL_PATH):

            self.model = joblib.load(
                MODEL_PATH
            )


    def predict(self, features):

        if self.model is None:

            return {
                "riskScore": 0.0,
                "prediction": "Unknown",
                "confidence": 0.0
            }

        prediction = self.model.predict(
            [features]
        )[0]

        risk_score = 0.0

        if hasattr(
            self.model,
            "predict_proba"
        ):

            probabilities = (
                self.model.predict_proba(
                    [features]
                )[0]
            )

            risk_score = float(
                max(probabilities)
            )


        if prediction == 1:

            result = "Delayed"

        else:

            result = "On Time"


        return {
            "riskScore": risk_score,
            "prediction": result,
            "confidence": risk_score
        }


ml_service = MLService()
