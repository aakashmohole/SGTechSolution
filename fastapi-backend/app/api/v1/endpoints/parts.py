from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.part.Part])
def read_parts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve parts.
    """
    parts = db.query(models.part.Part).offset(skip).limit(limit).all()
    return parts

@router.post("/", response_model=schemas.part.Part)
def create_part(
    *,
    db: Session = Depends(deps.get_db),
    part_in: schemas.part.PartCreate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new part.
    """
    db_obj = models.part.Part(**part_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.patch("/{id}", response_model=schemas.part.Part)
def update_part(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    part_in: schemas.part.PartUpdate,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a part.
    """
    db_obj = db.query(models.part.Part).filter(models.part.Part.id == id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Part not found")
    
    update_data = part_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(db_obj, field, update_data[field])
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/{id}", response_model=schemas.part.Part)
def read_part(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get part by ID.
    """
    part = db.query(models.part.Part).filter(models.part.Part.id == id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    return part

@router.delete("/{id}", response_model=schemas.part.Part)
def delete_part(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a part.
    """
    part = db.query(models.part.Part).filter(models.part.Part.id == id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    db.delete(part)
    db.commit()
    return part
