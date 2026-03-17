from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import SessionLocal, engine
from app.db import base
from app.core import security
from app import models
import os

# Create tables
base.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json"
)

# Mount static files
upload_dir = "app/uploads"
if not os.path.exists(upload_dir):
    os.makedirs(upload_dir)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
def create_initial_admin():
    db = SessionLocal()
    try:
        admin = db.query(models.user.User).filter(models.user.User.username == "admin").first()
        if not admin:
            hashed_pw = security.get_password_hash("admin123")
            db_admin = models.user.User(username="admin", hashed_password=hashed_pw, role="admin")
            db.add(db_admin)
            db.commit()
            print("Initial admin user created.")
    finally:
        db.close()
