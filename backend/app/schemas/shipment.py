from pydantic import BaseModel, ConfigDict
from typing import Optional


class ShipmentBase(BaseModel):

    shipment_code: str
    product: str

    supplier_id: Optional[int] = None

    quantity: int

    historical_lead_time: Optional[float] = None

    current_lead_time: Optional[float] = None

    inventory_level: Optional[float] = None

    status: Optional[str] = "Pending"

    origin: Optional[str] = None

    destination: Optional[str] = None

    eta: Optional[str] = None

    risk_score: Optional[float] = 0.0


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentResponse(BaseModel):

    id: int

    origin: Optional[str] = None

    destination: Optional[str] = None

    status: Optional[str] = None

    eta: Optional[str] = None

    riskScore: Optional[float] = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )
