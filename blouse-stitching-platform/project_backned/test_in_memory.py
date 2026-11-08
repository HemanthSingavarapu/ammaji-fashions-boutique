import sys
import os
import asyncio
import json

# Add parent directory to path
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, base_dir)

# Set temporary test database
test_db_path = os.path.join(base_dir, "test_temp.db")
if os.path.exists(test_db_path):
    os.remove(test_db_path)
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

from main import app, lifespan

async def asgi_request(app, method="GET", path="/", headers=None, data=None):
    body = b""
    raw_headers = []
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        raw_headers.append((b"content-type", b"application/json"))
    if headers:
        for k, v in headers.items():
            raw_headers.append((k.lower().encode("latin1"), v.encode("latin1")))

    url_path = path.split("?")[0]
    query_string = path.split("?")[1] if "?" in path else ""

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": method,
        "scheme": "http",
        "path": url_path,
        "raw_path": url_path.encode("ascii"),
        "query_string": query_string.encode("ascii"),
        "headers": raw_headers,
        "client": ("127.0.0.1", 12345),
        "server": ("testserver", 80),
    }

    response_headers = {}
    response_status = [200]
    response_body = []

    sent = False
    async def receive():
        nonlocal sent
        if not sent:
            sent = True
            return {"type": "http.request", "body": body, "more_body": False}
        return {"type": "http.disconnect"}

    async def send(message):
        if message["type"] == "http.response.start":
            response_status[0] = message["status"]
            for k, v in message.get("headers", []):
                response_headers[k.decode("latin1")] = v.decode("latin1")
        elif message["type"] == "http.response.body":
            response_body.append(message.get("body", b""))

    await app(scope, receive, send)
    full_body = b"".join(response_body).decode("utf-8")
    content_type = response_headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            return response_status[0], json.loads(full_body)
        except Exception:
            pass
    return response_status[0], full_body

