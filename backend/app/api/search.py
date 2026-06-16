from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.db.session import get_db
from app.models.repository import Repository
from app.services.rag import RAGService

router = APIRouter(prefix="/api/search", tags=["search"])

class SearchRequest(BaseModel):
    query: str
    repository_url: Optional[str] = None
    limit: Optional[int] = 3

class SearchMatch(BaseModel):
    score: float
    file_path: str
    chunk_text: str
    chunk_index: int

class SearchResponse(BaseModel):
    query: str
    matches: List[SearchMatch]

@router.post("", response_model=SearchResponse)
async def semantic_search(request: SearchRequest, db: Session = Depends(get_db)):
    if not request.query:
        raise HTTPException(status_code=400, detail="Search query is required")

    repo_id = None
    if request.repository_url:
        repo = db.query(Repository).filter(Repository.url == request.repository_url).first()
        if repo:
            repo_id = repo.id

    try:
        rag = RAGService()
        matches = rag.search_semantic_matches(
            query=request.query,
            repository_id=repo_id,
            limit=request.limit or 3
        )
        return {
            "query": request.query,
            "matches": matches
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic search failed: {str(e)}"
        )
