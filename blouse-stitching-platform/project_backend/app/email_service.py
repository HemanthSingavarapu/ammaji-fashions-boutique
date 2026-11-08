import smtplib
import urllib.parse
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def clean_phone_number(phone: str) -> str:
    if not phone:
        return ""
    digits = "".join(ch for ch in phone if ch.isdigit())
    if len(digits) == 10:
        return "91" + digits
    return digits

def generate_whatsapp_status_url(customer_phone: str, customer_name: str, order_number: str, new_status: str, comment: str = None) -> str:
    pretty_status = new_status.replace("_", " ").title()
    tracking_url = f"http://localhost:5180/track?orderId={order_number}"
    
    msg = (
        f"Hello {customer_name}! ✨\n\n"
        f"Your bespoke blouse order *#{order_number}* has an update!\n"
        f"🧵 *Status:* {pretty_status}\n"
    )
    if comment and comment.strip():
        msg += f"📝 *Note from Master Tailor:* {comment.strip()}\n"
    msg += f"\n👉 *Track live progress:* {tracking_url}\n\nThank you for choosing Ammaji Fashions!"
    
    phone = clean_phone_number(customer_phone)
    encoded = urllib.parse.quote(msg)
    return f"https://wa.me/{phone}?text={encoded}"

def generate_boutique_whatsapp_url(order_number: str, topic: str = "Order Inquiry") -> str:
    msg = f"Hello Ammaji Fashions, I am inquiring regarding my stitching order #{order_number}."
    encoded = urllib.parse.quote(msg)
    return f"https://wa.me/{settings.BOUTIQUE_PHONE}?text={encoded}"

def send_order_status_update(to_email: str, customer_name: str, order_number: str, new_status: str, comment: str = None):
    pretty_status = new_status.replace("_", " ").title()
    subject = f"Update on your Blouse Order #{order_number}: {pretty_status}"
    
    body = (
        f"Hello {customer_name},\n\n"
        f"The status of your blouse order ({order_number}) has been updated to: {pretty_status}\n\n"
    )
    if comment and comment.strip():
        body += f"Note from our team: {comment.strip()}\n\n"
    body += (
        f"You can track your order live anytime at:\n"
        f"http://localhost:5180/track?orderId={order_number}\n\n"
        f"Thank you for shopping with us!\n"
        f"- The Ammaji Fashions & Boutique Team"
    )

    # If SMTP is configured, send real email via Gmail / SMTP provider
    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
            print(f"✓ Sent real email update to {to_email} for order #{order_number}")
            return
        except Exception as e:
            print(f"Warning: Failed to send SMTP email: {e}")

    # Fallback log
    print(f"[Email Notification Log] To: {to_email} | Subject: {subject}\n{body}")
