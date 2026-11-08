from sqlalchemy.orm import Session
from app import models
from app.security import get_password_hash

def seed_database(db: Session):
    # Ensure default admin account exists
    admin = db.query(models.User).filter(models.User.email == "admin@blouse.com").first()
    if not admin:
        admin = models.User(
            name="Admin",
            email="admin@blouse.com",
            password=get_password_hash("admin123"),
            role="ADMIN"
        )
        db.add(admin)
        db.commit()
        print("Default Admin account seeded: admin@blouse.com / admin123")

    # Seed default categories & designs if empty
    category_count = db.query(models.Category).count()
    if category_count == 0:
        bridal = models.Category(
            name="Bridal",
            description="Exquisite bridal collection with rich embroidery",
            active=True
        )
        traditional = models.Category(
            name="Traditional",
            description="Classic South Indian traditional patterns and motifs",
            active=True
        )
        designer = models.Category(
            name="Designer",
            description="Contemporary chic and modern trendy cuts",
            active=True
        )
        db.add_all([bridal, traditional, designer])
        db.commit()
        db.refresh(bridal)
        db.refresh(traditional)
        db.refresh(designer)

        d1 = models.Design(
            name="Bridal Heavy Maggam Work",
            price=3500.0,
            categoryId=bridal.id,
            imageUrl="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
            description="Exquisite heavy maggam work blouse with intricate gold zardosi embroidery and bridal stone detailing.",
            featured=True,
            active=True
        )
        d2 = models.Design(
            name="Temple Silk Embroidery",
            price=1800.0,
            categoryId=traditional.id,
            imageUrl="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
            description="Classic temple jewelry inspired silk blouse with pure gold zari piping and elbow sleeves.",
            featured=True,
            active=True
        )
        d3 = models.Design(
            name="Contemporary Minimalist",
            price=1200.0,
            categoryId=designer.id,
            imageUrl="https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800",
            description="Modern sweetheart backless blouse with contrast handcrafted latkans and lightweight silk lining.",
            featured=True,
            active=True
        )
        db.add_all([d1, d2, d3])
        db.commit()
        print("Default designs seeded successfully!")
