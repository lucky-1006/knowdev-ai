import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.db.session import engine
from app.db.base import Base

# Import all models to ensure they are registered on Base
from app.models.user import User
from app.models.repository import Repository
from app.models.chat import ChatHistory
from app.models.review import PRReview
from app.models.document import Document
from app.models.embeddings_metadata import EmbeddingsMetadata

def reset_database():
    print("WARNING: Resetting all tables in the database...")
    try:
        # Drop all tables in reverse order of dependencies
        Base.metadata.drop_all(bind=engine)
        print("Dropped all tables successfully.")
        
        # Recreate all tables with latest schema
        Base.metadata.create_all(bind=engine)
        print("Created all tables successfully.")
    except Exception as e:
        print(f"Error resetting database: {e}")

if __name__ == "__main__":
    reset_database()
