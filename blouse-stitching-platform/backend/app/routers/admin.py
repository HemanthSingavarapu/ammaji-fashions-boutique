from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload, selectinload

from app.database import get_db
from app import models, schemas
from app.security import get_current_admin
from app.email_service import send_order_status_update

router = APIRouter(prefix="/api/admin", tags=["admin"])

class CategoryRef(BaseModel):
    id: Optional[int] = None

class AdminDesignCreate(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    active: bool = True
    featured: bool = False
    categoryId: Optional[int] = None
    category: Optional[CategoryRef] = None

class AdminDesignUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    active: Optional[bool] = None
    featured: Optional[bool] = None
    categoryId: Optional[int] = None
    category: Optional[CategoryRef] = None

def get_order_query(db: Session):
    return db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.design).joinedload(models.Design.category),
        joinedload(models.Order.measurement),
        selectinload(models.Order.statusHistory)
    )

@router.get("/orders", response_model=List[schemas.OrderResponse])
def get_all_orders(
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return get_order_query(db).order_by(models.Order.createdAt.desc()).all()

@router.get("/orders/{id}", response_model=schemas.OrderResponse)
def get_order_by_id(
    id: int,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = get_order_query(db).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order

@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(models.User).order_by(models.User.createdAt.desc()).all()

@router.put("/orders/{id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    id: int,
    status: str = Query(...),
    comment: str = Query(...),
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.orderStatus = status
    db.commit()

    history = models.OrderStatusHistory(
        orderId=order.id,
        status=status,
        comment=comment,
        updatedBy="Admin"
    )
    db.add(history)
    db.commit()

    # Trigger email notification
    if order.user and order.user.email:
        send_order_status_update(
            to_email=order.user.email,
            customer_name=order.user.name or "Customer",
            order_number=order.orderNumber,
            new_status=status,
            comment=comment
        )

    return get_order_query(db).filter(models.Order.id == id).first()

@router.put("/orders/{id}/verify-payment", response_model=schemas.OrderResponse)
def verify_payment(
    id: int,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.paymentStatus = "SUCCESS"
    order.orderStatus = "PAYMENT_CONFIRMED"

    payment = db.query(models.Payment).filter(models.Payment.orderId == order.id).first()
    if payment:
        payment.status = "SUCCESS"
        payment.verifiedBy = admin.email
        payment.verifiedAt = datetime.utcnow()
        payment.rejectionReason = None

    history = models.OrderStatusHistory(
        orderId=order.id,
        status="PAYMENT_CONFIRMED",
        comment=f"Payment verified independently by Admin ({admin.email}) against bank statement. Order slot confirmed for workshop.",
        updatedBy="Admin"
    )
    db.add(history)
    db.commit()

    if order.user and order.user.email:
        send_order_status_update(
            to_email=order.user.email,
            customer_name=order.user.name or "Customer",
            order_number=order.orderNumber,
            new_status="PAYMENT_CONFIRMED",
            comment="Your payment has been successfully verified! Atelier stitching has been scheduled."
        )

    return get_order_query(db).filter(models.Order.id == id).first()

@router.put("/orders/{id}/reject-payment", response_model=schemas.OrderResponse)
def reject_payment(
    id: int,
    reason: str = Query("UTR reference not found in bank statement"),
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.paymentStatus = "REJECTED"
    payment = db.query(models.Payment).filter(models.Payment.orderId == order.id).first()
    if payment:
        payment.status = "REJECTED"
        payment.rejectionReason = reason
        payment.verifiedBy = admin.email
        payment.verifiedAt = datetime.utcnow()

    history = models.OrderStatusHistory(
        orderId=order.id,
        status="ORDER_PLACED",
        comment=f"Payment UTR verification failed: {reason}. Please re-submit valid transaction reference.",
        updatedBy="Admin"
    )
    db.add(history)
    db.commit()

    if order.user and order.user.email:
        send_order_status_update(
            to_email=order.user.email,
            customer_name=order.user.name or "Customer",
            order_number=order.orderNumber,
            new_status="PAYMENT_REJECTED",
            comment=f"Payment verification failed: {reason}. Please check your UTR or contact us."
        )

    return get_order_query(db).filter(models.Order.id == id).first()

# --- Categories Management ---
@router.post("/categories", response_model=schemas.CategoryResponse)
def create_category(
    category: schemas.CategoryCreate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    new_cat = models.Category(
        name=category.name,
        description=category.description,
        image=category.image,
        active=category.active
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

@router.put("/categories/{id}", response_model=schemas.CategoryResponse)
def update_category(
    id: int,
    category_details: schemas.CategoryUpdate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(models.Category).filter(models.Category.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    if category_details.name is not None:
        cat.name = category_details.name
    if category_details.description is not None:
        cat.description = category_details.description
    if category_details.image is not None:
        cat.image = category_details.image
    if category_details.active is not None:
        cat.active = category_details.active

    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/categories/{id}")
def delete_category(
    id: int,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = db.query(models.Category).filter(models.Category.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(cat)
    db.commit()
    return Response(status_code=status.HTTP_200_OK)

# --- Designs Management ---
@router.post("/designs", response_model=schemas.DesignResponse)
def create_design(
    design: AdminDesignCreate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat_id = design.category.id if (design.category and design.category.id) else design.categoryId
    new_design = models.Design(
        name=design.name,
        price=design.price,
        description=design.description,
        imageUrl=design.imageUrl,
        categoryId=cat_id,
        active=design.active,
        featured=design.featured
    )
    db.add(new_design)
    db.commit()
    db.refresh(new_design)
    return db.query(models.Design).options(joinedload(models.Design.category)).filter(models.Design.id == new_design.id).first()

@router.put("/designs/{id}", response_model=schemas.DesignResponse)
def update_design(
    id: int,
    design_details: AdminDesignUpdate,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    design = db.query(models.Design).filter(models.Design.id == id).first()
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")

    if design_details.name is not None:
        design.name = design_details.name
    if design_details.price is not None:
        design.price = design_details.price
    if design_details.description is not None:
        design.description = design_details.description
    if design_details.imageUrl is not None:
        design.imageUrl = design_details.imageUrl
    if design_details.active is not None:
        design.active = design_details.active
    if design_details.featured is not None:
        design.featured = design_details.featured

    cat_id = design_details.category.id if (design_details.category and design_details.category.id) else design_details.categoryId
    if cat_id is not None:
        design.categoryId = cat_id

    db.commit()
    return db.query(models.Design).options(joinedload(models.Design.category)).filter(models.Design.id == id).first()

@router.delete("/designs/{id}")
def delete_design(
    id: int,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    design = db.query(models.Design).filter(models.Design.id == id).first()
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")

    db.delete(design)
    db.commit()
    return Response(status_code=status.HTTP_200_OK)
