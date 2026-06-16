from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.db.session import get_db
from app.models.chat import ChatHistory
from app.models.repository import Repository
from app.services.rag import RAGService
from app.services.ai import AIService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatMessageSchema(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessageSchema]
    repository_url: Optional[str] = None

@router.post("")
async def chat(
    request: ChatRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty")
    
    user_msg = request.messages[-1].content
    repo_id = None
    
    # 1. Fetch Repository record if URL is provided
    if request.repository_url:
        repo = db.query(Repository).filter(
            Repository.url == request.repository_url,
            Repository.user_id == current_user.id
        ).first()
        if repo:
            repo_id = repo.id

    # 2. Store user message in database
    db_user_msg = ChatHistory(
        user_id=current_user.id, 
        repository_id=repo_id, 
        role="user", 
        content=user_msg
    )
    db.add(db_user_msg)
    db.commit()

    # 3. Retrieve RAG Context (Semantic Search matches in Qdrant)
    context_str = ""
    if repo_id:
        try:
            rag = RAGService()
            matches = rag.search_semantic_matches(query=user_msg, repository_id=repo_id, limit=2)
            if matches:
                context_str = "\n\n".join([
                    f"--- Context File: {m['file_path']} ---\n{m['chunk_text']}"
                    for m in matches
                ])
                print(f"RAG Context retrieved for query: '{user_msg}' ({len(matches)} matches)")
        except Exception as e:
            print(f"RAG search failed in chat query: {str(e)}. Proceeding without context.")

    # 4. Generate AI response using AIService
    try:
        ai = AIService()
        # If context is found, it will append it to prompt
        ai_response = ai.generate_code(prompt=user_msg, context=context_str if context_str else None)
    except Exception as e:
        ai_response = f"AI Inference failed: {str(e)}"

    # 5. Store AI response in database
    db_ai_msg = ChatHistory(
        user_id=current_user.id, 
        repository_id=repo_id, 
        role="assistant", 
        content=ai_response
    )
    db.add(db_ai_msg)
    db.commit()

    return {"response": ai_response}

@router.get("/history")
async def get_chat_history(
    repository_url: Optional[str] = None, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id)
    if repository_url:
        repo = db.query(Repository).filter(
            Repository.url == repository_url,
            Repository.user_id == current_user.id
        ).first()
        if repo:
            query = query.filter(ChatHistory.repository_id == repo.id)
    
    history = query.order_by(ChatHistory.created_at.asc()).all()
    return [{"role": h.role, "content": h.content, "timestamp": h.created_at} for h in history]

