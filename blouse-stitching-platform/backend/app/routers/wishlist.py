from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models, schemas
from app.security import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])

@router.get("", response_model=List[schemas.DesignResponse])
def get_wishlist(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(models.WishlistItem).options(
        joinedload(models.WishlistItem.design).joinedload(models.Design.category)
    ).filter(models.WishlistItem.userId == current_user.id).all()
    return [item.design for item in items if item.design]

@router.post("/{design_id}")
def add_to_wishlist(
    design_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    design = db.query(models.Design).filter(models.Design.id == design_id).first()
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")

    existing = db.query(models.WishlistItem).filter(
        models.WishlistItem.userId == current_user.id,
        models.WishlistItem.designId == design_id
    ).first()

    if not existing:
        new_item = models.WishlistItem(userId=current_user.id, designId=design_id)
        db.add(new_item)
        db.commit()

    return Response(status_code=status.HTTP_200_OK)

@router.delete("/{design_id}")
def remove_from_wishlist(
    design_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(models.WishlistItem).filter(
        models.WishlistItem.userId == current_user.id,
        models.WishlistItem.designId == design_id
    ).first()

    if item:
        db.delete(item)
        db.commit()

    return Response(status_code=status.HTTP_200_OK)
