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
    
    # Table: users
    users_columns = [
        ("first_name", "TEXT"),
        ("last_name", "TEXT"),
        ("patronymic", "TEXT"),
        ("hourly_rate", "REAL"),
        ("review_count", "INTEGER DEFAULT 0"),
        ("rating", "REAL DEFAULT 0.0")
    ]
    
    # Table: projects
    projects_columns = [
        ("is_downloaded", "BOOLEAN DEFAULT 0"),
        ("is_public", "BOOLEAN DEFAULT 1"),
        ("thumbnail_url", "TEXT"),
        ("original_url", "TEXT")
    ]
    
    def add_columns(table_name, columns):
        for col_name, col_type in columns:
            try:
                print(f"Adding column {col_name} to {table_name}...")
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}")
                print(f"Column {col_name} added to {table_name} successfully.")
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    print(f"Column {col_name} already exists in {table_name}, skipping.")
                else:
                    print(f"Error adding {col_name} to {table_name}: {e}")

    add_columns("users", users_columns)
    add_columns("projects", projects_columns)
    
    # 2. IMPORTANT: Update existing projects to be public
    print("Enabling visibility for existing projects...")
    cursor.execute("UPDATE projects SET is_public = 1 WHERE is_public IS NULL OR is_public = 0")
    
    # 3. Ensure users have correct default rating
    cursor.execute("UPDATE users SET rating = 0.0 WHERE rating IS NULL")
    cursor.execute("UPDATE users SET review_count = 0 WHERE review_count IS NULL")
                
    conn.commit()
    conn.close()
    print("Database visibility fix completed.")

if __name__ == "__main__":
    fix_db()
