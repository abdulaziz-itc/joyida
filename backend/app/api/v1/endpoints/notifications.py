from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from app.db.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[Any])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Fetch notifications for the current user."""
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()
    return notifications

@router.post("/{notification_id}/read", response_model=Any)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Mark a specific notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.is_read = True
    db.commit()
    return notif
