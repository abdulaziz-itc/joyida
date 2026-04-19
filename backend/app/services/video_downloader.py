import os
import uuid
import sys
import subprocess

try:
    import yt_dlp
    YT_DLP_AVAILABLE = True
except ImportError:
    try:
        # Self-healing: try to install yt-dlp into the current environment
        print("yt-dlp missing. Attempting self-installation...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "yt-dlp"])
        import yt_dlp
        YT_DLP_AVAILABLE = True
        print("yt-dlp successfully installed.")
    except Exception as e:
        print(f"Self-installation of yt-dlp failed: {str(e)}")
        YT_DLP_AVAILABLE = False

from sqlalchemy.orm import Session
from app.models.project import Project as ProjectModel

UPLOAD_DIR = "static/uploads/reels"

def download_social_video(project_id: int, db_session_factory: callable):
    """
    Downloads a video from a social media link (Instagram, TikTok, etc.)
    and updates the project record with the local file path.
    """
    db = db_session_factory()
    try:
        project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if not project or not project.video_url:
            return

        original_url = project.video_url
        # normalize URL and check platforms
        url_lower = original_url.lower()
        is_social = any(x in url_lower for x in [
            'instagram.com', 'instagr.am', 
            'tiktok.com', 'vm.tiktok.com', 
            'youtube.com', 'youtu.be'
        ])
        
        if not is_social:
            return 

        if not YT_DLP_AVAILABLE:
            print(f"Skipping download for project {project_id}: yt-dlp library not installed on server.")
            return

        ydl_opts = {
            'outtmpl': filepath,
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'quiet': True,
            'no_warnings': True,
            # Instagram often needs specific user agents
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([original_url])

        if os.path.exists(filepath):
            # Update the project with the local URL
            project.video_url = f"/uploads/reels/{filename}"
            db.add(project)
            db.commit()
            print(f"Successfully downloaded video for project {project_id}: {filepath}")
        else:
            print(f"Failed to download video for project {project_id}: File not found after download.")

    except Exception as e:
        print(f"Error downloading social video for project {project_id}: {str(e)}")
    finally:
        db.close()
