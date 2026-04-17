import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
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
    "596799584146-jjskref39n0lr9h3lcn26fre9kifmgje.apps.googleusercontent.com", # Old Android
    "596799584146-vfqh5kfpr3imiq7evjaq6e5pifuhcfci.apps.googleusercontent.com", # Old Web
    "596799584146-dpfasrdl6nh1km2ifma4k3ko7hqrlbds.apps.googleusercontent.com", # iOS
    "492033662946-lbv7j6sm3bobjkv7hlhf7aa43jfpemgj.apps.googleusercontent.com", # New Android
    "492033662946-ilfn30ltnllvasg8no0622ragvnlk86j.apps.googleusercontent.com", # New Web/Server
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

    id_info = None
    last_error = None
    
    # Try verifying the token against all known Client IDs
    for client_id in GOOGLE_CLIENT_IDS:
        try:
            id_info = id_token.verify_oauth2_token(
                id_token_str, requests.Request(), client_id
            )
            # If successful, break the loop
            if id_info:
                break
        except Exception as e:
            last_error = str(e)
            continue

    if not id_info:
        # If verification failed for all IDs
        raise HTTPException(
            status_code=401, 
            detail=f"Invalid Google token. Error: {last_error}"
        )

    try:
        # ID token is valid. Get user info
        email = id_info.get("email")
        full_name = id_info.get("name")

        # Check if user exists, else create
        user = db.query(UserModel).filter(UserModel.email == email).first()
        is_new_user = False
        if not user:
            is_new_user = True
            user = UserModel(
                email=email,
                full_name=full_name,
                hashed_password=security.get_password_hash(os.urandom(24).hex()), # Secure random dummy password for social users
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Generate JWT
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "access_token": security.create_access_token(
                user.id, expires_delta=access_token_expires
            ),
            "token_type": "bearer",
            "is_new_user": is_new_user,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
