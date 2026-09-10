from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime
)

from sqlalchemy.sql import func

from ..database import Base


class Supplier(Base):

    __tablename__ = "suppliers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    supplier_name = Column(
        String(150),
        nullable=False
    )

    reliability_score = Column(Float)

    location = Column(
        String(150)
    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )
