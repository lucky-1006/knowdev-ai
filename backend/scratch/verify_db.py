import sys
import os

# Adjust Python Path to import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.repository import Repository
from app.models.document import Document
from app.models.chat import ChatHistory
from app.models.review import PRReview
from app.models.embeddings_metadata import EmbeddingsMetadata

def verify_relationships_and_cascades():
    print("--------------------------------------------------")
    print("Starting Database Schema and Cascade Verification")
    print("--------------------------------------------------")
    
    db: Session = SessionLocal()
    try:
        # 1. Clean existing validation user if any, triggers cascade test first
        existing_val_user = db.query(User).filter(User.username == "validation_test_user").first()
        if existing_val_user:
            print("Found existing validation user. Deleting to check clean state...")
            db.delete(existing_val_user)
            db.commit()
            print("Deleted successfully.")

        # 2. Insert new testing entity tree
        print("\nStep 1: Inserting test user and associated entities...")
        user = User(
            username="validation_test_user",
            email="validation@codepilot.ai",
            clerk_id="user_clerk_val_999"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created User ID: {user.id}")

        repo = Repository(
            user_id=user.id,
            name="validation-repo",
            url="https://github.com/validation/validation-repo",
            health_score=100
        )
        db.add(repo)
        db.commit()
        db.refresh(repo)
        print(f"Created Repository ID: {repo.id} owned by User ID: {repo.user_id}")

        doc = Document(
            repository_id=repo.id,
            file_path="validation_test.py",
            file_content="print('validation test')",
            total_chunks=1
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        print(f"Created Document ID: {doc.id} associated with Repo ID: {doc.repository_id}")

        embedding_meta = EmbeddingsMetadata(
            document_id=doc.id,
            vector_id="val_vector_123",
            chunk_index=0,
            payload_metadata={"test": True}
        )
        chat = ChatHistory(
            user_id=user.id,
            repository_id=repo.id,
            role="user",
            content="Is the validation working?"
        )
        review = PRReview(
            repository_id=repo.id,
            pr_url="https://github.com/validation/validation-repo/pull/1",
            file_path="validation_test.py",
            line_number=1,
            issue_description="Add code comment",
            severity="low",
            category="quality"
        )
        db.add_all([embedding_meta, chat, review])
        db.commit()
        db.refresh(embedding_meta)
        db.refresh(chat)
        db.refresh(review)
        print("Created associated EmbeddingsMetadata, ChatHistory and PRReview records.")

        # 3. Verify relationships via ORM back-references
        print("\nStep 2: Checking SQLAlchemy relationships (back-references)...")
        
        # Reload user to check repositories/chat_histories lists
        db.refresh(user)
        print(f"User '{user.username}' repository count: {len(user.repositories)} (Expected: 1)")
        print(f"User '{user.username}' chat history count: {len(user.chat_histories)} (Expected: 1)")
        assert len(user.repositories) == 1, "Failed: User.repositories list count incorrect."
        assert len(user.chat_histories) == 1, "Failed: User.chat_histories list count incorrect."
        
        # Reload repository to check documents/chats/reviews
        db.refresh(repo)
        print(f"Repo documents count: {len(repo.documents)} (Expected: 1)")
        print(f"Repo chat histories count: {len(repo.chat_histories)} (Expected: 1)")
        print(f"Repo reviews count: {len(repo.reviews)} (Expected: 1)")
        assert len(repo.documents) == 1, "Failed: Repository.documents list count incorrect."
        assert len(repo.chat_histories) == 1, "Failed: Repository.chat_histories list count incorrect."
        assert len(repo.reviews) == 1, "Failed: Repository.reviews list count incorrect."
        
        # Check Document-Embeddings relationship
        db.refresh(doc)
        print(f"Document embeddings count: {len(doc.embeddings)} (Expected: 1)")
        assert len(doc.embeddings) == 1, "Failed: Document.embeddings list count incorrect."

        print("-> SQLAlchemy ORM Relationships verified successfully!")

        # 4. Verify Database Cascading deletes
        print("\nStep 3: Verifying database cascade on delete...")
        user_id = user.id
        repo_id = repo.id
        doc_id = doc.id
        chat_id = chat.id
        review_id = review.id
        emb_id = embedding_meta.id

        print(f"Deleting User ID: {user_id}...")
        db.delete(user)
        db.commit()

        # Try to retrieve cascading deleted records
        print("Checking if cascade deletions propagated...")
        user_still_exists = db.query(User).filter(User.id == user_id).first() is not None
        repo_still_exists = db.query(Repository).filter(Repository.id == repo_id).first() is not None
        doc_still_exists = db.query(Document).filter(Document.id == doc_id).first() is not None
        chat_still_exists = db.query(ChatHistory).filter(ChatHistory.id == chat_id).first() is not None
        review_still_exists = db.query(PRReview).filter(PRReview.id == review_id).first() is not None
        emb_still_exists = db.query(EmbeddingsMetadata).filter(EmbeddingsMetadata.id == emb_id).first() is not None

        print(f"User still exists? {user_still_exists} (Expected: False)")
        print(f"Repository still exists? {repo_still_exists} (Expected: False)")
        print(f"Document still exists? {doc_still_exists} (Expected: False)")
        print(f"ChatHistory still exists? {chat_still_exists} (Expected: False)")
        print(f"PRReview still exists? {review_still_exists} (Expected: False)")
        print(f"EmbeddingsMetadata still exists? {emb_still_exists} (Expected: False)")

        assert not user_still_exists, "Error: User was not deleted."
        assert not repo_still_exists, "Error: Repository was not deleted by user cascade."
        assert not doc_still_exists, "Error: Document was not deleted by repository cascade."
        assert not chat_still_exists, "Error: ChatHistory was not deleted by user/repo cascade."
        assert not review_still_exists, "Error: PRReview was not deleted by repository cascade."
        assert not emb_still_exists, "Error: EmbeddingsMetadata was not deleted by document cascade."

        print("-> Cascading Delete checks passed successfully!")
        print("\nAll database schema verifications succeeded!")

    except Exception as e:
        print(f"\nVerification FAILED: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    verify_relationships_and_cascades()
