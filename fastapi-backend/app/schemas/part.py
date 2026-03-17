from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any

class PartBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock: int
    imageUrls: List[str] = []
    specifications: Dict[str, Any] = {}
    isOffer: bool = False
    offerPrice: Optional[float] = None

class PartCreate(PartBase):
    pass

class PartUpdate(PartBase):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    imageUrls: Optional[List[str]] = None
    specifications: Optional[Dict[str, Any]] = None

class PartInDBBase(PartBase):
    id: int
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Part(PartInDBBase):
    pass
