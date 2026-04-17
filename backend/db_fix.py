import sqlite3
import os

def fix_database():
    # Try multiple possible database names
    db_names = ["joyida.db", "app.db"]
    base_path = "/home/joidauz/backend/"
    
    found_any = False
    for name in db_names:
        db_path = os.path.join(base_path, name)
        if not os.path.exists(db_path):
            # Try local path
            db_path = name
            if not os.path.exists(db_path):
                continue
        
        found_any = True
        print(f"\n--- Checking database: {db_path} ---")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Define all expected columns
        expected_columns = [
            ("name", "TEXT"),
            ("first_name", "TEXT"),
            ("last_name", "TEXT"),
            ("patronymic", "TEXT"),
            ("phone_number", "TEXT"),
            ("bio", "TEXT"),
            ("headline", "TEXT"),
            ("skills", "JSON"),
            ("languages", "JSON"),
            ("social_links", "JSON"),
            ("birth_date", "DATE"),
            ("education_info", "JSON"),
            ("experience_info", "JSON"),
            ("hourly_rate", "FLOAT"),
            ("rating", "FLOAT DEFAULT 0.0"),
            ("review_count", "INTEGER DEFAULT 0"),
            ("profile_completed", "BOOLEAN DEFAULT 0"),
            ("is_verified", "BOOLEAN DEFAULT 0"),
            ("verification_status", "TEXT DEFAULT 'unverified'"),
            ("verification_data", "JSON")
        ]

        # Get current columns
        cursor.execute("PRAGMA table_info(users)")
        current_columns = [row[1] for row in cursor.fetchall()]

        added_count = 0
        for col_name, col_type in expected_columns:
            if col_name not in current_columns:
                print(f"Adding column: {col_name} ({col_type})")
                try:
                    cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                    added_count += 1
                except Exception as e:
                    print(f"Error adding {col_name}: {e}")

        conn.commit()
        conn.close()
        print(f"Done. Added {added_count} columns to {name}.")

    if not found_any:
        print("Error: No database files found (.db)")

if __name__ == "__main__":
    fix_database()
