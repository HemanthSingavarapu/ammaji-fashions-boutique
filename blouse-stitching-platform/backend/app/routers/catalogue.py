from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api", tags=["catalogue"])

@router.get("/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).filter(models.Category.active == True).all()

@router.get("/categories/{id}", response_model=schemas.CategoryResponse)
def get_category(id: int, db: Session = Depends(get_db)):
    cat = db.query(models.Category).filter(models.Category.id == id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return cat

@router.get("/designs", response_model=List[schemas.DesignResponse])
def get_designs(db: Session = Depends(get_db)):
    return db.query(models.Design).options(joinedload(models.Design.category)).filter(models.Design.active == True).all()

@router.get("/designs/featured", response_model=List[schemas.DesignResponse])
def get_featured_designs(db: Session = Depends(get_db)):
    return db.query(models.Design).options(joinedload(models.Design.category)).filter(
        models.Design.active == True,
        models.Design.featured == True
    ).all()

@router.get("/designs/category/{category_id}", response_model=List[schemas.DesignResponse])
def get_designs_by_category(category_id: int, db: Session = Depends(get_db)):
    return db.query(models.Design).options(joinedload(models.Design.category)).filter(
        models.Design.categoryId == category_id,
        models.Design.active == True
    ).all()

@router.get("/designs/{id}", response_model=schemas.DesignResponse)
def get_design(id: int, db: Session = Depends(get_db)):
    design = db.query(models.Design).options(joinedload(models.Design.category)).filter(models.Design.id == id).first()
    if not design:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")
    return design
