from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.supplier import Supplier


router = APIRouter(
    prefix="/api/suppliers",
    tags=["Suppliers"]
)


@router.get("/")
def get_suppliers(
    db: Session = Depends(get_db)
):

    suppliers = (
        db.query(Supplier)
        .order_by(Supplier.id)
        .all()
    )

    return suppliers


@router.get("/{supplier_id}")
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db)
):

    supplier = (
        db.query(Supplier)
        .filter(
            Supplier.id == supplier_id
        )
        .first()
    )

    if supplier is None:

        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    return supplier
