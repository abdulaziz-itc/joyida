from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core import security
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.user import Token
from typing import Any

router = APIRouter()

# Replace this with your Google Client IDs (Mobile and Web)
GOOGLE_CLIENT_IDS = [
    "596799584146-jjskref39n0lr9h3lcn26fre9kifmgje.apps.googleusercontent.com", # Android
    "596799584146-vfqh5kfpr3imiq7evjaq6e5pifuhcfci.apps.googleusercontent.com", # Web
    "596799584146-dpfasrdl6nh1km2ifma4k3ko7hqrlbds.apps.googleusercontent.com", # iOS
]

@router.post("/google", response_model=Token)
async def google_login(
    *,
    db: Session = Depends(get_db),
    token_obj: dict, # Expecting {"idToken": "..."}
) -> Any:
    id_token_str = token_obj.get("idToken")
    if not id_token_str:
        raise HTTPException(status_code=400, detail="ID Token missing")

    try:
        # Verify the ID token
        id_info = id_token.verify_oauth2_token(
            id_token_str, requests.Request(), GOOGLE_CLIENT_IDS[0]
        )

        # ID token is valid. Get user info
        email = id_info.get("email")
        full_name = id_info.get("name")

        # Check if user exists, else create
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            user = UserModel(
                email=email,
                full_name=full_name,
                hashed_password=security.get_password_hash(security.create_access_token(email)), # Dummy password for social users
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Generate JWT
        access_token_expires = security.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": security.create_access_token(
                user.id, expires_delta=access_token_expires
            ),
            "token_type": "bearer",
        }
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")
