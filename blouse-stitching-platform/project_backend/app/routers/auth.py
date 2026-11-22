from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, status, Response
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.security import (
    security_scheme,
    verify_password,
    get_password_hash,
    create_access_token,
    create_password_reset_token,
    verify_password_reset_token,
    get_current_user
)

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

    # Active session limit: maximum 2 active devices simultaneously
    if user.role != "ADMIN":
        # Clean up stale sessions older than 7 days
        cutoff = datetime.utcnow() - timedelta(days=7)
        db.query(models.UserSession).filter(
            models.UserSession.userId == user.id,
            models.UserSession.lastActive < cutoff
        ).delete()
        db.commit()

        # If user explicitly selected "Log out other devices", wipe all their existing sessions
        if request.force_logout:
            db.query(models.UserSession).filter(models.UserSession.userId == user.id).delete()
            db.commit()
        else:
            active_sessions = db.query(models.UserSession).filter(
                models.UserSession.userId == user.id
            ).order_by(models.UserSession.createdAt.asc()).all()

            if len(active_sessions) >= 2:
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={
                        "code": "SESSION_LIMIT_EXCEEDED",
                        "message": "Active session limit reached (maximum 2 devices). Please log out from other devices to continue.",
                        "activeDevices": [
                            {
                                "id": s.id,
                                "deviceInfo": s.deviceInfo or "Device",
                                "lastActive": s.lastActive.strftime("%d %b %Y, %I:%M %p") if s.lastActive else "Recently active"
                            }
                            for s in active_sessions
                        ]
                    }
                )

    token = create_access_token(data={"sub": user.email, "role": user.role})
    
    # Register this active device session
    new_session = models.UserSession(
        userId=user.id,
        token=token,
        deviceInfo=request.device_info or "Web Browser",
        createdAt=datetime.utcnow(),
        lastActive=datetime.utcnow()
    )
    db.add(new_session)
    db.commit()

    user_data = schemas.UserResponse.model_validate(user)
    return {"token": token, "user": user_data}

@router.post("/logout")
def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
):
    if credentials and credentials.credentials:
        token = credentials.credentials
        db.query(models.UserSession).filter(models.UserSession.token == token).delete()
        db.commit()
    return {"message": "Logged out successfully"}

@router.post("/logout-all")
def logout_all(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.UserSession).filter(models.UserSession.userId == current_user.id).delete()
    db.commit()
    return {"message": "All devices logged out successfully"}

@router.post("/logout-other-sessions")
def logout_other_sessions(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Terminates all sessions for this user EXCEPT the current device.
    """
    current_token = credentials.credentials if credentials else None
    if current_token:
        db.query(models.UserSession).filter(
            models.UserSession.userId == current_user.id,
            models.UserSession.token != current_token
        ).delete()
    else:
        db.query(models.UserSession).filter(
            models.UserSession.userId == current_user.id
        ).delete()
    db.commit()
    return {"message": "All other sessions logged out successfully"}

@router.get("/validate-session")
def validate_session(
    current_user: models.User = Depends(get_current_user)
):
    """
    Heartbeat and active session validator.
    Throws 401 if session token was invalidated or logged out by another device.
    """
    return {"valid": True, "user": schemas.UserResponse.model_validate(current_user)}

@router.get("/active-sessions")
def get_active_sessions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(models.UserSession).filter(
        models.UserSession.userId == current_user.id
    ).order_by(models.UserSession.lastActive.desc()).all()
    return [
        {
            "id": s.id,
            "deviceInfo": s.deviceInfo or "Unknown Device",
            "lastActive": s.lastActive.strftime("%d %b %Y, %I:%M %p") if s.lastActive else None,
            "createdAt": s.createdAt.strftime("%d %b %Y, %I:%M %p") if s.createdAt else None
        }
        for s in sessions
    ]

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

