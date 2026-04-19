import sqlite3
import os

def find_app_root():
    current = os.path.abspath(__file__)
    while True:
        parent = os.path.dirname(current)
        if parent == current: return os.path.dirname(os.path.abspath(__file__))
        if os.path.exists(os.path.join(parent, "static")):
            return parent
        current = parent

# Robust paths
APP_ROOT = find_app_root()
db_path = os.path.join(APP_ROOT, "joyida.db")
if not os.path.exists(db_path):
    # Try common locations
    possible = [
        os.path.join(APP_ROOT, "backend", "joyida.db"),
        "/home/joidauz/backend/joyida.db"
    ]
    for p in possible:
        if os.path.exists(p):
            db_path = p
            break

if not os.path.exists(db_path):
    print(f"CRITICAL: Database not found at {db_path}!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print(f"Starting Robust Integrity Audit on {db_path}...")
print(f"System identified APP_ROOT at: {APP_ROOT}")

try:
    cursor.execute("SELECT id, video_url, is_downloaded, thumbnail_url FROM projects")
    rows = cursor.fetchall()
    
    reset_count = 0
    thumb_reset_count = 0
    
    for row_id, video_url, is_downloaded, thumb_url in rows:
        # Check Video
        if is_downloaded and video_url and video_url.startswith('/uploads/'):
            # Convert URL to absolute disk path using identified APP_ROOT
            rel_path = video_url.lstrip('/')
            abs_path = os.path.join(APP_ROOT, "static", rel_path)
            
            if not os.path.exists(abs_path):
                print(f"MISSING: Project {row_id} - File {abs_path} not found. Resetting...")
                cursor.execute("UPDATE projects SET is_downloaded = 0 WHERE id = ?", (row_id,))
                reset_count += 1
            else:
                # Optional: Check if file size is > 0
                if os.path.getsize(abs_path) == 0:
                     print(f"EMPTY: Project {row_id} - {abs_path} is 0 bytes. Resetting...")
                     cursor.execute("UPDATE projects SET is_downloaded = 0 WHERE id = ?", (row_id,))
                     reset_count += 1

        # Check Thumbnail
        if thumb_url and thumb_url.startswith('/uploads/'):
            rel_thumb = thumb_url.lstrip('/')
            abs_thumb = os.path.join(APP_ROOT, "static", rel_thumb)
            
            if not os.path.exists(abs_thumb):
                 print(f"THUMB MISSING: Project {row_id} - {abs_thumb} not found. Resetting...")
                 cursor.execute("UPDATE projects SET thumbnail_url = NULL WHERE id = ?", (row_id,))
                 thumb_reset_count += 1
                 
    conn.commit()
    print(f"Audit Complete.")
    print(f"Reset {reset_count} videos and {thumb_reset_count} thumbnails.")
    print(f"These will be re-downloaded next time the feed is loaded.")

except Exception as e:
    print(f"Integrity error: {str(e)}")
finally:
    conn.close()
