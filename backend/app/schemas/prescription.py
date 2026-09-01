from pydantic import BaseModel, ConfigDict
from typing import Optional


class PrescriptionBase(BaseModel):

    shipment_id: int
    option_name: str
    description: Optional[str] = None
    estimated_cost: Optional[float] = None
    delivery_days: Optional[float] = None
    risk_score: Optional[float] = None
    recommendation_rank: Optional[int] = None


class PrescriptionCreate(PrescriptionBase):
    pass


class PrescriptionResponse(PrescriptionBase):

    id: int

    model_config = ConfigDict(
        from_attributes=True
    )
