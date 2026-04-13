from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Any
import math

from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.user import User as UserSchema
from app.api import deps

router = APIRouter()

def haversine(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points in km."""
    R = 6371  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2)**2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2)**2)
    c = 2 * math.asin(math.sqrt(a))
    return R * c

@router.get("/nearby", response_model=List[UserSchema])
def get_nearby_experts(
    *,
    db: Session = Depends(get_db),
    lat: float = Query(...),
    lon: float = Query(...),
    radius: float = Query(5.0, description="Radius in km"),
    category: str = Query(None),
) -> Any:
    """Find experts nearby using Bounding Box + Haversine calculation."""
    
    # 1. Calculate Bounding Box (rough approximation)
    # 1 degree lat is approx 111km
    lat_delta = radius / 111.0
    # 1 degree lon depends on latitude
    lon_delta = radius / (111.0 * math.cos(math.radians(lat)))
    
    min_lat, max_lat = lat - lat_delta, lat + lat_delta
    min_lon, max_lon = lon - lon_delta, lon + lon_delta
    
    # 2. Query with Bounding Box and Basic Filters
    query = db.query(UserModel).filter(
        and_(
            UserModel.is_expert == True,
            UserModel.latitude.between(min_lat, max_lat),
            UserModel.longitude.between(min_lon, max_lon)
        )
    ).order_by(UserModel.subscription_tier.desc())
    
    if category:
        query = query.filter(UserModel.profession == category)
        
    experts = query.all()
    
    # 3. Precise Filtering and Sorting by Distance
    nearby_experts = []
    for expert in experts:
        dist = haversine(lat, lon, expert.latitude, expert.longitude)
        if dist <= radius:
            # We can't easily add a field to a Pydantic model response from SQL row 
            # without a custom schema, but for now we'll just return the experts.
            nearby_experts.append(expert)
            
    # Sort by distance (if we had the distance field)
    # nearby_experts.sort(key=lambda x: haversine(lat, lon, x.latitude, x.longitude))
    
    return nearby_experts
