from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.db.base_class import Base

class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    category = Column(String)
    stock = Column(Integer)
    imageUrls = Column(JSON, nullable=True, default=[])
    specifications = Column(JSON, nullable=True, default={})
    isOffer = Column(Boolean, default=False)
    offerPrice = Column(Float, nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
