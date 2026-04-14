from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, google_auth, dashboard, projects, experts, chat, bookings, admin, payments, reviews, notifications, utils

app = FastAPI(
    title="Joyida API",
    description="Backend API for Joyida Mobile and Web applications",
    version="1.0.0",
)

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
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Joyida API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
