import os
import traceback
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.user import Token, UserCreate, User as UserSchema, UserUpdate
from app.api import deps
from typing import Any

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(UserModel).filter(UserModel.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user,
    }

@router.get("/check-email/")
@router.get("/check-email")
def check_email_availability(
    email: str,
    db: Session = Depends(get_db)
) -> Any:
    """Check if an email is already registered."""
    user = db.query(UserModel).filter(UserModel.email == email).first()
    return {"available": user is None}

@router.post("/register", response_model=UserSchema)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    db_user = UserModel(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        patronymic=user_in.patronymic,
        is_expert=user_in.is_expert,
        profession=user_in.profession,
        birth_year=user_in.birth_year,
        birth_date=user_in.birth_date,
        gender=user_in.gender,
        education_level=user_in.education_level,
        education_info=[item.dict() for item in user_in.education_info] if user_in.education_info else None,
        workplace=user_in.workplace,
        experience_info=[item.dict() for item in user_in.experience_info] if user_in.experience_info else None,
        latitude=user_in.latitude,
        longitude=user_in.longitude,
        service_location_name=user_in.service_location_name,
        profile_picture_url=user_in.profile_picture_url,
        phone_number=user_in.phone_number,
        bio=user_in.bio,
        headline=user_in.headline,
        skills=user_in.skills,
        languages=[item.dict() for item in user_in.languages] if user_in.languages else None,
        social_links=[item.dict() for item in user_in.social_links] if user_in.social_links else None,
    )
    
    # Handle service associations
    if user_in.is_expert and user_in.service_ids:
        from app.models.service import ServiceCategory
        services = db.query(ServiceCategory).filter(ServiceCategory.id.in_(user_in.service_ids)).all()
        db_user.services = services

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """Get current user."""
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    """Update own user profile."""
    try:
        # Debug logging to see what's coming from frontend
        update_data = user_in.model_dump(exclude_unset=True)
        print(f"DEBUG: update_user_me request for user {current_user.email}")
        print(f"DEBUG: Initial update_data: {update_data}")

        if "password" in update_data:
            hashed_password = security.get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        
        # Security: DO NOT allow bulk updating these sensitive fields via /me
        # These should only be changed via specialized endpoints like handleBecomeExpert
        sensitive_fields = ["is_expert", "is_superuser", "is_active", "is_verified", "subscription_tier"]
        for field in sensitive_fields:
            if field in update_data:
                print(f"WARNING: Attempted to update sensitive field '{field}' via /auth/me - Blocked.")
                del update_data[field]

        # Handle JSON fields serialization
        json_fields = ["education_info", "experience_info", "languages", "social_links"]
        for field in json_fields:
            if field in update_data and update_data[field]:
                update_data[field] = [
                    item if isinstance(item, dict) else (item.dict() if hasattr(item, 'dict') else item) 
                    for item in update_data[field]
                ]
            
        print(f"DEBUG: Final filtered update_data: {update_data}")
            
        for field, value in update_data.items():
            # Extra safety: Don't overwrite existing data with None if it's unset in a partial update
            # This handles cases where unset optional fields might come through as None
            if value is not None or field == "profile_picture_url": 
                setattr(current_user, field, value)
        
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        error_msg = f"Profile Update Error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

