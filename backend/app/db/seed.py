import sys
import os
from datetime import datetime

# Adjust Python Path to import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.repository import Repository
from app.models.document import Document
from app.models.chat import ChatHistory
from app.models.review import PRReview
from app.models.embeddings_metadata import EmbeddingsMetadata

def seed_db():
    print("Ensuring tables are created in PostgreSQL...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("Checking if seed data already exists...")
        # 1. User
        user = db.query(User).filter(User.username == "knowdev_dev").first()
        if not user:
            print("Creating seed User...")
            user = User(
                username="knowdev_dev",
                email="dev@knowdev.ai",
                clerk_id="user_clerk_dev_12345"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            print(f"Seed User already exists (ID: {user.id})")
            
        # 2. Repository
        repo = db.query(Repository).filter(Repository.url == "https://github.com/codepilot/demo-project").first()
        if not repo:
            print("Creating seed Repository...")
            repo = Repository(
                user_id=user.id,
                name="demo-project",
                url="https://github.com/codepilot/demo-project",
                health_score=92,
                code_smells=5,
                security_issues=1,
                doc_coverage=85.0,
                test_coverage=75.5,
                scan_status="completed"
            )
            db.add(repo)
            db.commit()
            db.refresh(repo)
        else:
            print(f"Seed Repository already exists (ID: {repo.id})")
            
        # 3. Documents
        docs = db.query(Document).filter(Document.repository_id == repo.id).all()
        if not docs:
            print("Creating seed Documents...")
            doc1 = Document(
                repository_id=repo.id,
                file_path="main.py",
                file_content="def hello_world():\n    print('Hello World')\n\nif __name__ == '__main__':\n    hello_world()",
                total_chunks=1
            )
            doc2 = Document(
                repository_id=repo.id,
                file_path="config.py",
                file_content="import os\nDATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/codepilot')",
                total_chunks=1
            )
            db.add_all([doc1, doc2])
            db.commit()
            db.refresh(doc1)
            db.refresh(doc2)
            docs = [doc1, doc2]
            print(f"Seed Documents created (Count: {len(docs)})")
        else:
            print(f"Seed Documents already exist (Count: {len(docs)})")
            
        # 4. Embeddings Metadata
        emb_meta = db.query(EmbeddingsMetadata).join(Document).filter(Document.repository_id == repo.id).all()
        if not emb_meta:
            print("Creating seed EmbeddingsMetadata...")
            meta1 = EmbeddingsMetadata(
                document_id=docs[0].id,
                vector_id="vec_main_chunk_0",
                chunk_index=0,
                payload_metadata={"file_path": "main.py", "lines": [1, 5]}
            )
            meta2 = EmbeddingsMetadata(
                document_id=docs[1].id,
                vector_id="vec_config_chunk_0",
                chunk_index=0,
                payload_metadata={"file_path": "config.py", "lines": [1, 2]}
            )
            db.add_all([meta1, meta2])
            db.commit()
            print("Seed EmbeddingsMetadata created.")
        else:
            print("Seed EmbeddingsMetadata already exists.")
            
        # 5. Chat History
        chats = db.query(ChatHistory).filter(ChatHistory.repository_id == repo.id).all()
        if not chats:
            print("Creating seed ChatHistory...")
            chat_user = ChatHistory(
                user_id=user.id,
                repository_id=repo.id,
                role="user",
                content="How does main.py call hello_world?"
            )
            chat_assistant = ChatHistory(
                user_id=user.id,
                repository_id=repo.id,
                role="assistant",
                content="In `main.py`, the function `hello_world()` is defined to print 'Hello World' and is invoked in the block `if __name__ == '__main__':` on execution."
            )
            db.add_all([chat_user, chat_assistant])
            db.commit()
            print("Seed ChatHistory created.")
        else:
            print("Seed ChatHistory already exists.")
            
        # 6. PR Reviews
        reviews = db.query(PRReview).filter(PRReview.repository_id == repo.id).all()
        if not reviews:
            print("Creating seed PRReview findings...")
            review1 = PRReview(
                repository_id=repo.id,
                pr_url="https://github.com/codepilot/demo-project/pull/1",
                file_path="main.py",
                line_number=2,
                issue_description="Print statement could be replaced with structured logging.",
                severity="low",
                category="quality",
                code_before="print('Hello World')",
                code_after="import logging\nlogging.info('Hello World')",
                pr_title="Add hello world feature",
                pr_author="developer_bob",
                additions=5,
                deletions=2,
                files_changed=1
            )
            db.add(review1)
            db.commit()
            print("Seed PRReview findings created.")
        else:
            print("Seed PRReview findings already exist.")
            
        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
