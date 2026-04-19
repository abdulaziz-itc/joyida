from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from app.db.session import get_db, SessionLocal
from app.api import deps
from app.models.user import User
from app.models.project import Project as ProjectModel
from app.schemas.project import Project, ProjectCreate, ProjectUpdate
from app.services.video_downloader import download_social_video

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
    limit: int = 20,
    search: Optional[str] = None,
    background_tasks: BackgroundTasks = None
) -> Any:
    """Retrieve all public projects with proactive auto-downloader."""
    query = db.query(ProjectModel).filter(ProjectModel.is_public == True)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ProjectModel.title.ilike(search_filter)) | 
            (ProjectModel.description.ilike(search_filter)) |
            (ProjectModel.category.ilike(search_filter))
        )
    
    projects = query.order_by(ProjectModel.created_at.desc()).offset(skip).limit(limit).all()
    
    # Proactive auto-downloader
    if background_tasks:
        for project in projects:
            # If it looks like a social link and isn't downloaded, trigger it
            if not project.is_downloaded and project.video_url and ('http' in project.video_url):
                 # Verify it's actually a social platform we support
                 url_low = project.video_url.lower()
                 if any(x in url_low for x in ['instagram.com', 'instagr.am', 'tiktok.com', 'youtube.com', 'youtu.be']):
                     print(f"DEBUG: Proactive trigger for project {project.id}")
                     background_tasks.add_task(download_social_video, project.id, SessionLocal)

    return projects

@router.post("/", response_model=Project)
def create_project(
    *,
    db: Session = Depends(get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(deps.get_current_user),
    background_tasks: BackgroundTasks,
) -> Any:
    """Create new project."""
    project = ProjectModel(**project_in.dict(), owner_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # If the URL is a social media link, trigger background download
    url = project.video_url
    if url:
        url_lower = url.lower()
        is_social = any(x in url_lower for x in [
            'instagram.com', 'instagr.am', 
            'tiktok.com', 'vm.tiktok.com', 
            'youtube.com', 'youtu.be'
        ])
        if is_social:
            background_tasks.add_task(download_social_video, project.id, SessionLocal)
        
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

@router.post("/{id}/like", response_model=Project)
def like_project(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """Increment likes for a project."""
    project = db.query(ProjectModel).filter(ProjectModel.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.likes_count += 1
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.post("/{id}/view", response_model=Project)
def view_project(
    *,
    db: Session = Depends(get_db),
    id: int,
) -> Any:
    """Increment views for a project."""
    project = db.query(ProjectModel).filter(ProjectModel.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.views_count += 1
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
