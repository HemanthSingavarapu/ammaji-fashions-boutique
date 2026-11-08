from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.security import get_current_user, get_optional_current_user

router = APIRouter(prefix="/api/users/me/measurements", tags=["measurements"])

@router.get("", response_model=Optional[schemas.UserMeasurementSchema])
def get_measurements(
    current_user: Optional[models.User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        return None
    measurement = db.query(models.UserMeasurement).filter(models.UserMeasurement.userId == current_user.id).first()
    return measurement

@router.post("", response_model=schemas.UserMeasurementSchema)
def save_measurements(
    data: schemas.UserMeasurementSchema,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.UserMeasurement).filter(models.UserMeasurement.userId == current_user.id).first()
    if not existing:
        existing = models.UserMeasurement(userId=current_user.id)
        db.add(existing)

    existing.bust = data.bust
    existing.waist = data.waist
    existing.shoulder = data.shoulder
    existing.blouseLength = data.blouseLength
    existing.sleeveLength = data.sleeveLength
    existing.armhole = data.armhole
    existing.frontNeck = data.frontNeck
    existing.backNeck = data.backNeck
    existing.otherMeasurements = data.otherMeasurements

    db.commit()
    db.refresh(existing)
    return existing
