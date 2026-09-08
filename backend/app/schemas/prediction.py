from pydantic import BaseModel
from typing import Optional


class PredictionResponse(BaseModel):

    shipment_id: int

    riskScore: float

    prediction: str

    confidence: Optional[float] = None
