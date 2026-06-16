from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Repository(Base):
    __tablename__ = "repositories"
    __table_args__ = (UniqueConstraint('user_id', 'url', name='_user_repo_uc'),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String, index=True, nullable=False)
    url = Column(String, index=True, nullable=False)
    health_score = Column(Integer, default=100)
    code_smells = Column(Integer, default=0)
    security_issues = Column(Integer, default=0)
    doc_coverage = Column(Float, default=0.0)
    test_coverage = Column(Float, default=0.0)
    scan_status = Column(String, default="pending")  # pending, indexing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="repositories")
    documents = relationship("Document", back_populates="repository", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="repository", cascade="all, delete-orphan")
    reviews = relationship("PRReview", back_populates="repository", cascade="all, delete-orphan")

