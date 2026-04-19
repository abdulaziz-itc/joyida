import os
import re
import uuid
import shutil
import urllib.request
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.models.user import User as UserModel
from app.models.service import ServiceCategory
from app.schemas.user import ServiceCategory as ServiceCategorySchema

router = APIRouter()

@router.get("/check-email")
def check_email_availability(
    email: str,
    db: Session = Depends(get_db)
) -> Any:
    """Check if an email is already registered."""
    user = db.query(UserModel).filter(UserModel.email == email).first()
    return {"available": user is None}

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

@router.get("/resolve-instagram")
def resolve_instagram_video(url: str = Query(...)):
    """Extract direct video URL from an Instagram public link."""
    try:
        # Mimic a browser request to get meta tags
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
            
            # Enhanced discovery patterns
            patterns = [
                r'<meta[^>]*property="og:video"[^>]*content="([^"]+)"',
                r'"video_url":"([^"]+)"',
                r'"contentUrl":"([^"]+)"',
                r'xdt_api_v1_media_2_info[^>]*video_versions[^>]*url":"([^"]+)"'
            ]
            
            video_url = None
            for pattern in patterns:
                match = re.search(pattern, html)
                if match:
                    video_url = match.group(1).replace("\\u0026", "&").replace("\\/", "/")
                    break
            
            if video_url:
                return {"direct_url": video_url}
            
            raise HTTPException(status_code=404, detail="Direct video URL not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/diag/system")
def system_diagnostics(db: Session = Depends(get_db)):
    """Check system dependencies and environment."""
    import sys
    import subprocess
    
    yt_dlp_status = "Not installed"
    try:
        import yt_dlp
        yt_dlp_status = f"Available (Version: {yt_dlp.version.__version__})"
    except ImportError:
        pass

    results = {
        "python_version": sys.version,
        "platform": sys.platform,
        "yt_dlp": yt_dlp_status,
        "database": str(db.bind.url).split("@")[-1] if db.bind.url.password else str(db.bind.url),
        "cwd": os.getcwd(),
        "upload_dir_exists": os.path.exists(UPLOAD_DIR)
    }
    return results
