from pydantic import BaseModel, ConfigDict
from typing import Optional


class OutcomeCreate(BaseModel):

    decision_id: int
    actual_cost: Optional[float] = None
    actual_delivery_days: Optional[float] = None
    outcome_status: Optional[str] = None
    notes: Optional[str] = None


class OutcomeResponse(BaseModel):

    id: int
    decision_id: int
    actual_cost: Optional[float] = None
    actual_delivery_days: Optional[float] = None
    outcome_status: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )
