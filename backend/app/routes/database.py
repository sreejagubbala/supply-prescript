from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..database import get_db


router = APIRouter(
    prefix="/api/database",
    tags=["Database"]
)


@router.get("/health")
def database_health(
    db: Session = Depends(get_db)
):

    try:

        db.execute(
            text("SELECT 1")
        )

        return {
            "status": "connected",
            "database": "PostgreSQL",
            "message": "Database connection successful"
        }

    except Exception as error:

        return {
            "status": "error",
            "database": "PostgreSQL",
            "message": "Database connection failed",
            "error": str(error)
        }
