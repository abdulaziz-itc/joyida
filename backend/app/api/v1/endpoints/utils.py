import os
import re
import uuid
import shutil
import urllib.request
import base64
import subprocess
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.models.user import User as UserModel
from app.models.service import ServiceCategory
from app.schemas.user import ServiceCategory as ServiceCategorySchema
from app.models.project import Project as ProjectModel

# Absolute base directory discovery
# utils.py is in backend/app/api/v1/endpoints/ (5 levels deep from backend/)
APP_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
BASE_UPLOAD_DIR = os.path.join(APP_ROOT, "static", "uploads")
UPLOAD_DIR = os.path.join(BASE_UPLOAD_DIR, "reels")

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

@router.get("/list-files")
def list_uploaded_files(db: Session = Depends(get_db)):
    """Diagnostic endpoint to list contents of uploads directory."""
    files_tree = {}
    app_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    static_root = os.path.join(app_root, "static", "uploads")
    
    if not os.path.exists(static_root):
        return {"error": f"Path not found: {static_root}"}
        
    for root, dirs, files in os.walk(static_root):
        rel_path = os.path.relpath(root, static_root)
        files_tree[rel_path] = {
            "dirs": dirs,
            "files": files[:20] # Limit output
        }
    
    return {
        "static_root": static_root,
        "tree": files_tree
    }

@router.post("/save-thumbnail/{project_id}")
def save_thumbnail(
    project_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    """Save a base64 encoded thumbnail for a project."""
    try:
        project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Decode base64
        header, encoded = data["image"].split(",", 1)
        image_data = base64.b64decode(encoded)

        # Create directory
        thumb_dir = "static/uploads/thumbnails"
        if not os.path.exists(thumb_dir):
            os.makedirs(thumb_dir)

        filename = f"thumb_{project_id}_{uuid.uuid4().hex[:8]}.jpg"
        file_path = os.path.join(thumb_dir, filename)

        with open(file_path, "wb") as f:
            f.write(image_data)

        # Update project
        project.thumbnail_url = f"/uploads/thumbnails/{filename}"
        db.commit()

        return {"status": "success", "url": project.thumbnail_url}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download-reel/{project_id}")
def download_reel(
    project_id: int,
    db: Session = Depends(get_db)
):
    """Download a reel with a JOIDA watermark."""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project or not project.video_url:
        raise HTTPException(status_code=404, detail="Video not found")

    # Clean path
    raw_path = project.video_url.lstrip('/')
    if raw_path.startswith('uploads/'):
        input_path = os.path.join("static", raw_path)
    else:
        # If it's an external URL, we'd need to download it first
        # For now, let's assume it's local since we download them
        input_path = raw_path

    if not os.path.exists(input_path):
         raise HTTPException(status_code=404, detail=f"File not found on server: {input_path}")

    # Output path for watermarked video
    output_dir = "static/uploads/exports"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    output_filename = f"joida_{os.path.basename(input_path)}"
    output_path = os.path.join(output_dir, output_filename)

    # Watermark command using ffmpeg
    # drawtext filter: text='JOIDA', bottom right, white color with shadow and box
    # x=w-tw-40:y=h-th-40 (40px padding from bottom-right)
    command = [
        "ffmpeg", "-y", "-i", input_path,
        "-vf", "drawtext=text='JOIDA':x=w-tw-40:y=h-th-40:fontsize=48:fontcolor=white:shadowcolor=black@0.6:shadowx=3:shadowy=3:box=1:boxcolor=black@0.2:boxborderw=10",
        "-c:a", "copy", output_path
    ]

    try:
        subprocess.run(command, check=True, capture_output=True)
        return FileResponse(
            path=output_path, 
            filename=f"JOIDA_{project.title}.mp4",
            media_type="video/mp4"
        )
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e.stderr.decode()}")
        # Fallback to original if ffmpeg fails
        return FileResponse(path=input_path, filename=f"{project.title}.mp4")
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
