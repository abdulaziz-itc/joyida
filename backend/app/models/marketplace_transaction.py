from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"))
    user2_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Privacy consent
    user1_show_profile = Column(Boolean, default=False)
    user2_show_profile = Column(Boolean, default=False)

    messages = relationship("ChatMessage", back_populates="room")
    bookings = relationship("Booking", back_populates="room")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    text = Column(Text, nullable=False)
    message_type = Column(String, default="text") # text, image, offer, system
    metadata_json = Column(JSON, nullable=True) # stores offer details
    created_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("ChatRoom", back_populates="messages")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))
    client_id = Column(Integer, ForeignKey("users.id"))
    expert_id = Column(Integer, ForeignKey("users.id"))
    
    status = Column(String, default="pending") # pending, accepted, in_progress, completed, cancelled
    agreed_price = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    
    # Safety tracking
    client_lat = Column(Float, nullable=True)
    client_lon = Column(Float, nullable=True)
    is_cancelled_by_client = Column(Boolean, default=False)
    cancellation_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)

    room = relationship("ChatRoom", back_populates="bookings")
    reviews = relationship("Review", back_populates="booking")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    reviewer_id = Column(Integer, ForeignKey("users.id"))
    reviewee_id = Column(Integer, ForeignKey("users.id"))
    
    rating = Column(Integer, nullable=False) # 1-5
    comment = Column(Text, nullable=True)
    photos = Column(JSON, nullable=True) # List of image URLs
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="reviews")
