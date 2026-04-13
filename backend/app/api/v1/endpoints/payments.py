from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from datetime import datetime, timedelta
from app.db.session import get_db
from app.api import deps
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.post("/subscribe/pro", response_model=UserSchema)
def upgrade_to_pro(
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(deps.get_current_user),
) -> Any:
    """Mock endpoint to simulate a successful payment and upgrade to Pro."""
    # In a real app, this would be a callback from Click/Payme
    user = db.query(UserSchema).filter(UserSchema.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.subscription_tier = "pro"
    user.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
    db.commit()
    db.refresh(user)
    return user

@router.post("/subscribe/cancel", response_model=UserSchema)
def cancel_subscription(
    db: Session = Depends(get_db),
    current_user: UserSchema = Depends(deps.get_current_user),
) -> Any:
    """Cancel subscription (reverts after expiration in real logic)."""
    user = db.query(UserSchema).filter(UserSchema.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.subscription_tier = "free"
    db.commit()
    db.refresh(user)
    return user
