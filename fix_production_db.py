import sqlite3
import os

# Production DB path from diagnostics
DB_PATH = "/home/joidauz/backend/joyida.db"

if not os.path.exists(DB_PATH):
    # Fallback to local path if running elsewhere
    DB_PATH = "backend/joyida.db"

def fix_db():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    columns_to_add = [
        ("first_name", "TEXT"),
        ("last_name", "TEXT"),
        ("patronymic", "TEXT")
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            print(f"Adding column {col_name}...")
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"Column {col_name} added successfully.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col_name} already exists, skipping.")
            else:
                print(f"Error adding {col_name}: {e}")
                
    conn.commit()
    conn.close()
    print("Database fix completed.")

if __name__ == "__main__":
    fix_db()
