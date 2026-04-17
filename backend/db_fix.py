import sqlite3
import os

def fix_database():
    db_path = "/home/joidauz/backend/joyida.db"
    if not os.path.exists(db_path):
        # Fallback for local testing
        db_path = "joyida.db"
        if not os.path.exists(db_path):
             print(f"Error: Database file not found at {db_path}")
             return

    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Define all expected columns based on the current model
    expected_columns = [
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

    # Also update alembic_version
    try:
        cursor.execute("UPDATE alembic_version SET version_num = 'a2b3c4d5e6f7'")
        print("Updated alembic_version to a2b3c4d5e6f7")
    except Exception as e:
        print(f"Note: Could not update alembic_version: {e}")

    conn.commit()
    conn.close()
    
    if added_count > 0:
        print(f"\nSuccessfully added {added_count} columns.")
        print("Please restart your Python App in cPanel.")
    else:
        print("\nNo columns were added (all exist).")

if __name__ == "__main__":
    fix_database()
