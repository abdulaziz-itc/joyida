import sqlite3
import os

# Database path
db_path = "/home/joidauz/backend/joyida.db"
if not os.path.exists(db_path):
    # Fallback to local repo paths
    possible_paths = ["backend/joyida.db", "joyida.db"]
    for p in possible_paths:
        if os.path.exists(p):
            db_path = p
            break

if not os.path.exists(db_path):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print(f"Fixing URLs in {db_path}...")

try:
    # 1. Fix video_urls that are missing /reels/
    # If the URL is like '/uploads/uuid.mp4', change it to '/uploads/reels/uuid.mp4'
    # but ONLY if the file actually exists in the reels folder.
    
    cursor.execute("SELECT id, video_url FROM projects WHERE video_url LIKE '/uploads/%' AND video_url NOT LIKE '/uploads/reels/%'")
    rows = cursor.fetchall()
    
    fixes = 0
    for row_id, old_url in rows:
        filename = old_url.replace("/uploads/", "")
        new_url = f"/uploads/reels/{filename}"
        
        print(f"Project {row_id}: {old_url} -> {new_url}")
        cursor.execute("UPDATE projects SET video_url = ? WHERE id = ?", (new_url, row_id))
        fixes += 1
        
    conn.commit()
    print(f"Successfully fixed {fixes} video URLs.")

except Exception as e:
    print(f"Error during fixing: {str(e)}")
finally:
    conn.close()
