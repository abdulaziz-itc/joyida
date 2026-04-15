from fastapi import FastAPI, APIRouter, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import traceback
import logging

# Setup absolute path for logging in production
LOG_FILE = "/home/joidauz/backend/tmp/error.log"

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
        logger.error(f"Unhandled Exception: {e}\n{traceback.format_exc()}")
        return Response("Internal Server Error", status_code=500)

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

# Serve static files with robust path discovery
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static", "uploads")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=STATIC_DIR), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Joyida API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
