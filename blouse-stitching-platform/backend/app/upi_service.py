import io
import base64
import urllib.parse
import qrcode
from app.config import settings

def generate_upi_payment_info(amount: float, order_number: str) -> dict:
    note = f"Order {order_number}"
    encoded_payee = urllib.parse.quote(settings.UPI_PAYEE_NAME)
    encoded_note = urllib.parse.quote(note)
    
    # NPCI standard UPI URI format
    upi_str = f"upi://pay?pa={settings.UPI_VPA}&pn={encoded_payee}&am={amount:.2f}&tn={encoded_note}&cu=INR"

    # Generate high resolution QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(upi_str)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1a1a1a", back_color="#ffffff")

    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    data_uri = f"data:image/png;base64,{img_b64}"

    return {
        "upiString": upi_str,
        "qrCodeDataUrl": data_uri,
        "vpa": settings.UPI_VPA,
        "payeeName": settings.UPI_PAYEE_NAME,
        "amount": amount,
        "orderNumber": order_number,
        "bankDetails": None
    }
