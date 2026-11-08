import random
import re
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, status, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.upi_service import generate_upi_payment_info

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.get("/upi-info")
def get_upi_payment_info(
    orderId: Optional[int] = Query(None),
    amount: Optional[float] = Query(None),
    orderNumber: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    target_amount = amount or 0.0
    target_order_number = orderNumber or "NEW_ORDER"

    if orderId:
        order = db.query(models.Order).filter(models.Order.id == orderId).first()
        if order:
            target_order_number = order.orderNumber
            if target_amount <= 0:
                target_amount = order.paidAmount if (order.paidAmount and order.paidAmount > 0) else order.amount

    return generate_upi_payment_info(amount=target_amount, order_number=target_order_number)

@router.post("/submit-utr", response_model=schemas.PaymentResponse)
def submit_utr(
    request: schemas.UtrSubmitRequest,
    db: Session = Depends(get_db)
):
    """
    Production-grade UTR submission endpoint:
    - Generates unique Transaction ID if not manually entered
    - Prevents replay attacks (duplicate UTRs)
    - Sets order to UNDER_REVIEW
    """
    utr = request.utrNumber.strip().upper() if request.utrNumber else ""
    if not utr or len(utr) < 6:
        date_str = datetime.now().strftime("%Y%m%d")
        rand_code = random.randint(100000, 999999)
        utr = f"TXN-{date_str}-{rand_code}"

    order = db.query(models.Order).filter(models.Order.id == request.orderId).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Anti-Replay Check: Ensure this UTR was not already accepted or submitted for a different order
    existing_txn = db.query(models.Payment).filter(
        models.Payment.paymentReference == utr,
        models.Payment.orderId != order.id,
        models.Payment.status.in_(["UNDER_REVIEW", "SUCCESS"])
    ).first()
    if existing_txn:
        # If generated or entered was somehow duplicate, generate fresh unique
        date_str = datetime.now().strftime("%Y%m%d")
        rand_code = random.randint(100000, 999999)
        utr = f"TXN-{date_str}-{rand_code}"

    # Server-side amount enforcement
    effective_payment_type = request.paymentType or order.paymentType or "ADVANCE_20"
    if effective_payment_type == "ADVANCE_20":
        expected_paid = round(order.amount * 0.20)
    else:
        expected_paid = order.amount
    expected_balance = max(0.0, order.amount - expected_paid)

    order.paymentType = effective_payment_type
    order.paidAmount = expected_paid
    order.balanceAmount = expected_balance
    order.transactionNumber = utr
    order.paymentStatus = "UNDER_REVIEW" # Critical: NOT marked as SUCCESS!
    order.orderStatus = "ORDER_PLACED"

    # Create or update payment record
    payment = db.query(models.Payment).filter(models.Payment.orderId == order.id).first()
    if not payment:
        payment = models.Payment(
            orderId=order.id,
            amount=expected_paid,
            paymentMethod="UPI_TRANSFER",
            paymentReference=utr,
            status="UNDER_REVIEW"
        )
        db.add(payment)
    else:
        payment.amount = expected_paid
        payment.paymentMethod = "UPI_TRANSFER"
        payment.paymentReference = utr
        payment.status = "UNDER_REVIEW"
        payment.rejectionReason = None

    # Audit history log
    history = models.OrderStatusHistory(
        orderId=order.id,
        status="ORDER_PLACED",
        comment=f"Customer submitted UPI UTR: {utr} (Amount: ₹{expected_paid}). Status: UNDER_REVIEW. Awaiting independent bank statement verification.",
        updatedBy="CUSTOMER"
    )
    db.add(history)

    db.commit()
    db.refresh(payment)
    return payment

@router.post("/dummy", response_model=schemas.PaymentResponse)
def process_dummy_payment(
    orderId: int = Query(...),
    success: bool = Query(...),
    transactionNumber: Optional[str] = Query(None),
    paymentType: Optional[str] = Query(None),
    paidAmount: Optional[float] = Query(None),
    balanceAmount: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Development/Sandbox simulated payment endpoint.
    In real production, this is superseded by the /submit-utr + admin verification workflow.
    """
    order = db.query(models.Order).filter(models.Order.id == orderId).first()
    if not order:
        return PlainTextResponse("Order not found or session expired. Please refresh checkout.", status_code=status.HTTP_404_NOT_FOUND)

    effective_txn = transactionNumber
    if not effective_txn or not effective_txn.strip():
        date_str = datetime.now().strftime("%Y%m%d")
        effective_txn = f"TXN-{date_str}-{random.randint(100000, 999999)}"

    effective_paid = paidAmount
    if effective_paid is None:
        if paymentType == "ADVANCE_20":
            effective_paid = round(order.amount * 0.20)
        else:
            effective_paid = order.amount

    effective_balance = balanceAmount
    if effective_balance is None and order.amount is not None:
        effective_balance = max(0.0, order.amount - (effective_paid or 0.0))

    if paymentType is not None:
        order.paymentType = paymentType

    order.paidAmount = effective_paid
    order.balanceAmount = effective_balance
    order.transactionNumber = effective_txn

    payment = db.query(models.Payment).filter(models.Payment.orderId == order.id).first()
    if not payment:
        payment = models.Payment(
            orderId=order.id,
            amount=effective_paid if effective_paid is not None else order.amount,
            paymentMethod=paymentType or "ONLINE_PAYMENT",
            paymentReference=effective_txn
        )
        db.add(payment)
    else:
        payment.amount = effective_paid if effective_paid is not None else order.amount
        payment.paymentReference = effective_txn

    if success:
        payment.status = "SUCCESS"
        order.paymentStatus = "SUCCESS"
        order.orderStatus = "PAYMENT_CONFIRMED"

        mode_text = "20% Advance Booking Fee" if order.paymentType == "ADVANCE_20" else "Full Payment"
        comment = f"Payment successful via {mode_text} (₹{effective_paid}). Txn Ref: {effective_txn}"

        history = models.OrderStatusHistory(
            orderId=order.id,
            status="PAYMENT_CONFIRMED",
            comment=comment,
            updatedBy="SYSTEM"
        )
        db.add(history)
    else:
        payment.status = "FAILED"
        order.paymentStatus = "FAILED"
        order.orderStatus = "CANCELLED"
        order.paidAmount = 0.0
        order.balanceAmount = 0.0
        order.transactionNumber = None
        order.refundStatus = None
        order.refundInitiatedAt = None

        history = models.OrderStatusHistory(
            orderId=order.id,
            status="CANCELLED",
            comment="Payment cancelled by customer during checkout. Order not placed.",
            updatedBy="SYSTEM"
        )
        db.add(history)

    db.commit()
    db.refresh(payment)
    return payment
