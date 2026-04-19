import re
import urllib.request
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.models.user import User as UserModel
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
            
            # Look for og:video meta tag
            video_match = re.search(r'<meta[^>]*property="og:video"[^>]*content="([^"]+)"', html)
            if not video_match:
                # Try finding in the JSON blob if meta tag is missing (modern IG)
                video_match = re.search(r'"video_url":"([^"]+)"', html)
            
            if video_match:
                video_url = video_match.group(1).replace("\\u0026", "&")
                return {"direct_url": video_url}
            
            raise HTTPException(status_code=404, detail="Direct video URL not found")
            
    except Exception as e:
        # Fallback to a common public downloader proxy pattern if direct fails
        # Many public tools use specific URL patterns or dedicated proxies.
        # For now, we return error so frontend can fallback to iframe.
        raise HTTPException(status_code=500, detail=str(e))
