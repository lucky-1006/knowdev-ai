import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from app.config import settings

def test_connection():
    print(f"Testing connection to: {settings.DATABASE_URL}")
    try:
        # Try connecting to the default database first to check if server is up
        base_url = settings.DATABASE_URL.rsplit("/", 1)[0] + "/postgres"
        engine = create_engine(base_url, isolation_level="AUTOCOMMIT")
        with engine.connect() as conn:
            print("Successfully connected to default 'postgres' database.")
            
            # Check if codepilot database exists
            result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname='codepilot'"))
            exists = result.scalar() is not None
            if not exists:
                print("Database 'codepilot' does not exist. Creating...")
                conn.execute(text("CREATE DATABASE codepilot"))
                print("Database 'codepilot' created successfully.")
            else:
                print("Database 'codepilot' already exists.")
        
        # Now try to connect to the actual DB
        actual_engine = create_engine(settings.DATABASE_URL)
        with actual_engine.connect() as actual_conn:
            print("Successfully connected to 'codepilot' database.")
        
        # Check if tables can be created
        from app.db.base import Base
        from app.models.user import User
        from app.models.repository import Repository
        from app.models.chat import ChatHistory
        from app.models.review import PRReview
        from app.models.document import Document
        from app.models.embeddings_metadata import EmbeddingsMetadata
        
        print("Attempting to create all tables...")
        Base.metadata.create_all(bind=actual_engine)
        print("Tables created successfully!")
        
    except OperationalError as e:
        print(f"OperationalError: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_connection()
