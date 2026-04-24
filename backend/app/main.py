from fastapi import FastAPI, APIRouter, Request, Response, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.session import get_db
import os
import traceback
import logging

# Setup robust path for logging
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_DIR = os.path.join(BASE_DIR, "tmp")
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR, exist_ok=True)

LOG_FILE = os.path.join(LOG_DIR, "error.log")

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.ERROR,
    format='%(asctime)s %(levelname)s %(name)s %(message)s'
)
logger = logging.getLogger(__name__)
from app.api.v1.endpoints import auth, google_auth, dashboard, projects, experts, chat, bookings, admin, payments, reviews, notifications, utils, user_assets

app = FastAPI(
    title="Joyida API",
    description="Backend API for Joyida Mobile and Web applications",
    version="1.0.0",
)

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"Unhandled Exception: {e}\n{error_trace}")
        return Response(f"Internal Server Error: {str(e)}\n{error_trace}", status_code=500)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://joida.uz",
        "https://www.joida.uz",
        "https://backend.joida.uz"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(google_auth.router, prefix="/google-auth", tags=["google-auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(experts.router, prefix="/experts", tags=["experts"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(user_assets.router, prefix="/user-assets", tags=["user-assets"])
app.include_router(api_router, prefix="/api/v1")

# High-Security Short Media Router (Obfuscation)
@app.get("/m/v/{h}")
@app.get("/m/t/{h}")
@app.get("/m/d/{h}")
def short_media_proxy(h: str, request: Request, db: Session = Depends(get_db)):
    """Decode hash and proxy to internal media logic."""
    from app.api.v1.endpoints.utils import decode_id, view_reel, view_thumb, download_reel
    from fastapi import HTTPException
    try:
        project_id = decode_id(h)
        path = request.url.path
        if "/m/v/" in path:
            return view_reel(project_id, db)
        elif "/m/t/" in path:
            return view_thumb(project_id, db)
        elif "/m/d/" in path:
            return download_reel(project_id, db)
    except HTTPException as e:
        # Re-raise internal HTTP exceptions (like 404 Video not found)
        raise e
    except Exception as e:
        logger.error(f"Media Proxy Critical Error: {str(e)}")
        raise HTTPException(status_code=404, detail="Media resolution failed")

# Serve static files with robust absolute path discovery
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static", "uploads")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, mode=0o755, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=STATIC_DIR), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Joyida API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/diagnostics")
def debug_database(db: Session = Depends(get_db)):
    """Diagnostic endpoint to verify database schema matches expectation."""
    from sqlalchemy import inspect
    inspector = inspect(db.bind)
    columns = inspector.get_columns("users")
    column_names = [c["name"] for c in columns]
    expected_new_fields = ["first_name", "last_name", "phone_number", "bio", "headline", "skills"]
    missing_fields = [f for f in expected_new_fields if f not in column_names]
    
    return {
        "status": "ready" if not missing_fields else "incomplete_migration",
        "current_columns": column_names,
        "missing_new_fields": missing_fields,
        "sqlite_db_path": str(db.bind.url)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
