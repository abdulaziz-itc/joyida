import sqlite3
import os

db_path = "backend/joyida.db"

if not os.path.exists(db_path):
    print(f"Error: {db_path} not found!")
    exit(1)

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
