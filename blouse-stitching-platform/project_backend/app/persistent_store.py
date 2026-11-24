import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models

REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "persistent_users.json")

def load_registry_data():
    if not os.path.exists(REGISTRY_PATH):
        return []
    try:
        with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading persistent_users.json: {e}")
        return []

def save_registry_data(data):
    try:
        with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as e:
        print(f"Error saving to persistent_users.json: {e}")

def sync_persistent_users(db: Session):
    """
    Ensures that all registered and historical users from persistent_users.json
    are guaranteed to exist in the database (SQLite or PostgreSQL).
    Runs on backend startup so users are NEVER wiped on deploy or container restart.
    """
    users_data = load_registry_data()
    if not users_data:
        return

    for item in users_data:
        email = (item.get("email") or "").strip().lower()
        mobile = (item.get("mobile") or "").strip()
        if not email:
            continue

        # Check by email first (unique primary identifier)
        existing_user = db.query(models.User).filter(
            func.lower(models.User.email) == email
        ).first()

        created_dt = None
        if item.get("createdAt"):
            try:
                created_dt = datetime.fromisoformat(item["createdAt"])
            except Exception:
                created_dt = datetime.utcnow()

        if not existing_user:
            new_user = models.User(
                name=item.get("name"),
                email=email,
                mobile=mobile or None,
                password=item.get("password"),
                role=item.get("role", "USER"),
                address=item.get("address"),
                city=item.get("city"),
                state=item.get("state"),
                pincode=item.get("pincode"),
                createdAt=created_dt or datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            print(f"Restored persistent user into DB: {new_user.name} ({new_user.email})")

            # Check if user has measurements attached
            if item.get("measurement"):
                m_data = item["measurement"]
                user_m = models.UserMeasurement(
                    userId=new_user.id,
                    bust=m_data.get("bust"),
                    waist=m_data.get("waist"),
                    shoulder=m_data.get("shoulder"),
                    blouseLength=m_data.get("blouseLength"),
                    sleeveLength=m_data.get("sleeveLength"),
                    armhole=m_data.get("armhole"),
                    frontNeck=m_data.get("frontNeck"),
                    backNeck=m_data.get("backNeck"),
                    otherMeasurements=m_data.get("otherMeasurements")
                )
                db.add(user_m)
                db.commit()
        else:
            # Update missing fields if empty
            updated = False
            if not existing_user.name and item.get("name"):
                existing_user.name = item.get("name")
                updated = True
            if not existing_user.mobile and item.get("mobile"):
                existing_user.mobile = item.get("mobile")
                updated = True
            if not existing_user.address and item.get("address"):
                existing_user.address = item.get("address")
                existing_user.city = item.get("city")
                existing_user.state = item.get("state")
                existing_user.pincode = item.get("pincode")
                updated = True
            if updated:
                db.commit()

def save_user_to_registry(user: models.User, password_hash: str = None):
    """
    Saves a newly registered or updated user into the persistent JSON file
    so they survive container redeployments.
    """
    if not user or not user.email:
        return

    data = load_registry_data()
    email_clean = user.email.strip().lower()

    existing_entry = None
    for entry in data:
        if (entry.get("email") or "").strip().lower() == email_clean:
            existing_entry = entry
            break

    user_dict = {
        "name": user.name,
        "email": email_clean,
        "mobile": user.mobile,
        "password": password_hash or user.password,
        "role": user.role or "USER",
        "address": user.address,
        "city": user.city,
        "state": user.state,
        "pincode": user.pincode,
        "createdAt": user.createdAt.isoformat() if user.createdAt else datetime.utcnow().isoformat()
    }

    if existing_entry:
        existing_entry.update(user_dict)
    else:
        data.append(user_dict)

    save_registry_data(data)

def remove_user_from_registry(email: str, mobile: str = None):
    """
    Removes a deleted user from the persistent JSON file
    so they are NOT resurrected on future container deploys or restarts.
    """
    data = load_registry_data()
    clean_email = (email or "").strip().lower()
    clean_mobile = (mobile or "").strip()

    filtered = []
    removed = False
    for item in data:
        item_email = (item.get("email") or "").strip().lower()
        item_mobile = (item.get("mobile") or "").strip()

        match = False
        if clean_email and item_email == clean_email:
            match = True
        elif clean_mobile and item_mobile == clean_mobile:
            match = True

        if match:
            removed = True
        else:
            filtered.append(item)

    if removed:
        save_registry_data(filtered)
        print(f"Removed user {email} from persistent registry")
    return removed
