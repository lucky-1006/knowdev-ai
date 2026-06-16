from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ai import AIService

router = APIRouter(prefix="/api/code", tags=["code-generation"])

class CodeGenerateRequest(BaseModel):
    prompt: str
    context: Optional[str] = None

class CommitMessageRequest(BaseModel):
    diff: str

class SprintPlanRequest(BaseModel):
    repo_name: str
    goals: str
    weeks: Optional[int] = 2

class DependencyScanRequest(BaseModel):
    requirements_txt: Optional[str] = ""
    package_json: Optional[str] = ""

class ArchitectureRequest(BaseModel):
    repo_name: str

@router.post("/generate")
async def generate_code(request: CodeGenerateRequest, db: Session = Depends(get_db)):
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    try:
        ai = AIService()
        code = ai.generate_code(
            prompt=request.prompt,
            context=request.context
        )
        return {
            "generated_code": code
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Code generation failed: {str(e)}"
        )

@router.post("/commit-message")
async def generate_commit_message(request: CommitMessageRequest, db: Session = Depends(get_db)):
    try:
        ai = AIService()
        msg = ai.generate_commit_message(request.diff)
        return {
            "commit_message": msg
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate commit message: {str(e)}"
        )

@router.post("/sprint-plan")
async def generate_sprint_plan(request: SprintPlanRequest, db: Session = Depends(get_db)):
    if not request.repo_name or not request.goals:
        raise HTTPException(status_code=400, detail="Repo name and goals are required")
    try:
        ai = AIService()
        plan = ai.generate_sprint_plan(request.repo_name, request.goals, request.weeks)
        return plan
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate sprint plan: {str(e)}"
        )

@router.post("/scan-dependencies")
async def scan_dependencies(request: DependencyScanRequest, db: Session = Depends(get_db)):
    try:
        ai = AIService()
        vulns = ai.scan_dependencies(request.requirements_txt, request.package_json)
        return {
            "vulnerabilities": vulns
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dependency scan failed: {str(e)}"
        )

@router.post("/architecture")
async def generate_architecture_diagram(request: ArchitectureRequest, db: Session = Depends(get_db)):
    if not request.repo_name:
        raise HTTPException(status_code=400, detail="Repo name is required")
    try:
        ai = AIService()
        diagram = ai.generate_architecture_diagram(request.repo_name)
        return {
            "diagram": diagram
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate architecture diagram: {str(e)}"
        )

