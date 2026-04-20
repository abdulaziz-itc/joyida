import sqlite3
import os

# Specific server paths and common local paths
possible_paths = [
    "/home/joidauz/backend/joyida.db",  # Exact server path from config
    "../backend/joyida.db",
    "../../backend/joyida.db",
    "backend/joyida.db",
    "joyida.db"
]

db_path = None
for path in possible_paths:
    if os.path.exists(path):
        db_path = path
        break

if not db_path:
    print("Error: joyida.db not found!")
    print(f"Searched in: {', '.join(possible_paths)}")
    exit(1)

print(f"Found database at: {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column(table_name, column_name, column_type):
    try:
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = [column[1] for column in cursor.fetchall()]
        
        if column_name not in columns:
            print(f"Adding '{column_name}' column to {table_name} table...")
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
            conn.commit()
            print(f"Column '{column_name}' added successfully.")
        else:
            print(f"Column '{column_name}' already exists in {table_name}.")
    except Exception as e:
        print(f"Error adding column {column_name}: {str(e)}")

try:
    add_column("projects", "is_downloaded", "BOOLEAN DEFAULT 0")
    add_column("projects", "thumbnail_url", "VARCHAR")
    add_column("projects", "is_public", "BOOLEAN DEFAULT 1")
    add_column("projects", "original_url", "VARCHAR")
    print("Migration check completed.")

except Exception as e:
    print(f"Migration error: {str(e)}")
finally:
    conn.close()
