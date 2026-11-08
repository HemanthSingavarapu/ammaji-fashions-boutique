from datetime import datetime
from typing import Optional, List, Any, Union
from pydantic import BaseModel, ConfigDict, field_validator

# --- User Schemas ---
class UserBase(BaseModel):
    name: Optional[str] = None
    email: str
    mobile: Optional[str] = None
    role: str = "USER"
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class UserResponse(UserBase):
    id: int
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AuthRequest(BaseModel):
    email: Optional[str] = None
    password: str

class RegisterRequest(BaseModel):
    name: Optional[str] = None
    email: str
    mobile: Optional[str] = None
    password: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class ForgotPasswordVerifyRequest(BaseModel):
    email: str
    mobile: str

class ResetPasswordRequest(BaseModel):
    resetToken: str
    newPassword: str

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    createdAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- Design Schemas ---
class DesignBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    imageUrl: Optional[str] = None
    featured: bool = False
    active: bool = True
    categoryId: Optional[int] = None

class DesignCreate(DesignBase):
    pass

class DesignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    imageUrl: Optional[str] = None
    featured: Optional[bool] = None
    active: Optional[bool] = None
    categoryId: Optional[int] = None
    category: Optional[CategoryResponse] = None

class DesignResponse(DesignBase):
    id: int
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)

# --- Measurement Schemas ---
class MeasurementSchema(BaseModel):
    id: Optional[int] = None
    orderId: Optional[int] = None
    bust: Optional[float] = None
    waist: Optional[float] = None
    shoulder: Optional[float] = None
    blouseLength: Optional[float] = None
    sleeveLength: Optional[float] = None
    armhole: Optional[float] = None
    frontNeck: Optional[float] = None
    backNeck: Optional[float] = None
    otherMeasurements: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("bust", "waist", "shoulder", "blouseLength", "sleeveLength", "armhole", "frontNeck", "backNeck", mode="before")
    @classmethod
    def parse_float_or_empty(cls, v: Any) -> Optional[float]:
        if v is None or v == "":
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

class UserMeasurementSchema(BaseModel):
    id: Optional[int] = None
    userId: Optional[int] = None
    bust: Optional[float] = None
    waist: Optional[float] = None
    shoulder: Optional[float] = None
    blouseLength: Optional[float] = None
    sleeveLength: Optional[float] = None
    armhole: Optional[float] = None
    frontNeck: Optional[float] = None
    backNeck: Optional[float] = None
    otherMeasurements: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("bust", "waist", "shoulder", "blouseLength", "sleeveLength", "armhole", "frontNeck", "backNeck", mode="before")
    @classmethod
    def parse_user_float_or_empty(cls, v: Any) -> Optional[float]:
        if v is None or v == "":
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

# --- Order & History Schemas ---
class OrderStatusHistoryResponse(BaseModel):
    id: int
    orderId: Optional[int] = None
    status: str
    comment: Optional[str] = None
    updatedBy: Optional[str] = None
    createdAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class OrderRequest(BaseModel):
    designId: Optional[Union[int, str]] = None
    customDesignName: Optional[str] = None
    customDesignDetails: Optional[str] = None
    deliveryAddress: Optional[str] = None
    specialInstructions: Optional[str] = None
    measurement: Optional[MeasurementSchema] = None
    courierOption: Optional[str] = None
    amount: Optional[float] = None
    paymentType: Optional[str] = None
    paidAmount: Optional[float] = None
    balanceAmount: Optional[float] = None
    transactionNumber: Optional[str] = None

    @field_validator("designId", mode="before")
    @classmethod
    def parse_design_id(cls, v: Any) -> Optional[int]:
        if v is None or v == "" or v == "custom":
            return None
        try:
            return int(v)
        except (ValueError, TypeError):
            return None

    @field_validator("amount", "paidAmount", "balanceAmount", mode="before")
    @classmethod
    def parse_amounts(cls, v: Any) -> Optional[float]:
        if v is None or v == "":
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

class OrderResponse(BaseModel):
    id: int
    orderNumber: str
    userId: int
    designId: Optional[int] = None
    customDesignName: Optional[str] = None
    customDesignDetails: Optional[str] = None
    amount: float
    paidAmount: Optional[float] = None
    balanceAmount: Optional[float] = None
    courierOption: Optional[str] = None
    paymentType: Optional[str] = None
    transactionNumber: Optional[str] = None
    paymentStatus: str
    orderStatus: str
    deliveryAddress: Optional[str] = None
    specialInstructions: Optional[str] = None
    refundStatus: Optional[str] = None
    refundInitiatedAt: Optional[datetime] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    user: Optional[UserResponse] = None
    design: Optional[DesignResponse] = None
    measurement: Optional[MeasurementSchema] = None
    statusHistory: Optional[List[OrderStatusHistoryResponse]] = []

    model_config = ConfigDict(from_attributes=True)

# --- Payment Schemas ---
class UtrSubmitRequest(BaseModel):
    orderId: int
    utrNumber: str
    paymentType: Optional[str] = "ADVANCE_20"

class PaymentVerificationRequest(BaseModel):
    verified: bool
    rejectionReason: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    orderId: int
    paymentReference: str
    amount: float
    paymentMethod: str
    status: str
    verifiedBy: Optional[str] = None
    verifiedAt: Optional[datetime] = None
    rejectionReason: Optional[str] = None
    createdAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
