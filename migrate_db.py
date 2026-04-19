import sqlite3
import os

# Possible paths for the database
possible_paths = [
    "backend/joyida.db",
    "joyida.db",
    "app/joyida.db",
    "../backend/joyida.db"
]

db_path = None
for path in possible_paths:
    if os.path.exists(path):
        db_path = path
        break

if not db_path:
    print("Error: joyida.db not found in any common locations!")
    print(f"Searched in: {', '.join(possible_paths)}")
    exit(1)

print(f"Found database at: {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column exists
    cursor.execute("PRAGMA table_info(projects)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if "is_downloaded" not in columns:
        print("Adding 'is_downloaded' column to projects table...")
        cursor.execute("ALTER TABLE projects ADD COLUMN is_downloaded BOOLEAN DEFAULT 0")
        conn.commit()
        print("Success! Migration completed.")
    else:
        print("'is_downloaded' column already exists. No action needed.")

except Exception as e:
    print(f"Migration error: {str(e)}")
finally:
    conn.close()
