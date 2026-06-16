import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database and configs
from app.config import settings
from app.db.base import Base
from app.db.session import engine

# Import all models to ensure they are registered on Base before metadata creation
from app.models.user import User
from app.models.repository import Repository
from app.models.chat import ChatHistory
from app.models.review import PRReview
from app.models.document import Document
from app.models.embeddings_metadata import EmbeddingsMetadata

# Routers
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.repo import router as repo_router
from app.api.pr import router as pr_router
from app.api.docs import router as docs_router
from app.api.code import router as code_router
from app.api.search import router as search_router
from app.mcp_server import mcp_server


# Auto-create all database tables on application boot (if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="knowDev AI API",
    description="Backend API for knowDev AI Software Engineering Assistant",
    version="0.2.1"
)

# Mount MCP SSE Server
app.mount("/mcp", mcp_server.sse_app())

# CORS configuration for frontend Next.js communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(repo_router)
app.include_router(pr_router)
app.include_router(docs_router)
app.include_router(code_router)
app.include_router(search_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to knowDev AI API. Modular Backend Setup is active.",
        "database": settings.DATABASE_URL.split(":///")[0],
        "local_inference": settings.LOCAL_INFERENCE
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
