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


class Prediction(Base):

    __tablename__ = "predictions"

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

    delay_probability = Column(
        Float
    )

    predicted_delay_days = Column(
        Float
    )

    model_name = Column(
        String(100)
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
