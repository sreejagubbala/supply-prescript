from pydantic import BaseModel, ConfigDict
from typing import Optional


class PredictionBase(BaseModel):

    shipment_id: int
    delay_probability: float
    predicted_delay_days: float
    model_name: Optional[str] = "XGBoost"


class PredictionCreate(PredictionBase):
    pass


class PredictionResponse(PredictionBase):

    id: int

    model_config = ConfigDict(
        from_attributes=True
    )
