import io
import re
import base64
import urllib.parse
import qrcode
from app.config import settings

def generate_upi_payment_info(amount: float, order_number: str) -> dict:
    # Sanitize payee name: remove '&' and special symbols to prevent QR URL corruption in UPI scanner apps
    safe_payee = re.sub(r'[^a-zA-Z0-9 ]', ' ', settings.UPI_PAYEE_NAME)
    safe_payee = ' '.join(safe_payee.split()) # normalize whitespace
    encoded_payee = urllib.parse.quote(safe_payee)
    
    # Simple alphanumeric note for maximum scanner compatibility
    safe_note = re.sub(r'[^a-zA-Z0-9-]', '', f"Order-{order_number}")
    encoded_note = urllib.parse.quote(safe_note)
    
    # NPCI standard UPI URI format
    clean_vpa = settings.UPI_VPA.strip()
    upi_str = f"upi://pay?pa={clean_vpa}&pn={encoded_payee}&am={amount:.2f}&cu=INR&tn={encoded_note}"

    # Generate high resolution QR code with optimal error correction
    qr = qrcode.QRCode(
        version=None, # auto-select optimal version
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3,
    )
    qr.add_data(upi_str)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#111111", back_color="#ffffff")

    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    data_uri = f"data:image/png;base64,{img_b64}"

    return {
        "upiString": upi_str,
        "qrCodeDataUrl": data_uri,
        "vpa": clean_vpa,
        "payeeName": safe_payee,
        "amount": amount,
        "orderNumber": order_number,
        "bankDetails": None
    }
