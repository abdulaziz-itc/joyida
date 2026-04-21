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
    """Get stats based on user role (Admin vs Expert)."""
    
    if current_user.is_superuser:
        # Admin gets global platform-wide stats
        total_users_count = db.query(UserModel).count()
        global_projects_count = db.query(ProjectModel).count()
        return {
            "is_admin": True,
            "total_users": {"value": f"{total_users_count}", "trend": "+0%", "is_positive": True},
            "revenue": {"value": "$0.00", "trend": "+0%", "is_positive": True},
            "active_projects": {"value": f"{global_projects_count}", "trend": "+0%", "is_positive": True},
            "conversion_rate": {"value": "0.0%", "trend": "+0%", "is_positive": True},
        }
    else:
        # Expert gets personal professional stats
        my_projects_count = db.query(ProjectModel).filter(ProjectModel.owner_id == current_user.id).count()
        
        # Calculate total views across all expert's projects
        total_views = db.query(func.sum(ProjectModel.views_count)).filter(
            ProjectModel.owner_id == current_user.id
        ).scalar() or 0
        
        return {
            "is_admin": False,
            "profile_views": {"value": f"{total_views}", "trend": "+0%", "is_positive": True},
            "revenue": {"value": "$0.00", "trend": "+0%", "is_positive": True},
            "active_projects": {"value": f"{my_projects_count}", "trend": "+0%", "is_positive": True},
            "rating": {"value": f"{current_user.rating or 0.0}", "trend": "+0%", "is_positive": True},
        }

@router.get("/analytics")
async def get_analytics(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user)
) -> List[Dict[str, Any]]:
    """Get growth data (simplified for now)."""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
    return [{"name": m, "users": 0, "revenue": 0} for m in months]

@router.get("/activity")
async def get_activity(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(deps.get_current_user)
) -> List[Dict[str, Any]]:
    """Get recent activity for the user's projects."""
    if current_user.is_superuser:
        # Admin sees global activity (limited to 5)
        recent_projects = db.query(ProjectModel).order_by(ProjectModel.created_at.desc()).limit(5).all()
    else:
        # Expert sees only their own activity
        recent_projects = db.query(ProjectModel).filter(
            ProjectModel.owner_id == current_user.id
        ).order_by(ProjectModel.created_at.desc()).limit(5).all()
    
    activities = []
    for p in recent_projects:
        # For admin, show who created it
        actor_name = p.owner.full_name if (current_user.is_superuser and p.owner) else "You"
        activities.append({
            "user": actor_name,
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
