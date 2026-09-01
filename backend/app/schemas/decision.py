from pydantic import BaseModel, ConfigDict
from typing import Optional


class DecisionCreate(BaseModel):

    shipment_id: int
    prescription_id: int
    user_name: Optional[str] = None


class DecisionResponse(BaseModel):

    id: int
    shipment_id: int
    prescription_id: int
    selected_option: str
    estimated_cost: Optional[float] = None
    user_name: Optional[str] = None
    decision_status: str

    model_config = ConfigDict(
        from_attributes=True
    )
