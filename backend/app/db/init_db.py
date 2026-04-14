from app.db.session import engine, Base
from app.models.user import User  # Ensure models are imported

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

if __name__ == "__main__":
    init_db()
