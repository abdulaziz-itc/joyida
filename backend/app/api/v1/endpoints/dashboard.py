from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from app.db.session import get_db
from app.api import deps
from app.models.user import User as UserModel
from app.models.project import Project as ProjectModel

router = APIRouter()

@router.get("/stats")
async def get_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user)
) -> Dict[str, Any]:
    """Get real platform and personal stats."""
    total_users_count = db.query(UserModel).count()
    my_projects_count = db.query(ProjectModel).filter(ProjectModel.owner_id == current_user.id).count()
    
    return {
        "total_users": {"value": f"{total_users_count}", "trend": "+0%", "is_positive": True},
        "revenue": {"value": "$0.00", "trend": "+0%", "is_positive": True},
        "active_projects": {"value": f"{my_projects_count}", "trend": "+0%", "is_positive": True},
        "conversion_rate": {"value": "0.0%", "trend": "+0%", "is_positive": True},
    }

@router.get("/analytics")
async def get_analytics(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user)
) -> List[Dict[str, Any]]:
    """Get basic project growth data (simplified for now)."""
    # For now returning zeroed out monthly data until we aggregate real history
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
    return [{"name": m, "users": 0, "revenue": 0} for m in months]

@router.get("/activity")
async def get_activity(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user)
) -> List[Dict[str, Any]]:
    """Get real recent activity for the user's projects."""
    recent_projects = db.query(ProjectModel).filter(
        ProjectModel.owner_id == current_user.id
    ).order_by(ProjectModel.created_at.desc()).limit(5).all()
    
    activities = []
    for p in recent_projects:
        activities.append({
            "user": current_user.full_name or "You",
            "action": f"created project '{p.title}'",
            "time": "recent"
        })
    
    if not activities:
         activities.append({
            "user": "System",
            "action": "Welcome to Joyida! Your activity will appear here.",
            "time": "now"
        })
        
    return activities
