from fastapi import APIRouter
from app.api.v1.endpoints import login, parts, uploads, orders

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"], prefix="/auth")
api_router.include_router(parts.router, prefix="/parts", tags=["parts"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
