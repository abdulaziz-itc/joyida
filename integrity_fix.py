import sqlite3
import os

# Absolute paths for reliability
APP_ROOT = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(APP_ROOT, "backend/joyida.db")
if not os.path.exists(db_path):
     db_path = "/home/joidauz/backend/joyida.db"

if not os.path.exists(db_path):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print(f"Starting Integrity Audit on {db_path}...")

try:
    cursor.execute("SELECT id, video_url, is_downloaded, thumbnail_url FROM projects")
    rows = cursor.fetchall()
    
    reset_count = 0
    thumb_reset_count = 0
    
    for row_id, video_url, is_downloaded, thumb_url in rows:
        # Check Video
        if is_downloaded and video_url and video_url.startswith('/uploads/'):
            # Convert URL to absolute disk path
            # BASE_URL mapping: /uploads/ -> static/uploads/
            rel_path = video_url.lstrip('/')
            abs_path = os.path.join(os.path.dirname(db_path), "static", rel_path)
            
            if not os.path.exists(abs_path):
                print(f"MISSING VIDEO: Project {row_id} - File {abs_path} not found. Resetting...")
                cursor.execute("UPDATE projects SET is_downloaded = 0 WHERE id = ?", (row_id,))
                reset_count += 1

        # Check Thumbnail
        if thumb_url and thumb_url.startswith('/uploads/'):
            rel_thumb = thumb_url.lstrip('/')
            abs_thumb = os.path.join(os.path.dirname(db_path), "static", rel_thumb)
            
            if not os.path.exists(abs_thumb):
                 print(f"MISSING THUMBNAIL: Project {row_id} - File {abs_thumb} not found. Resetting...")
                 cursor.execute("UPDATE projects SET thumbnail_url = NULL WHERE id = ?", (row_id,))
                 thumb_reset_count += 1
                 
    conn.commit()
    print(f"Audit Complete.")
    print(f"Reset {reset_count} missing videos and {thumb_reset_count} missing thumbnails.")

except Exception as e:
    print(f"Integrity error: {str(e)}")
finally:
    conn.close()
