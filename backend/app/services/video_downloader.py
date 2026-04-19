import os
import uuid
import yt_dlp
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
        if not any(x in original_url for x in ['instagram.com', 'tiktok.com', 'youtube.com', 'youtu.be']):
            return # Not a social link we handle

        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)

        filename = f"{uuid.uuid4()}.mp4"
        filepath = os.path.join(UPLOAD_DIR, filename)

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
