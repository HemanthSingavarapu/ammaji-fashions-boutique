from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session, joinedload, selectinload

from app.database import get_db
from app import models, schemas
from app.security import get_current_user, get_optional_current_user
from app.pdf_service import generate_invoice_pdf, generate_job_card_pdf

router = APIRouter(prefix="/api/orders", tags=["orders"])

def get_order_query(db: Session):
    return db.query(models.Order).options(
        joinedload(models.Order.user),
        joinedload(models.Order.design).joinedload(models.Design.category),
        joinedload(models.Order.measurement),
        selectinload(models.Order.statusHistory)
    )

@router.post("", response_model=schemas.OrderResponse)
def create_order(
    request: schemas.OrderRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    date_str = datetime.now().strftime("%Y%m%d")
    count = db.query(models.Order).count() + 1
    order_number = f"BL{date_str}{count:04d}"

    base_price = 0.0
    design = None
    if request.designId:
        design = db.query(models.Design).filter(models.Design.id == request.designId).first()
        if not design:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Design not found")
        base_price = design.price

    # Server-side tamper protection: total_amount cannot be less than catalog base price
    if request.amount is not None and request.amount >= base_price:
        total_amount = float(request.amount)
    else:
        total_amount = float(base_price)

    # Strict server-side breakdown calculation
    effective_payment_type = request.paymentType if request.paymentType in ["ADVANCE_20", "FULL"] else "ADVANCE_20"
    if effective_payment_type == "ADVANCE_20":
        expected_paid = round(total_amount * 0.20)
        expected_balance = total_amount - expected_paid
    else:
        expected_paid = total_amount
        expected_balance = 0.0

    new_order = models.Order(
        orderNumber=order_number,
        userId=current_user.id,
        designId=request.designId,
        customDesignName=request.customDesignName,
        customDesignDetails=request.customDesignDetails,
        amount=total_amount,
        paymentType=effective_payment_type,
        paidAmount=expected_paid,
        balanceAmount=expected_balance,
        transactionNumber=None, # Cannot be self-asserted as completed at order creation
        courierOption=request.courierOption,
        paymentStatus="PENDING",
        orderStatus="ORDER_PLACED",
        deliveryAddress=request.deliveryAddress,
        specialInstructions=request.specialInstructions
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Save measurements if provided
    if request.measurement:
        measurement = models.Measurement(
            orderId=new_order.id,
            bust=request.measurement.bust,
            waist=request.measurement.waist,
            shoulder=request.measurement.shoulder,
            blouseLength=request.measurement.blouseLength,
            sleeveLength=request.measurement.sleeveLength,
            armhole=request.measurement.armhole,
            frontNeck=request.measurement.frontNeck,
            backNeck=request.measurement.backNeck,
            otherMeasurements=request.measurement.otherMeasurements
        )
        db.add(measurement)

    # Add initial history
    history = models.OrderStatusHistory(
        orderId=new_order.id,
        status="ORDER_PLACED",
        comment="Order created successfully.",
        updatedBy=current_user.name or "Customer"
    )
    db.add(history)
    db.commit()

    return get_order_query(db).filter(models.Order.id == new_order.id).first()

@router.get("/my-orders", response_model=List[schemas.OrderResponse])
def get_my_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = get_order_query(db).filter(models.Order.userId == current_user.id).order_by(models.Order.createdAt.desc()).all()
    return orders

@router.get("/track/{order_number}", response_model=schemas.OrderResponse)
def track_order(order_number: str, db: Session = Depends(get_db)):
    order = get_order_query(db).filter(models.Order.orderNumber == order_number).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order

@router.get("/{id}", response_model=schemas.OrderResponse)
def get_order(
    id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = get_order_query(db).filter(
        models.Order.id == id,
        models.Order.userId == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order

@router.delete("/{id}")
def delete_order(
    id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(
        models.Order.id == id,
        models.Order.userId == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.paymentStatus == "PENDING" or order.orderStatus == "CANCELLED":
        db.delete(order)
        db.commit()
        return Response(status_code=status.HTTP_200_OK)

    return PlainTextResponse("Cannot delete confirmed order", status_code=status.HTTP_400_BAD_REQUEST)

@router.post("/{id}/cancel", response_model=schemas.OrderResponse)
def cancel_order(
    id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(
        models.Order.id == id,
        models.Order.userId == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.orderStatus in ["ORDER_PLACED", "PAYMENT_CONFIRMED"]:
        order.orderStatus = "CANCELLED"
        had_payment = (order.paymentStatus == "SUCCESS" and (order.paidAmount is None or order.paidAmount > 0))

        refund_amt = order.paidAmount
        if had_payment:
            if refund_amt is None:
                if order.paymentType == "ADVANCE_20":
                    refund_amt = round(order.amount * 0.20)
                else:
                    refund_amt = order.amount
                order.paidAmount = refund_amt
            order.refundStatus = "REFUND_PROCESSING"
            order.refundInitiatedAt = datetime.utcnow()
        else:
            order.refundStatus = None
            order.paidAmount = 0.0

        db.commit()

        comment = "Order cancelled by customer."
        if had_payment:
            comment += f" Refund of ₹{refund_amt if refund_amt is not None else 0} initiated (Expected within 2 business days). Txn: {order.transactionNumber or 'N/A'}"

        history = models.OrderStatusHistory(
            orderId=order.id,
            status="CANCELLED",
            comment=comment,
            updatedBy=current_user.name or "Customer"
        )
        db.add(history)
        db.commit()

        return get_order_query(db).filter(models.Order.id == order.id).first()
    else:
        return PlainTextResponse("Order cannot be cancelled at this stage.", status_code=status.HTTP_400_BAD_REQUEST)

@router.get("/{id}/invoice")
def download_invoice(id: int, db: Session = Depends(get_db)):
    order = get_order_query(db).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    pdf_bytes = generate_invoice_pdf(order)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Invoice_{order.orderNumber}.pdf"
        }
    )

@router.get("/{id}/job-card")
def download_job_card(id: int, db: Session = Depends(get_db)):
    order = get_order_query(db).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    pdf_bytes = generate_job_card_pdf(order)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=JobCard_{order.orderNumber}.pdf"
        }
    )

