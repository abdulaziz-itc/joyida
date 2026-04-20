from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from app.db.session import get_db, SessionLocal
from app.api import deps
from app.models.user import User
from app.models.project import Project as ProjectModel, ProjectLike
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
    background_tasks: BackgroundTasks = None,
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
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
    
    try:
        projects = query.order_by(ProjectModel.created_at.desc()).offset(skip).limit(limit).all()
        
        # Mark liked status for returned projects
        liked_project_ids = set()
        if current_user:
            liked_project_ids = {
                lp.project_id for lp in db.query(ProjectLike.project_id)
                .filter(ProjectLike.user_id == current_user.id)
                .all()
            }

        for project in projects:
            project.is_liked = project.id in liked_project_ids
        
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
    except Exception as e:
        print(f"Public projects error: {str(e)}")
        # If the query fails (e.g. schema mismatch), return whatever projects we can find without filtering
        return db.query(ProjectModel).limit(limit).all()

@router.post("/", response_model=Project)
def create_project(
    *,
    db: Session = Depends(get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(deps.get_current_user),
    background_tasks: BackgroundTasks,
) -> Any:
    """Create new project."""
    # Check for duplicates (same URL for same user)
    existing = db.query(ProjectModel).filter(
        ProjectModel.owner_id == current_user.id,
        ProjectModel.video_url == project_in.video_url
    ).first()
    if existing:
        return existing

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
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Toggle like for a project."""
    project = db.query(ProjectModel).filter(ProjectModel.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    like = db.query(ProjectLike).filter(
        ProjectLike.user_id == current_user.id,
        ProjectLike.project_id == id
    ).first()
    
    if like:
        db.delete(like)
        project.likes_count = max(0, (project.likes_count or 1) - 1)
        is_liked = False
    else:
        new_like = ProjectLike(user_id=current_user.id, project_id=id)
        db.add(new_like)
        project.likes_count = (project.likes_count or 0) + 1
        is_liked = True
        
    db.commit()
    db.refresh(project)
    project.is_liked = is_liked
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

@router.get("/by-hash/{h}", response_model=Project)
def get_project_by_hash(
    h: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(deps.get_current_user_optional)
) -> Any:
    """Retrieve a single project by its hashed ID."""
    from app.api.v1.endpoints.utils import decode_id
    try:
        project_id = decode_id(h)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project hash")
        
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Mark liked status if user is logged in
    project.is_liked = False
    if current_user:
        like = db.query(ProjectLike).filter(
            ProjectLike.user_id == current_user.id,
            ProjectLike.project_id == project.id
        ).first()
        project.is_liked = like is not None
        
    return project
