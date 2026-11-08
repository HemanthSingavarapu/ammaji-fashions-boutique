import os

class Settings:
    PROJECT_NAME: str = "Blouse Stitching Platform API"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "94a08da1fecbb6e8b46990538c7b50b2b8c9d0d3c051268b355883713f01b18361b7829704e6c1df7c6b5419811f5e8f4989679f2913e61897c8cf9fc13c3b52")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./blouse.db")
    PORT: int = int(os.getenv("PORT", "8080"))

    # --- Feature 2: Bank & UPI Payment Details (Update these anytime!) ---
    UPI_VPA: str = os.getenv("UPI_VPA", "ammajifashions@upi")
    UPI_PAYEE_NAME: str = os.getenv("UPI_PAYEE_NAME", "Ammaji Fashions")
    BANK_NAME: str = os.getenv("BANK_NAME", "Federal Bank")
    BANK_ACCOUNT_NO: str = os.getenv("BANK_ACCOUNT_NO", "77770113307348")
    BANK_IFSC: str = os.getenv("BANK_IFSC", "FDRL0007777")
    BANK_BRANCH: str = os.getenv("BANK_BRANCH", "Mumbai Main Branch")

    # --- Feature 5: WhatsApp & Email Notifications ---
    BOUTIQUE_PHONE: str = os.getenv("BOUTIQUE_PHONE", "918341085629") # WhatsApp number for boutique
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "")

settings = Settings()
