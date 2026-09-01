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


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentResponse(ShipmentBase):

    id: int

    model_config = ConfigDict(
        from_attributes=True
    )
