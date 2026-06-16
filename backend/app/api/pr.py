from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from app.db.session import get_db
from app.models.review import PRReview
from app.models.repository import Repository
from app.services.pr import PRReviewService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/pr", tags=["pull-request"])

class PRReviewRequest(BaseModel):
    pr_url: str

@router.post("/review")
async def review_pr(
    request: PRReviewRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not request.pr_url:
        raise HTTPException(status_code=400, detail="PR URL is required")
        
    service = PRReviewService()
    try:
        # Before executing, ensure the repository exists and belongs to the user
        # parse repo_url out of PR URL (e.g. https://github.com/owner/repo/pull/1 -> github.com/owner/repo)
        url_part = request.pr_url.split("/pull/")[0]
        repo_host_path = url_part.replace("https://", "").replace("http://", "")
        repo = db.query(Repository).filter(
            Repository.url.like(f"%{repo_host_path}%"),
            Repository.user_id == current_user.id
        ).first()
        
        if not repo:
            # Dynamically auto-provision repo record if it doesn't exist
            repo_name = repo_host_path.split("/")[-1]
            repo = Repository(
                user_id=current_user.id,
                name=repo_name,
                url=url_part,
                scan_status="completed"
            )
            db.add(repo)
            db.commit()
            db.refresh(repo)

        result = service.review_pull_request(request.pr_url, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze PR: {str(e)}")

@router.get("/review")
async def get_pr_review(
    pr_url: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves cached findings for a specific PR URL.
    """
    findings = db.query(PRReview).join(Repository).filter(
        PRReview.pr_url == pr_url,
        Repository.user_id == current_user.id
    ).all()
    
    if not findings:
        raise HTTPException(status_code=404, detail="PR review findings not found for this URL")
        
    latest_item = findings[0]
    has_high_security = any(f.category == "security" and f.severity == "high" for f in findings)
    overall_status = "changes_requested" if has_high_security or len(findings) > 2 else "approved"
    
    return {
        "pr_url": latest_item.pr_url,
        "pr_title": latest_item.pr_title or "Pull Request Review",
        "pr_author": latest_item.pr_author or "github-user",
        "additions": latest_item.additions or 0,
        "deletions": latest_item.deletions or 0,
        "files_changed": latest_item.files_changed or 0,
        "overall_status": overall_status,
        "findings": [
            {
                "file": r.file_path,
                "line": r.line_number,
                "category": r.category,
                "severity": r.severity,
                "issue": r.issue_description,
                "code_before": r.code_before,
                "code_after": r.code_after
            } for r in findings
        ]
    }

@router.get("/latest")
async def get_latest_review(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the most recent PR review findings from the database.
    """
    latest_item = db.query(PRReview).join(Repository).filter(
        Repository.user_id == current_user.id
    ).order_by(PRReview.created_at.desc()).first()
    
    if not latest_item:
        raise HTTPException(status_code=404, detail="No PR reviews found in the database")
        
    # Get all findings for that PR URL
    findings = db.query(PRReview).join(Repository).filter(
        PRReview.pr_url == latest_item.pr_url,
        Repository.user_id == current_user.id
    ).all()
    
    has_high_security = any(f.category == "security" and f.severity == "high" for f in findings)
    overall_status = "changes_requested" if has_high_security or len(findings) > 2 else "approved"
    
    return {
        "pr_url": latest_item.pr_url,
        "pr_title": latest_item.pr_title or "Pull Request Review",
        "pr_author": latest_item.pr_author or "github-user",
        "additions": latest_item.additions or 0,
        "deletions": latest_item.deletions or 0,
        "files_changed": latest_item.files_changed or 0,
        "overall_status": overall_status,
        "findings": [
            {
                "file": r.file_path,
                "line": r.line_number,
                "category": r.category,
                "severity": r.severity,
                "issue": r.issue_description,
                "code_before": r.code_before,
                "code_after": r.code_after
            } for r in findings
        ]
    }

@router.get("/history")
async def get_review_history(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Returns a distinct list of historically reviewed pull requests.
    """
    subq = db.query(
        PRReview.pr_url,
        func.max(PRReview.created_at).label("max_created")
    ).group_by(PRReview.pr_url).subquery()
    
    history_items = db.query(PRReview).join(Repository).filter(
        Repository.user_id == current_user.id
    ).join(
        subq,
        (PRReview.pr_url == subq.c.pr_url) & (PRReview.created_at == subq.c.max_created)
    ).group_by(PRReview.pr_url).order_by(PRReview.created_at.desc()).all()
    
    return [
        {
            "pr_url": r.pr_url,
            "pr_title": r.pr_title or "Reviewed Pull Request",
            "pr_author": r.pr_author or "github-user",
            "created_at": r.created_at.isoformat(),
            "files_changed": r.files_changed or 0,
            "additions": r.additions or 0,
            "deletions": r.deletions or 0
        } for r in history_items
    ]

