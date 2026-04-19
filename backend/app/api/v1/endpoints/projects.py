from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.models.project import Project as ProjectModel
from app.schemas.project import Project, ProjectCreate, ProjectUpdate

router = APIRouter()

@router.get("/", response_model=List[Project])
def read_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve projects."""
    projects = db.query(ProjectModel).filter(ProjectModel.owner_id == current_user.id).offset(skip).limit(limit).all()
    return projects

@router.get("/public", response_model=List[Project])
def read_public_projects(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
) -> Any:
    """Retrieve all public projects (for Reels)."""
    query = db.query(ProjectModel)
    if search:
        query = query.filter(
            (ProjectModel.title.ilike(f"%{search}%")) | 
            (ProjectModel.description.ilike(f"%{search}%")) |
            (ProjectModel.category.ilike(f"%{search}%"))
        )
    projects = query.offset(skip).limit(limit).all()
    return projects

@router.post("/", response_model=Project)
def create_project(
    *,
    db: Session = Depends(get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Create new project."""
    project = ProjectModel(**project_in.dict(), owner_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.put("/{id}", response_model=Project)
def update_project(
    *,
    db: Session = Depends(get_db),
    id: int,
    project_in: ProjectUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Update a project."""
    project = db.query(ProjectModel).filter(ProjectModel.id == id, ProjectModel.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{id}", response_model=Project)
def delete_project(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Delete a project."""
    project = db.query(ProjectModel).filter(ProjectModel.id == id, ProjectModel.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return project
