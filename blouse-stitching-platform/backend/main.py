from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from app.database import engine, Base, SessionLocal
from app.initial_data import seed_database
from app.routers import auth, catalogue, orders, measurements, wishlist, payments, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all DB tables
    Base.metadata.create_all(bind=engine)
    
    # Run data seeding
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Custom Blouse Designing and Stitching Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=PlainTextResponse)
def home():
    return "Custom Blouse Designing and Stitching Platform API is running!"

# Mount routers
app.include_router(auth.router)
app.include_router(catalogue.router)
app.include_router(orders.router)
app.include_router(measurements.router)
app.include_router(wishlist.router)
app.include_router(payments.router)
app.include_router(admin.router)

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
