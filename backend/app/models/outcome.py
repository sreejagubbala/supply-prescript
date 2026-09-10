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


class Outcome(Base):

    __tablename__ = "outcomes"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    decision_id = Column(
        Integer,
        ForeignKey("decisions.id"),
        nullable=False
    )

    actual_cost = Column(Float)

    actual_delivery_days = Column(Float)

    outcome_status = Column(
        String(100)
    )

    notes = Column(Text)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
