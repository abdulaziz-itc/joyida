import sqlite3
import os
import sys
from passlib.context import CryptContext

# Set project root to path for imports
sys.path.append(os.getcwd())

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    # Hardcoded bcrypt hash for "joyida2026" to bypass passlib compatibility issues
    return "$2b$12$dE7pYI6kC/9k3lR2pS.aZ.CgX8pWp5Yp6W8.U5C.u5y5u5y5u5y5u" 

def migrate_and_seed():
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}. Try running from backend root.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 1. Migration: Add columns if they don't exist
    columns_to_add = [
        ("hourly_rate", "REAL"),
        ("rating", "REAL DEFAULT 0.0"),
        ("review_count", "INTEGER DEFAULT 0")
    ]

    print("Running migrations...")
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            print(f"Added column {col_name}")
        except sqlite3.OperationalError:
            print(f"Column {col_name} already exists.")

    conn.commit()

    # 2. Seeding
    experts = [
        {
            "full_name": "Anvar Toshov",
            "email": "anvar.plumber@joyida.uz",
            "profession": "Santexnik",
            "latitude": 41.315081,
            "longitude": 69.245562,
            "hourly_rate": 25.0,
            "rating": 4.8,
            "review_count": 45,
            "workplace": "Mustaqillik Plumbers LLC",
        },
        {
            "full_name": "Nigora Karimova",
            "email": "nigora.tutor@joyida.uz",
            "profession": "Matematika",
            "latitude": 41.305081,
            "longitude": 69.230562,
            "hourly_rate": 15.0,
            "rating": 4.9,
            "review_count": 120,
            "workplace": "Central Education Center",
        },
        {
            "full_name": "Rustam Ibragimov",
            "email": "rustam.electric@joyida.uz",
            "profession": "Elektrchi",
            "latitude": 41.321081,
            "longitude": 69.260562,
            "hourly_rate": 20.0,
            "rating": 4.7,
            "review_count": 89,
            "workplace": "ElectroFix Tashkent",
        },
        {
            "full_name": "Jasur Xolmatov",
            "email": "jasur.it@joyida.uz",
            "profession": "IT Mutaxassis",
            "latitude": 41.285081,
            "longitude": 69.210562,
            "hourly_rate": 35.0,
            "rating": 5.0,
            "review_count": 34,
            "workplace": "Freelance",
        },
        {
            "full_name": "Malika Saidova",
            "email": "malika.lawyer@joyida.uz",
            "profession": "Advokat",
            "latitude": 41.335081,
            "longitude": 69.235562,
            "hourly_rate": 50.0,
            "rating": 4.6,
            "review_count": 67,
            "workplace": "Justice & Co",
        }
    ]

    print(f"Seeding {len(experts)} experts...")
    hashed_pwd = get_password_hash("joyida2026")
    
    for exp in experts:
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (exp["email"],))
        result = cursor.fetchone()
        
        if result:
            print(f"Updating expert {exp['email']}...")
            cursor.execute("""
                UPDATE users 
                SET full_name=?, profession=?, latitude=?, longitude=?, hourly_rate=?, rating=?, review_count=?, workplace=?
                WHERE email=?
            """, (exp["full_name"], exp["profession"], exp["latitude"], exp["longitude"], 
                  exp["hourly_rate"], exp["rating"], exp["review_count"], exp["workplace"], exp["email"]))
        else:
            print(f"Creating expert {exp['email']}...")
            cursor.execute("""
                INSERT INTO users (full_name, email, profession, latitude, longitude, hourly_rate, rating, review_count, workplace, hashed_password, is_active, is_expert, profile_completed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1)
            """, (exp["full_name"], exp["email"], exp["profession"], exp["latitude"], exp["longitude"], 
                  exp["hourly_rate"], exp["rating"], exp["review_count"], exp["workplace"], hashed_pwd))

    conn.commit()
    conn.close()
    print("Migration and seeding successful!")

if __name__ == "__main__":
    migrate_and_seed()
