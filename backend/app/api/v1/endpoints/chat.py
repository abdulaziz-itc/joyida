from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Any
from app.db.session import get_db
from app.models.marketplace_transaction import ChatRoom, ChatMessage, Booking
from app.api import deps
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/rooms", response_model=List[Any])
def get_chat_rooms(
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(deps.get_current_user),
) -> Any:
    """Get all chat rooms for the current user."""
    rooms = db.query(ChatRoom).filter(
        (ChatRoom.user1_id == current_user.id) | (ChatRoom.user2_id == current_user.id)
    ).all()
    return rooms

@router.post("/rooms/{user_id}", response_model=Any)
def create_chat_room(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(deps.get_current_user),
) -> Any:
    """Create or get a chat room between current user and another user."""
    # Check if room already exists
    room = db.query(ChatRoom).filter(
        ((ChatRoom.user1_id == current_user.id) & (ChatRoom.user2_id == user_id)) |
        ((ChatRoom.user1_id == user_id) & (ChatRoom.user2_id == current_user.id))
    ).first()
    
    if not room:
        room = ChatRoom(user1_id=current_user.id, user2_id=user_id)
        db.add(room)
        db.commit()
        db.refresh(room)
    return room

@router.get("/rooms/{room_id}/messages", response_model=List[Any])
def get_room_messages(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(deps.get_current_user),
) -> Any:
    """Get message history for a room."""
    # Security check: User must be part of the room
    room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
    if not room or (room.user1_id != current_user.id and room.user2_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to access this room")
        
    messages = db.query(ChatMessage).filter(ChatMessage.room_id == room_id).order_by(ChatMessage.created_at.asc()).all()
    return messages

@router.post("/rooms/{room_id}/messages", response_model=Any)
def send_message(
    room_id: int,
    text: str,
    message_type: str = "text",
    metadata: Any = None,
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(deps.get_current_user),
) -> Any:
    """Send a message in a room."""
    message = ChatMessage(
        room_id=room_id,
        sender_id=current_user.id,
        text=text,
        message_type=message_type,
        metadata_json=metadata
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
