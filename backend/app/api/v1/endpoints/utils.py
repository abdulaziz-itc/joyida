import os
import uuid
import shutil
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.models.service import ServiceCategory
from app.schemas.user import ServiceCategory as ServiceCategorySchema

router = APIRouter()

UPLOAD_DIR = "static/uploads"

@router.post("/upload", response_model=dict)
def upload_file(
    file: UploadFile = File(...),
) -> Any:
    """Upload a file to the server."""
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/uploads/{unique_filename}"}

@router.get("/services", response_model=List[ServiceCategorySchema])
def read_services(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve service categories."""
    services = db.query(ServiceCategory).offset(skip).limit(limit).all()
    return services
