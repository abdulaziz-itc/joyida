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
    print(f"CRITICAL: Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print(f"Repairing data at {db_path}...")

try:
    # 1. Backfill original_url where it's null and video_url looks like a social link
    print("Backfilling original_url for legacy projects...")
    cursor.execute("""
        UPDATE projects 
        SET original_url = video_url 
        WHERE (original_url IS NULL OR original_url = '') 
        AND video_url LIKE 'http%'
    """)
    print(f"Updated {cursor.rowcount} projects with original_url.")

    # 2. Reset missing thumbnails for downloaded videos
    print("Resetting thumbnail_url status for re-sync...")
    cursor.execute("""
        UPDATE projects 
        SET thumbnail_url = NULL 
        WHERE thumbnail_url = ''
    """)
    
    # 3. Report
    cursor.execute("SELECT COUNT(*) FROM projects")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM projects WHERE is_public = 1")
    public = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM projects WHERE is_downloaded = 1")
    downloaded = cursor.fetchone()[0]

    conn.commit()
    print("\n--- Project Status ---")
    print(f"Total Projects: {total}")
    print(f"Public Reels:  {public}")
    print(f"Downloaded:    {downloaded}")
    print("--- Repair Complete ---")

except Exception as e:
    print(f"Repair error: {str(e)}")
finally:
    conn.close()
