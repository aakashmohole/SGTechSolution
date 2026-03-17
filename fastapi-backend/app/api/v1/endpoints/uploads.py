from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Any, List
import shutil
import os
import uuid
from app.api import deps
from app import models

router = APIRouter()

UPLOAD_DIR = "app/uploads"

@router.post("/")
async def upload_images(
    files: List[UploadFile] = File(...),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Upload multiple images for a hardware part.
    """
    urls = []
    for file in files:
        if not file.content_type.startswith("image/"):
            continue

        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            urls.append(f"http://localhost:8000/uploads/{unique_filename}")
        except Exception as e:
            print(f"Error saving file: {e}")

    if not urls:
        raise HTTPException(status_code=400, detail="No valid images were uploaded")

    return {"urls": urls}
