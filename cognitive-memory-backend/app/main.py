from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import init_db
from app.routers import memory

settings = get_settings()

# Create FastAPI application
app = FastAPI(
    title="COG-6 Cognitive Memory API",
    description="Backend service for extracting and storing cognitive memories",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(memory.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("[INFO] Database initialized")
    print(f"[INFO] API Key configured: {settings.openrouter_api_key[:20]}...")
    print(f"[INFO] Using model: {settings.openrouter_model}")


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "cognitive-memory-backend",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "COG-6 Cognitive Memory API",
        "docs": "/docs",
        "health": "/api/health"
    }