async def main():
    async with lifespan(app):
        print("--- 1. Testing Root Endpoint ---")
        status, body = await asgi_request(app, "GET", "/")
        assert status == 200, f"Expected 200, got {status}: {body}"
        assert "Custom Blouse Designing" in body
        print("✓ Root endpoint working:", body)

        print("\n--- 2. Testing Categories & Designs Catalogue ---")
        status, categories = await asgi_request(app, "GET", "/api/categories")
        assert status == 200
        assert len(categories) >= 3, f"Expected >=3 categories, got {len(categories)}"
        print(f"✓ Categories retrieved ({len(categories)} categories found)")

        status, designs = await asgi_request(app, "GET", "/api/designs")
        assert status == 200
        assert len(designs) >= 3, f"Expected >=3 designs, got {len(designs)}"
        design_id = designs[0]["id"]
        print(f"✓ Designs retrieved ({len(designs)} designs found)")

        print("\n--- 3. Testing Admin Login ---")
        status, admin_auth = await asgi_request(app, "POST", "/api/auth/login", data={"email": "admin@blouse.com", "password": "admin123"})
        assert status == 200, f"Admin login failed: {admin_auth}"
        assert "token" in admin_auth
        assert admin_auth["user"]["role"] == "ADMIN"
        admin_token = admin_auth["token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("✓ Admin login successful")

        print("\n--- 4. Testing User Registration & Login ---")
        user_payload = {
            "name": "Priya Sharma",
            "email": "priya@example.com",
            "mobile": "9876543210",
            "password": "password123",
            "address": "123 Jubilee Hills",
            "city": "Hyderabad",
            "state": "Telangana",
            "pincode": "500033"
        }
        status, reg_resp = await asgi_request(app, "POST", "/api/auth/register", data=user_payload)
        assert status == 200, f"Registration failed: {reg_resp}"

        status, dup_resp = await asgi_request(app, "POST", "/api/auth/register", data=user_payload)
        assert status == 400
        print("✓ Duplicate prevention working:", dup_resp)

        status, user_auth = await asgi_request(app, "POST", "/api/auth/login", data={"email": "priya@example.com", "password": "password123"})
        assert status == 200
        user_token = user_auth["token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        print("✓ User login successful")

        print("\n--- 5. Testing Measurement Profile ---")
        measurement_data = {
            "bust": 36.5,
            "waist": 30.0,
            "shoulder": 14.5,
            "blouseLength": 14.0,
            "sleeveLength": 10.5,
            "armhole": 15.0,
            "frontNeck": 6.5,
            "backNeck": 8.0,
            "otherMeasurements": "Deep round back neck with dori"
        }
        status, m_save = await asgi_request(app, "POST", "/api/users/me/measurements", headers=user_headers, data=measurement_data)
        assert status == 200, f"Save measurements failed: {m_save}"
        assert m_save["bust"] == 36.5

        status, m_get = await asgi_request(app, "GET", "/api/users/me/measurements", headers=user_headers)
        assert status == 200
        assert m_get["waist"] == 30.0
        print("✓ User measurement profile working")

        print("\n--- 6. Testing Wishlist ---")
        status, _ = await asgi_request(app, "POST", f"/api/wishlist/{design_id}", headers=user_headers)
        assert status == 200

        status, wishlist = await asgi_request(app, "GET", "/api/wishlist", headers=user_headers)
        assert status == 200
        assert len(wishlist) == 1
        assert wishlist[0]["id"] == design_id
        print("✓ Wishlist working")

        print("\n--- 7. Testing Order Creation ---")
        order_payload = {
            "designId": design_id,
            "deliveryAddress": "123 Jubilee Hills, Hyderabad",
            "specialInstructions": "Handle zari delicately",
            "courierOption": "BOUTIQUE",
            "amount": 3500.0,
            "paymentType": "ADVANCE_20",
            "paidAmount": 700.0,
            "balanceAmount": 2800.0,
            "measurement": measurement_data
        }
        status, order = await asgi_request(app, "POST", "/api/orders", headers=user_headers, data=order_payload)
        assert status == 200, f"Create order failed: {order}"
        assert "orderNumber" in order
        assert order["orderNumber"].startswith("BL")
        order_id = order["id"]
        order_number = order["orderNumber"]
        print(f"✓ Order created: #{order_number}")

        print("\n--- 8. Testing Order Tracking (Public) ---")
        status, track = await asgi_request(app, "GET", f"/api/orders/track/{order_number}")
        assert status == 200, f"Tracking failed: {track}"
        assert track["orderNumber"] == order_number
        print("✓ Public order tracking working")

        print("\n--- 9. Testing Dummy Payment ---")
        status, payment = await asgi_request(
            app,
            "POST",
            f"/api/payments/dummy?orderId={order_id}&success=true&transactionNumber=TXN-TEST-123456&paymentType=ADVANCE_20&paidAmount=700.0&balanceAmount=2800.0"
        )
        assert status == 200, f"Payment failed: {payment}"
        assert payment["status"] == "SUCCESS"

        status, updated_order = await asgi_request(app, "GET", f"/api/orders/{order_id}", headers=user_headers)
        assert updated_order["paymentStatus"] == "SUCCESS"
        assert updated_order["orderStatus"] == "PAYMENT_CONFIRMED"
        print("✓ Payment confirmation working")

        print("\n--- 10. Testing Order Cancellation by Customer ---")
        status, cancelled_order = await asgi_request(app, "POST", f"/api/orders/{order_id}/cancel", headers=user_headers)
        assert status == 200, f"Cancellation failed: {cancelled_order}"
        assert cancelled_order["orderStatus"] == "CANCELLED"
        assert cancelled_order["refundStatus"] == "REFUND_PROCESSING"
        print("✓ Order cancellation and refund status working")

        print("\n--- 11. Testing Admin Operations ---")
        # Create a second order for admin testing
        status, order2 = await asgi_request(app, "POST", "/api/orders", headers=user_headers, data=order_payload)
        order2_id = order2["id"]

        status, all_orders = await asgi_request(app, "GET", "/api/admin/orders", headers=admin_headers)
        assert status == 200
        assert len(all_orders) >= 2

        status, all_users = await asgi_request(app, "GET", "/api/admin/users", headers=admin_headers)
        assert status == 200
        assert len(all_users) >= 2

        # Admin update order status
        status, updated_status = await asgi_request(
            app,
            "PUT",
            f"/api/admin/orders/{order2_id}/status?status=STITCHING_IN_PROGRESS&comment=Fabric%20cut%20and%20embroidery%20started",
            headers=admin_headers
        )
        assert status == 200
        assert updated_status["orderStatus"] == "STITCHING_IN_PROGRESS"
        print("✓ Admin status update working")

        print("\n==========================================")
        print("🎉 ALL 11 TEST SUITES PASSED SUCCESSFULLY!")
        print("==========================================")

if __name__ == "__main__":
    asyncio.run(main())
