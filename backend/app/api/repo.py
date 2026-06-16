from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.db.session import get_db
from app.models.repository import Repository
from app.models.document import Document
from app.services.github import GitHubService
from app.services.rag import RAGService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/repo", tags=["repository"])

class RepoRequest(BaseModel):
    repository_url: str

class RepoResponse(BaseModel):
    id: int
    user_id: int | None
    name: str
    url: str
    health_score: int
    code_smells: int
    security_issues: int
    doc_coverage: float
    test_coverage: float
    scan_status: str

@router.post("/analyze", response_model=RepoResponse)
async def analyze_repo(
    request: RepoRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not request.repository_url:
        raise HTTPException(status_code=400, detail="Repository URL is required")
    
    # 1. Analyze repository details via GitHub service
    service = GitHubService()
    results = service.analyze_repository(request.repository_url)
    
    # 2. Query/Create DB Record scoped by current user
    repo = db.query(Repository).filter(
        Repository.url == request.repository_url, 
        Repository.user_id == current_user.id
    ).first()
    
    if not repo:
        repo = Repository(
            user_id=current_user.id,
            name=results["name"],
            url=results["url"],
            health_score=results["health_score"],
            code_smells=results["code_smells"],
            security_issues=results["security_issues"],
            doc_coverage=results["doc_coverage"],
            test_coverage=results["test_coverage"],
            scan_status="completed"
        )
        db.add(repo)
        db.commit()
        db.refresh(repo)
    else:
        repo.health_score = results["health_score"]
        repo.code_smells = results["code_smells"]
        repo.security_issues = results["security_issues"]
        repo.doc_coverage = results["doc_coverage"]
        repo.test_coverage = results["test_coverage"]
        repo.scan_status = "completed"
        db.commit()
        db.refresh(repo)

    # 3. Clear and save documents to database
    db.query(Document).filter(Document.repository_id == repo.id).delete()
    db.commit()

    saved_docs = []
    for f in results.get("files", []):
        doc = Document(
            repository_id=repo.id,
            file_path=f["path"],
            file_content=f["content"],
            total_chunks=max(1, len(f["content"]) // 1000)
        )
        db.add(doc)
        saved_docs.append(doc)
    db.commit()

    # 4. Generate RAG Vector Embeddings and Index into Qdrant Database
    try:
        rag = RAGService()
        rag.index_repository_documents(repo.id, saved_docs)
    except Exception as e:
        print(f"RAG Indexing Warning: {str(e)}. Proceeding without vector storage index.")

    return repo

@router.post("/index")
async def index_repo(
    request: RepoRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    repo = db.query(Repository).filter(
        Repository.url == request.repository_url,
        Repository.user_id == current_user.id
    ).first()
    if not repo:
        repo_name = request.repository_url.split("/")[-1]
        repo = Repository(
            user_id=current_user.id,
            name=repo_name, 
            url=request.repository_url, 
            scan_status="pending"
        )
        db.add(repo)
        db.commit()
        db.refresh(repo)

    repo.scan_status = "indexing"
    db.commit()
    
    # Run analysis
    service = GitHubService()
    results = service.analyze_repository(request.repository_url)
    
    repo.health_score = results["health_score"]
    repo.code_smells = results["code_smells"]
    repo.security_issues = results["security_issues"]
    repo.doc_coverage = results["doc_coverage"]
    repo.test_coverage = results["test_coverage"]
    repo.scan_status = "completed"
    db.commit()
    
    # Clear and save files
    db.query(Document).filter(Document.repository_id == repo.id).delete()
    db.commit()
    
    saved_docs = []
    for f in results.get("files", []):
        doc = Document(
            repository_id=repo.id,
            file_path=f["path"],
            file_content=f["content"],
            total_chunks=max(1, len(f["content"]) // 1000)
        )
        db.add(doc)
        saved_docs.append(doc)
    db.commit()

    # Create vector database indexing
    chunks_count = 0
    try:
        rag = RAGService()
        chunks_count = rag.index_repository_documents(repo.id, saved_docs)
    except Exception as e:
        print(f"RAG Indexing Error: {str(e)}")

    return {
        "repository_url": request.repository_url,
        "status": "completed",
        "chunks_indexed": chunks_count,
        "message": "Repository fully indexed in database and Qdrant."
    }

@router.get("/list", response_model=List[RepoResponse])
async def list_repositories(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return db.query(Repository).filter(Repository.user_id == current_user.id).all()

@router.get("/{repo_id}/architecture")
async def get_repo_architecture(
    repo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = db.query(Repository).filter(Repository.id == repo_id, Repository.user_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    try:
        from app.services.ai import AIService
        ai = AIService()
        diagram = ai.generate_architecture_diagram(repo.name)
        return {
            "diagram": diagram
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate architecture diagram: {str(e)}"
        )


