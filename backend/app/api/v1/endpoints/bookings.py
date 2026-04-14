from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Any
from datetime import datetime
from app.db.session import get_db
from app.models.marketplace_transaction import ChatRoom, ChatMessage, Booking
from app.api import deps
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.post("/offer", response_model=Any)
def create_booking_offer(
    room_id: int,
    price: float,
    description: str,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(deps.get_current_user),
) -> Any:
    """Expert sends a booking offer via chat."""
    room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
    if not room or (room.user1_id != current_user.id and room.user2_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Identify roles
    is_user1 = room.user1_id == current_user.id
    other_user_id = room.user2_id if is_user1 else room.user1_id
    
    # Create booking record
    booking = Booking(
        room_id=room_id,
        client_id=other_user_id, # The person on the other side is the client
        expert_id=current_user.id,
        status="pending",
        agreed_price=price,
        description=description
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Also log a system message in the chat
    msg = ChatMessage(
        room_id=room_id,
        sender_id=current_user.id,
        text=f"Expert sent an offer: {price} UZS",
        message_type="offer",
        metadata_json={"booking_id": booking.id, "price": price, "desc": description}
    )
    db.add(msg)
    db.commit()
    
    return booking

@router.post("/{booking_id}/accept", response_model=Any)
def accept_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(deps.get_current_user),
) -> Any:
    """Client accepts the expert's offer."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or booking.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to accept this booking")
    
    booking.status = "accepted"
    booking.started_at = datetime.utcnow()
    db.commit()
    
    # Log system message
    msg = ChatMessage(
        room_id=booking.room_id,
        sender_id=current_user.id,
        text="Booking accepted! The expert is now starting the job.",
        message_type="system"
    )
    db.add(msg)
    db.commit()
    
    return booking

@router.post("/{booking_id}/complete", response_model=Any)
def complete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(deps.get_current_user),
) -> Any:
    """Mark the job as finished."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or (booking.client_id != current_user.id and booking.expert_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    booking.status = "completed"
    booking.finished_at = datetime.utcnow()
    db.commit()
    
    return booking
