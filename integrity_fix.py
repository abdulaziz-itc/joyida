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

APP_ROOT = find_app_root()
db_path = os.path.join(APP_ROOT, "joyida.db")
if not os.path.exists(db_path):
    possible = [os.path.join(APP_ROOT, "backend", "joyida.db"), "/home/joidauz/backend/joyida.db"]
    for p in possible:
        if os.path.exists(p):
            db_path = p
            break

if not os.path.exists(db_path):
    print(f"CRITICAL: Database not found at {db_path}!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print(f"Starting Intelligent Audit on {db_path}...")

try:
    # 1. Remove Exact URL Duplicates for same user (keep only the first one)
    print("Checking for duplicate video URLs...")
    cursor.execute("""
        DELETE FROM projects 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM projects 
            GROUP BY owner_id, video_url
        )
    """)
    if cursor.rowcount > 0:
        print(f"Removed {cursor.rowcount} duplicate project entries.")

    # 2. Sync Missing Files
    cursor.execute("SELECT id, video_url, is_downloaded, thumbnail_url FROM projects")
    rows = cursor.fetchall()
    
    reset_count = 0
    for row_id, video_url, is_downloaded, thumb_url in rows:
        if is_downloaded and video_url and video_url.startswith('/uploads/'):
            rel_path = video_url.lstrip('/')
            abs_path = os.path.join(APP_ROOT, "static", rel_path)
            
            if not os.path.exists(abs_path) or os.path.getsize(abs_path) == 0:
                cursor.execute("UPDATE projects SET is_downloaded = 0 WHERE id = ?", (row_id,))
                reset_count += 1

        if thumb_url and thumb_url.startswith('/uploads/'):
            rel_thumb = thumb_url.lstrip('/')
            abs_thumb = os.path.join(APP_ROOT, "static", rel_thumb)
            if not os.path.exists(abs_thumb):
                 cursor.execute("UPDATE projects SET thumbnail_url = NULL WHERE id = ?", (row_id,))

    conn.commit()
    print(f"Audit Complete. Reset {reset_count} missing files.")

except Exception as e:
    print(f"Audit error: {str(e)}")
finally:
    conn.close()
