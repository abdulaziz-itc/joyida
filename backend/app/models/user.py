from sqlalchemy import Column, Integer, String, Boolean, Float, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    
    # Marketplace/Expert fields
    is_expert = Column(Boolean(), default=False)
    profession = Column(String, nullable=True) # Unified with specialization/direction
    birth_year = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    education_level = Column(String, nullable=True)
    workplace = Column(String, nullable=True)
    
    # Location fields
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    service_location_name = Column(String, nullable=True)
    
    # Expert profile details
    hourly_rate = Column(Float, nullable=True) # Price per hour
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)

    profile_completed = Column(Boolean(), default=False)

    # Verification and Profile Assets
    profile_picture_url = Column(String, nullable=True)
    is_verified = Column(Boolean(), default=False)
    verification_status = Column(String, default="unverified") # unverified, pending, verified, rejected
    verification_data = Column(JSON, nullable=True) # stores document URLs, timestamps

    # Relationships
    projects = relationship("Project", back_populates="owner")
    services = relationship("ServiceCategory", secondary="user_services", back_populates="users")
