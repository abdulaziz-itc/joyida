from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.models.user import User as UserModel
from app.models.user_image import UserImage as UserImageModel
from app.schemas.user import UserImage as UserImageSchema, UserImageCreate

router = APIRouter()

@router.get("/me/images", response_model=List[UserImageSchema])
def read_user_images(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """Get current user's images."""
    return current_user.images

@router.post("/me/images", response_model=UserImageSchema)
def add_user_image(
    *,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user),
    image_in: UserImageCreate,
) -> Any:
    """Add a new image to user profile."""
    # If this is the first image, or marked as main, unset others
    if image_in.is_main or not current_user.images:
        db.query(UserImageModel).filter(UserImageModel.user_id == current_user.id).update({"is_main": False})
        image_in.is_main = True
        # Also update the user's main profile_picture_url for backward compatibility
        current_user.profile_picture_url = image_in.url

    db_image = UserImageModel(
        **image_in.dict(),
        user_id=current_user.id,
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

@router.delete("/me/images/{image_id}", response_model=UserImageSchema)
def delete_user_image(
    *,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user),
    image_id: int,
) -> Any:
    """Delete a user image."""
    image = db.query(UserImageModel).filter(
        UserImageModel.id == image_id, 
        UserImageModel.user_id == current_user.id
    ).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    was_main = image.is_main
    db.delete(image)
    
    # If deleted was main, pick another one as main if exists
    if was_main:
        remaining = db.query(UserImageModel).filter(UserImageModel.user_id == current_user.id).first()
        if remaining:
            remaining.is_main = True
            current_user.profile_picture_url = remaining.url
        else:
            current_user.profile_picture_url = None
            
    db.commit()
    return image

@router.put("/me/images/{image_id}/set-main", response_model=UserImageSchema)
def set_main_image(
    *,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user),
    image_id: int,
) -> Any:
    """Set an image as the main profile picture."""
    image = db.query(UserImageModel).filter(
        UserImageModel.id == image_id, 
        UserImageModel.user_id == current_user.id
    ).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Unset current main
    db.query(UserImageModel).filter(UserImageModel.user_id == current_user.id).update({"is_main": False})
    
    # Set new main
    image.is_main = True
    current_user.profile_picture_url = image.url
    
    db.commit()
    db.refresh(image)
    return image
