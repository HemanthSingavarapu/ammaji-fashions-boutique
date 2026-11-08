from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    mobile = Column(String(50), nullable=True, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="USER") # "USER" or "ADMIN"
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    createdAt = Column("created_at", DateTime, default=datetime.utcnow)
    updatedAt = Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    userMeasurement = relationship("UserMeasurement", back_populates="user", uselist=False)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String(500), nullable=True)
    active = Column(Boolean, default=True)
    createdAt = Column("created_at", DateTime, default=datetime.utcnow)

    designs = relationship("Design", back_populates="category")

class Design(Base):
    __tablename__ = "designs"

    id = Column(Integer, primary_key=True, index=True)
    categoryId = Column("category_id", Integer, ForeignKey("categories.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    imageUrl = Column("image_url", Text, nullable=True)
    featured = Column(Boolean, default=False)
    active = Column(Boolean, default=True)
    createdAt = Column("created_at", DateTime, default=datetime.utcnow)
    updatedAt = Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="designs")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    orderNumber = Column("order_number", String(100), unique=True, index=True, nullable=False)
    userId = Column("user_id", Integer, ForeignKey("users.id"), nullable=False)
    designId = Column("design_id", Integer, ForeignKey("designs.id"), nullable=True)
    customDesignName = Column("custom_design_name", String(255), nullable=True)
    customDesignDetails = Column("custom_design_details", Text, nullable=True)
    amount = Column(Float, nullable=False, default=0.0)
    paidAmount = Column("paid_amount", Float, nullable=True)
    balanceAmount = Column("balance_amount", Float, nullable=True)
    courierOption = Column("courier_option", String(50), nullable=True) # "SELF" or "BOUTIQUE"
    paymentType = Column("payment_type", String(50), nullable=True) # "FULL" or "ADVANCE_20"
    transactionNumber = Column("transaction_number", String(100), nullable=True)
    paymentStatus = Column("payment_status", String(50), default="PENDING")
    orderStatus = Column("order_status", String(50), default="ORDER_PLACED")
    deliveryAddress = Column("delivery_address", Text, nullable=True)
    specialInstructions = Column("special_instructions", Text, nullable=True)
    refundStatus = Column("refund_status", String(50), nullable=True)
    refundInitiatedAt = Column("refund_initiated_at", DateTime, nullable=True)
    createdAt = Column("created_at", DateTime, default=datetime.utcnow)
    updatedAt = Column("updated_at", DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    design = relationship("Design")
    measurement = relationship("Measurement", back_populates="order", uselist=False, cascade="all, delete-orphan")
    statusHistory = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan", order_by="desc(OrderStatusHistory.createdAt)")

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    orderId = Column("order_id", Integer, ForeignKey("orders.id"), nullable=False)
    bust = Column(Float, nullable=True)
    waist = Column(Float, nullable=True)
    shoulder = Column(Float, nullable=True)
    blouseLength = Column("blouse_length", Float, nullable=True)
    sleeveLength = Column("sleeve_length", Float, nullable=True)
    armhole = Column(Float, nullable=True)
    frontNeck = Column("front_neck", Float, nullable=True)
    backNeck = Column("back_neck", Float, nullable=True)
    otherMeasurements = Column("other_measurements", Text, nullable=True)

    order = relationship("Order", back_populates="measurement")

class UserMeasurement(Base):
    __tablename__ = "user_measurements"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column("user_id", Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bust = Column(Float, nullable=True)
    waist = Column(Float, nullable=True)
    shoulder = Column(Float, nullable=True)
    blouseLength = Column("blouse_length", Float, nullable=True)
    sleeveLength = Column("sleeve_length", Float, nullable=True)
    armhole = Column(Float, nullable=True)
    frontNeck = Column("front_neck", Float, nullable=True)
    backNeck = Column("back_neck", Float, nullable=True)
    otherMeasurements = Column("other_measurements", Text, nullable=True)

    user = relationship("User", back_populates="userMeasurement")

class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column("user_id", Integer, ForeignKey("users.id"), nullable=False)
    designId = Column("design_id", Integer, ForeignKey("designs.id"), nullable=False)

    user = relationship("User")
    design = relationship("Design")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    orderId = Column("order_id", Integer, ForeignKey("orders.id"), nullable=False)
    paymentReference = Column("payment_reference", String(100), nullable=False)
    amount = Column(Float, nullable=False)
    paymentMethod = Column("payment_method", String(100), nullable=False)
    status = Column(String(50), default="PENDING") # PENDING, UNDER_REVIEW, SUCCESS, FAILED, REJECTED
    verifiedBy = Column("verified_by", String(100), nullable=True)
    verifiedAt = Column("verified_at", DateTime, nullable=True)
    rejectionReason = Column("rejection_reason", Text, nullable=True)
    createdAt = Column("created_at", DateTime, default=datetime.utcnow)

    order = relationship("Order")

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    orderId = Column("order_id", Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(String(50), nullable=False)
    comment = Column(Text, nullable=True)
    updatedBy = Column("updated_by", String(100), nullable=True)
    createdAt = Column("created_at", DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="statusHistory")
