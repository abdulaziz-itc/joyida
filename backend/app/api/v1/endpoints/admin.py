from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from app.db.session import get_db
from app.models.user import User
from app.models.marketplace_transaction import Booking
from app.api import deps
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/stats", response_model=Any)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_admin: UserSchema = Depends(deps.get_current_active_superuser),
) -> Any:
    """Get high-level KPIs for the Joyida platform."""
    total_users = db.query(User).count()
    total_experts = db.query(User).filter(User.is_expert == True).count()
    verified_experts = db.query(User).filter(User.is_verified == True).count()
    pending_verifications = db.query(User).filter(User.verification_status == "pending").count()
    active_bookings = db.query(Booking).filter(Booking.status.in_(["accepted", "in_progress"])).count()
    
    return {
        "total_users": total_users,
        "total_experts": total_experts,
        "verified_experts": verified_experts,
        "pending_verifications": pending_verifications,
        "active_bookings": active_bookings,
    }

@router.get("/experts/pending", response_model=List[UserSchema])
def get_pending_experts(
    db: Session = Depends(get_db),
    current_admin: UserSchema = Depends(deps.get_current_active_superuser),
) -> Any:
    """List all experts who have submitted documents and are waiting for verification."""
    experts = db.query(User).filter(User.verification_status == "pending").all()
    return experts

@router.post("/experts/{user_id}/approve", response_model=UserSchema)
def approve_expert(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: UserSchema = Depends(deps.get_current_active_superuser),
) -> Any:
    """Approve an expert's identity and grant the 'Verified' badge."""
    expert = db.query(User).filter(User.id == user_id).first()
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
        
    expert.is_verified = True
    expert.verification_status = "verified"
    db.commit()
    db.refresh(expert)
    return expert

@router.post("/experts/{user_id}/reject", response_model=UserSchema)
def reject_expert(
    user_id: int,
    reason: str,
    db: Session = Depends(get_db),
    current_admin: UserSchema = Depends(deps.get_current_active_superuser),
) -> Any:
    """Reject an expert's verification with a reason."""
    expert = db.query(User).filter(User.id == user_id).first()
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
        
    expert.is_verified = False
    expert.verification_status = "rejected"
    # In a real app, we'd store the 'reason' in a notifications table
    db.commit()
    db.refresh(expert)
    return expert
