from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Text
)

from sqlalchemy.sql import func

from ..database import Base


class Prescription(Base):

    __tablename__ = "prescriptions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    shipment_id = Column(
        Integer,
        ForeignKey("shipments.id"),
        nullable=False
    )

    option_name = Column(
        String(150),
        nullable=False
    )

    description = Column(
        Text
    )

    estimated_cost = Column(
        Float
    )

    delivery_days = Column(
        Float
    )

    risk_score = Column(
        Float
    )

    recommendation_rank = Column(
        Integer
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
