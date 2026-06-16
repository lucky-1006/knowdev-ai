from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.repository import Repository
from app.services.docs import DocsService

router = APIRouter(prefix="/api/docs", tags=["documentation"])

class DocGenerateRequest(BaseModel):
    repository_url: str
    doc_type: str  # README, API, Architecture, Comments

@router.post("/generate")
async def generate_docs(request: DocGenerateRequest, db: Session = Depends(get_db)):
    if not request.repository_url:
        raise HTTPException(status_code=400, detail="Repository URL is required")

    # Fetch repo from DB
    repo = db.query(Repository).filter(Repository.url == request.repository_url).first()
    if not repo:
        # Create repository entry placeholder if not existing
        repo_name = request.repository_url.split("/")[-1]
        repo = Repository(name=repo_name, url=request.repository_url, scan_status="completed")
        db.add(repo)
        db.commit()
        db.refresh(repo)

    try:
        service = DocsService()
        content = service.generate_documentation(
            repository_id=repo.id,
            doc_type=request.doc_type,
            db=db
        )
        return {
            "doc_type": request.doc_type,
            "content": content
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Documentation generation failed: {str(e)}"
        )
