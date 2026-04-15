import sys
import os
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Add project root to path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_experts():
    db = SessionLocal()
    
    # Experts to add around Tashkent
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
    
    for exp in experts:
        # Check if exists
        user = db.query(User).filter(User.email == exp["email"]).first()
        if user:
            print(f"User {exp['email']} already exists, updating...")
            for key, value in exp.items():
                setattr(user, key, value)
        else:
            new_user = User(
                **exp,
                hashed_password=get_password_hash("joyida2026"),
                is_active=True,
                is_expert=True,
                profile_completed=True
            )
            db.add(new_user)
    
    db.commit()
    db.close()
    print("Seeding completed!")

if __name__ == "__main__":
    seed_experts()
