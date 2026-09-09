from pydantic import BaseModel
from typing import Optional


class PrescriptionCreate(BaseModel):

    shipment_id: int

    option_name: str

    description: Optional[str] = None

    estimated_cost: Optional[float] = None

    delivery_days: Optional[float] = None

    risk_score: Optional[float] = None

    recommendation_rank: Optional[int] = None


class PrescriptionResponse(BaseModel):

    id: int

    shipment_id: int

    option_name: str

    description: Optional[str] = None

    estimated_cost: Optional[float] = None

    delivery_days: Optional[float] = None

    risk_score: Optional[float] = None

    recommendation_rank: Optional[int] = None

    created_at: Optional[str] = None
