from typing import Optional, Any, List
from pydantic import BaseModel, EmailStr
from datetime import datetime, date

# Professional profile structures
class EducationItem(BaseModel):
    type: str # bakalavr, kolledj, litsey
    institution: str
    specialization: str
    year: Optional[int] = None

class ExperienceItem(BaseModel):
    workplace: str
    position: str
    duration: str
    description: Optional[str] = None

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    patronymic: Optional[str] = None
    is_expert: bool = False
    profession: Optional[str] = None
    birth_year: Optional[int] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None
    education_info: Optional[List[EducationItem]] = None
    workplace: Optional[str] = None
    experience_info: Optional[List[ExperienceItem]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    service_location_name: Optional[str] = None
    profile_completed: bool = False
    profile_picture_url: Optional[str] = None
    is_verified: bool = False
    verification_status: str = "unverified"
    verification_data: Optional[Any] = None
    
    # Expert profile details
    hourly_rate: Optional[float] = None
    rating: float = 0.0
    review_count: int = 0


class UserImageBase(BaseModel):
    url: str
    is_main: bool = False

class UserImageCreate(UserImageBase):
    pass

class UserImage(UserImageBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    service_ids: Optional[list[int]] = []

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    images: list[UserImage] = []

class UserWithDistance(User):
    distance: Optional[float] = None

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    is_new_user: bool = False

class TokenPayload(BaseModel):
    sub: Optional[int] = None

class ServiceCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class ServiceCategory(ServiceCategoryBase):
    id: int

    class Config:
        from_attributes = True
