from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from app.db.session import get_db
from app.models.marketplace_transaction import Review, Booking
from app.models.user import User
from app.api import deps
from pydantic import BaseModel

router = APIRouter()

class ReviewCreate(BaseModel):
    booking_id: int
    rating: int
    comment: str = ""
    photos: List[str] = []

@router.post("/", response_model=Any)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Post a review for a completed booking."""
    booking = db.query(Booking).filter(Booking.id == review_in.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != "completed":
        raise HTTPException(status_code=400, detail="Cannot review an incomplete booking")
        
    # Determine who is the reviewee
    reviewee_id = booking.expert_id if current_user.id == booking.client_id else booking.client_id
    
    review = Review(
        booking_id=review_in.booking_id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=review_in.rating,
        comment=review_in.comment,
        photos=review_in.photos
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.get("/expert/{expert_id}", response_model=List[Any])
def get_expert_reviews(
    expert_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """Fetch all reviews for a specific expert."""
    reviews = db.query(Review).filter(Review.reviewee_id == expert_id).all()
    return reviews
