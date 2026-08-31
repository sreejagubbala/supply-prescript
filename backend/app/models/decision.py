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


class Decision(Base):

    __tablename__ = "decisions"

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

    prescription_id = Column(
        Integer,
        ForeignKey("prescriptions.id"),
        nullable=False
    )

    selected_option = Column(
        String(150),
        nullable=False
    )

    estimated_cost = Column(Float)

    user_name = Column(
        String(150)
    )

    decision_status = Column(
        String(50),
        default="Executed"
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
  
