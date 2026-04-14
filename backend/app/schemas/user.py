from typing import Optional, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    is_expert: bool = False
    profession: Optional[str] = None
    birth_year: Optional[int] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None
    workplace: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    service_location_name: Optional[str] = None
    profile_completed: bool = False
    profile_picture_url: Optional[str] = None
    is_verified: bool = False
    verification_status: str = "unverified"
    verification_data: Optional[Any] = None

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
    pass

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None

class ServiceCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class ServiceCategory(ServiceCategoryBase):
    id: int

    class Config:
        from_attributes = True
