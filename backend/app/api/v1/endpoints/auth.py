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
    }

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
    update_data = user_in.dict(exclude_unset=True)
    if "password" in update_data:
        hashed_password = security.get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["hashed_password"] = hashed_password
    
    # Handle JSON fields serialization
    if "education_info" in update_data and update_data["education_info"]:
        update_data["education_info"] = [item if isinstance(item, dict) else item.dict() for item in update_data["education_info"]]
    if "experience_info" in update_data and update_data["experience_info"]:
        update_data["experience_info"] = [item if isinstance(item, dict) else item.dict() for item in update_data["experience_info"]]
    if "languages" in update_data and update_data["languages"]:
        update_data["languages"] = [item if isinstance(item, dict) else item.dict() for item in update_data["languages"]]
    if "social_links" in update_data and update_data["social_links"]:
        update_data["social_links"] = [item if isinstance(item, dict) else item.dict() for item in update_data["social_links"]]
        
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

