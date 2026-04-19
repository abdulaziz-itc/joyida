import os
import re
import uuid
import sys
import subprocess
import urllib.request
import json
from sqlalchemy.orm import Session
from app.models.project import Project as ProjectModel

# Absolute base directory discovery
# video_downloader.py is in backend/app/services/ (3 levels deep from backend/)
APP_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BASE_UPLOAD_DIR = os.path.join(APP_ROOT, "static", "uploads")
UPLOAD_DIR = os.path.join(BASE_UPLOAD_DIR, "reels")

def get_instagram_direct_url(url: str) -> str:
    """Standalone robust extractor for Instagram direct MP4 URL."""
    try:
        # Normalize URL
        url = url.split('?')[0].rstrip('/') + '/'
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8')
            
            # Search patterns for direct mp4 (Updated for 2024/2025)
            patterns = [
                r'"video_url":"([^"]+)"',
                r'<meta[^>]*property="og:video"[^>]*content="([^"]+)"',
                r'"video_versions":\[\{"url":"([^"]+)"',
                r'"contentUrl":"([^"]+)"',
                r'xdt_api_v1_media_2_info[^>]*video_versions[^>]*url":"([^"]+)"'
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, html)
                for match in matches:
                    clean_url = match.replace("\\u0026", "&").replace("\\/", "/")
                    if "video" in clean_url or ".mp4" in clean_url:
                        return clean_url
    except Exception as e:
        print(f"Extraction error: {str(e)}")
    return None

def download_social_video(project_id: int, db_session_factory: callable):
    """
    Downloads a video from a social media link and replaces the 
    original URL with a local file path.
    """
    db = db_session_factory()
    try:
        project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
        if not project or not project.video_url:
            return

        original_url = project.video_url
        url_lower = original_url.lower()

        # Ensure directory exists
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR, exist_ok=True)

        filename = f"{uuid.uuid4()}.mp4"
        filepath = os.path.join(UPLOAD_DIR, filename)
        local_url = f"/uploads/reels/{filename}"

        # Stage 1: Try Direct Extraction (Instagram specific)
        if 'instagram.com' in url_lower or 'instagr.am' in url_lower:
            print(f"Attempting direct extraction for: {original_url}")
            direct_mp4 = get_instagram_direct_url(original_url)
            if direct_mp4:
                try:
                    urllib.request.urlretrieve(direct_mp4, filepath)
                    if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
                        project.video_url = local_url
                        project.is_downloaded = True
                        db.add(project)
                        db.commit()
                        print(f"SUCCESS: Downloaded via direct extraction for project {project_id}")
                        return
                except Exception as e:
                    print(f"Direct download failed: {str(e)}")

        # Stage 2: Fallback to yt-dlp (Robust for almost all platforms)
        try:
            import yt_dlp
            print(f"Using yt-dlp for: {original_url}")
            ydl_opts = {
                'outtmpl': filepath,
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                'quiet': True,
                'no_warnings': True,
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                # Add cookies if needed, or specific headers
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([original_url])
            
            if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
                project.video_url = local_url
                project.is_downloaded = True
                db.add(project)
                db.commit()
                print(f"SUCCESS: Downloaded via yt-dlp for project {project_id}")
                return
        except ImportError:
            print("yt-dlp NOT INSTALLED. Please run 'pip install yt-dlp' on server.")
        except Exception as e:
            print(f"yt-dlp error: {str(e)}")

        print(f"FAILED: Could not download video for project {project_id}")

    except Exception as e:
        print(f"Final error in downloader: {str(e)}")
        if db: db.rollback()
    finally:
        db.close()
