from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response, BackgroundTasks
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
    try:
        from app.persistent_store import sync_persistent_users
        sync_persistent_users(db)
    except Exception:
        pass
    return db.query(models.User).order_by(models.User.createdAt.desc()).all()

@router.delete("/users/{id}")
def delete_user(
    id: int,
    admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Admin cannot delete their own account")
    if user.role == "ADMIN":
        raise HTTPException(status_code=400, detail="Cannot delete an admin account")

    user_email = user.email
    user_mobile = user.mobile

    # 1. Clean up user's active device sessions
    db.query(models.UserSession).filter(models.UserSession.userId == user.id).delete()

    # 2. Clean up user's wishlist items
    db.query(models.WishlistItem).filter(models.WishlistItem.userId == user.id).delete()

    # 3. Clean up user measurements
    db.query(models.UserMeasurement).filter(models.UserMeasurement.userId == user.id).delete()

    # 4. Clean up user orders and associated records
    user_orders = db.query(models.Order).filter(models.Order.userId == user.id).all()
    for o in user_orders:
        db.query(models.Payment).filter(models.Payment.orderId == o.id).delete()
        db.query(models.OrderStatusHistory).filter(models.OrderStatusHistory.orderId == o.id).delete()
        db.query(models.Measurement).filter(models.Measurement.orderId == o.id).delete()
        db.delete(o)

    # 5. Delete user from the database
    db.delete(user)
    db.commit()

    # 6. Remove user from the persistent registry so they do not reappear on restart/deploy
    try:
        from app.persistent_store import remove_user_from_registry
        remove_user_from_registry(user_email, user_mobile)
    except Exception as e:
        print(f"Persistent registry removal note: {e}")

    return {"message": f"User {user_email} successfully and permanently deleted from database"}

@router.put("/orders/{id}/status", response_model=schemas.OrderResponse)
def update_order_status(
    id: int,
    status: str = Query(...),
    comment: str = Query(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
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

    # Trigger email notification asynchronously without blocking response
    if order.user and order.user.email:
        background_tasks.add_task(
            send_order_status_update,
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
    background_tasks: BackgroundTasks = BackgroundTasks(),
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
        background_tasks.add_task(
            send_order_status_update,
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
    background_tasks: BackgroundTasks = BackgroundTasks(),
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
        background_tasks.add_task(
            send_order_status_update,
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

    # Detach linked designs before deleting category to avoid foreign key errors
    db.query(models.Design).filter(models.Design.categoryId == id).update({"categoryId": None})
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
