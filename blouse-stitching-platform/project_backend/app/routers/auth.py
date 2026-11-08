from fastapi import APIRouter, Depends, status, Response
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.security import verify_password, get_password_hash, create_access_token, create_password_reset_token, verify_password_reset_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
def login(request: schemas.AuthRequest, db: Session = Depends(get_db)):
    identifier = request.email.strip() if request.email else ""
    
    # Search by email (case-insensitive) or mobile
    user = db.query(models.User).filter(
        (func.lower(models.User.email) == identifier.lower()) |
        (models.User.mobile == identifier)
    ).first()

    if not user:
        return PlainTextResponse("Invalid user or user details not found. Please register.", status_code=status.HTTP_401_UNAUTHORIZED)

    if not verify_password(request.password, user.password):
        return PlainTextResponse("Incorrect password. Please check your password.", status_code=status.HTTP_401_UNAUTHORIZED)

    token = create_access_token(data={"sub": user.email, "role": user.role})
    
    user_data = schemas.UserResponse.model_validate(user)
    return {"token": token, "user": user_data}

@router.post("/register")
def register(request: schemas.RegisterRequest, db: Session = Depends(get_db)):
    email = request.email.strip().lower() if request.email else ""
    mobile = request.mobile.strip() if request.mobile else ""

    if db.query(models.User).filter(func.lower(models.User.email) == email).first():
        return PlainTextResponse("User already exists with this email. Please login.", status_code=status.HTTP_400_BAD_REQUEST)

    if mobile and db.query(models.User).filter(models.User.mobile == mobile).first():
        return PlainTextResponse("User already exists with this mobile number. Please login.", status_code=status.HTTP_400_BAD_REQUEST)

    new_user = models.User(
        name=request.name.strip() if request.name else "",
        email=email,
        mobile=mobile,
        password=get_password_hash(request.password),
        role="USER",
        address=request.address,
        city=request.city,
        state=request.state,
        pincode=request.pincode
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return PlainTextResponse("User registered successfully", status_code=status.HTTP_200_OK)

@router.post("/setup-admin")
def setup_admin(db: Session = Depends(get_db)):
    admin = db.query(models.User).filter(models.User.email == "admin@blouse.com").first()
    if admin:
        return PlainTextResponse("Admin already exists", status_code=status.HTTP_200_OK)

    admin = models.User(
        name="Admin",
        email="admin@blouse.com",
        password=get_password_hash("admin123"),
        role="ADMIN"
    )
    db.add(admin)
    db.commit()
    return PlainTextResponse("Admin created", status_code=status.HTTP_200_OK)

@router.post("/forgot-password/verify")
def verify_forgot_password(request: schemas.ForgotPasswordVerifyRequest, db: Session = Depends(get_db)):
    """
    100% Free & Unlimited Password Reset Verification:
    Verifies user's identity by confirming registered email and registered mobile number.
    Zero SMS API fees, zero third-party lock-in, unlimited usage.
    """
    clean_email = request.email.strip().lower()
    clean_mobile = request.mobile.strip()

    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user:
        return PlainTextResponse("No account found matching this email address. Please check your email or register.", status_code=status.HTTP_404_NOT_FOUND)

    # Check mobile number match
    user_mobile = (user.mobile or "").strip()
    if user_mobile != clean_mobile:
        return PlainTextResponse("Mobile number does not match our records for this account. Please verify.", status_code=status.HTTP_400_BAD_REQUEST)

    # Generate secure reset token
    reset_token = create_password_reset_token(user.email)
    return {
        "success": True,
        "resetToken": reset_token,
        "userName": user.name or "Valued Customer",
        "message": "Identity verified successfully. You may now enter your new password."
    }

@router.post("/reset-password")
def reset_password(request: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Sets the new password using the verified reset token.
    """
    if len(request.newPassword) < 6:
        return PlainTextResponse("New password must be at least 6 characters long.", status_code=status.HTTP_400_BAD_REQUEST)

    email = verify_password_reset_token(request.resetToken)
    if not email:
        return PlainTextResponse("Password reset session has expired or is invalid. Please verify your details again.", status_code=status.HTTP_400_BAD_REQUEST)

    user = db.query(models.User).filter(func.lower(models.User.email) == email.lower()).first()
    if not user:
        return PlainTextResponse("User not found.", status_code=status.HTTP_404_NOT_FOUND)

    user.password = get_password_hash(request.newPassword)
    db.commit()

    return PlainTextResponse("Password has been reset successfully! Please login with your new password.", status_code=status.HTTP_200_OK)

