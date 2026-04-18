import sqlite3
import os
import sys

# Add current directory to path so we can import app modules
sys.path.append(os.getcwd())

from app.db.session import engine, Base
# Import all models to ensure they are registered with Base.metadata
from app.models.user import User
from app.models.user_image import UserImage
from app.models.project import Project
from app.models.service import ServiceCategory
from app.models.notification import Notification
from app.models.marketplace import NFTItem

def fix_database():
    print("\n" + "="*50)
    print("JOYIDA DATABASE REPAIR & SYNC TOOL")
    print("="*50)

    # Step 1: Create missing tables using SQLAlchemy
    print("\n[STEP 1] Checking for missing tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("-> Table creation/verification complete.")
    except Exception as e:
        print(f"   [!] Error creating tables: {e}")

    # Step 2: Manually fix missing columns in the 'users' table (SQLAlchemy won't add columns to existing tables)
    # Try multiple possible database names since config might vary
    db_names = ["joyida.db", "app.db"]
    base_path = "/home/joidauz/backend/"
    
    found_any = False
    for name in db_names:
        db_path = os.path.join(base_path, name)
        if not os.path.exists(db_path):
            db_path = name
            if not os.path.exists(db_path):
                continue
        
        found_any = True
        print(f"\n[STEP 2] Repairing columns for: {db_path}")
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()

            # List current columns
            cursor.execute("PRAGMA table_info(users)")
            rows = cursor.fetchall()
            current_columns = [row[1] for row in rows]
            
            # Define expected columns that might be missing from older versions
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

            added_count = 0
            for col_name, col_type in expected_columns:
                if col_name not in current_columns:
                    print(f"   + Adding column: {col_name} ({col_type})")
                    try:
                        cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                        added_count += 1
                    except Exception as e:
                        print(f"     [!] Error: {e}")

            conn.commit()
            conn.close()
            print(f"-> Column repair complete. Added {added_count} columns.")
        except Exception as e:
            print(f"   [!] Connection error for {name}: {e}")

    print("\n" + "="*50)
    print("ALL REPAIRS FINISHED!")
    print("Please RESTART your Python App in cPanel now.")
    print("="*50 + "\n")

if __name__ == "__main__":
    fix_database()
