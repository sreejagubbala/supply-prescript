from pydantic import BaseModel
from typing import Optional


class DecisionCreate(BaseModel):

    shipment_id: int

    prescription_id: int

    selected_option: str

    estimated_cost: Optional[float] = None

    user_name: Optional[str] = None

    decision_status: Optional[str] = "Executed"


class DecisionResponse(BaseModel):

    id: int

    shipment_id: int

    prescription_id: int

    selected_option: str

    estimated_cost: Optional[float] = None

    user_name: Optional[str] = None

    decision_status: Optional[str] = None

    created_at: Optional[str] = None
