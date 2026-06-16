from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class PRReview(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    repository_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=True)
    pr_url = Column(String, index=True, nullable=False)
    file_path = Column(String, nullable=False)
    line_number = Column(Integer, nullable=False)
    issue_description = Column(Text, nullable=False)
    severity = Column(String, nullable=False)  # high, medium, low
    category = Column(String, default="quality", nullable=False)  # security, quality, performance
    code_before = Column(Text, nullable=True)
    code_after = Column(Text, nullable=True)
    pr_title = Column(String, nullable=True)
    pr_author = Column(String, nullable=True)
    additions = Column(Integer, default=0, nullable=True)
    deletions = Column(Integer, default=0, nullable=True)
    files_changed = Column(Integer, default=0, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    repository = relationship("Repository", back_populates="reviews")

