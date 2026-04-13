from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

@router.get("/stats")
async def get_stats() -> Dict[str, Any]:
    return {
        "total_users": {"value": "67.4k", "trend": "+12%", "is_positive": True},
        "revenue": {"value": "$1.2M", "trend": "+24%", "is_positive": True},
        "active_projects": {"value": "815", "trend": "-3%", "is_positive": False},
        "conversion_rate": {"value": "4.8%", "trend": "+7%", "is_positive": True},
    }

@router.get("/analytics")
async def get_analytics() -> List[Dict[str, Any]]:
    return [
        {"name": "Jan", "users": 4000, "revenue": 2400},
        {"name": "Feb", "users": 3000, "revenue": 1398},
        {"name": "Mar", "users": 2000, "revenue": 9800},
        {"name": "Apr", "users": 2780, "revenue": 3908},
        {"name": "May", "users": 1890, "revenue": 4800},
        {"name": "Jun", "users": 2390, "revenue": 3800},
        {"name": "Jul", "users": 3490, "revenue": 4300},
    ]

@router.get("/activity")
async def get_activity() -> List[Dict[str, Any]]:
    return [
        {"user": "Sarah L.", "action": "logged in", "time": "5m ago"},
        {"user": "Mark S.", "action": "created project", "time": "12m ago"},
        {"user": "Sarah L.", "action": "logged in Worknate", "time": "5m ago"},
    ]
