from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime
)

from sqlalchemy.sql import func

from ..database import Base


class Shipment(Base):

    __tablename__ = "shipments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    shipment_code = Column(
        String(100),
        unique=True,
        nullable=False
    )

    product = Column(
        String(150),
        nullable=False
    )

    supplier_id = Column(
        Integer,
        ForeignKey("suppliers.id")
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    historical_lead_time = Column(
        Float
    )

    current_lead_time = Column(
        Float
    )

    inventory_level = Column(
        Float
    )

    status = Column(
        String(50),
        default="Pending"
    )

    # Frontend integration fields

    origin = Column(
        String(150)
    )

    destination = Column(
        String(150)
    )

    eta = Column(
        String(50)
    )

    risk_score = Column(
        Float,
        default=0.0
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
