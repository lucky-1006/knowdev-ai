import sys
import os
import pytest

# Adjust Python Path to import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.repository import Repository

@pytest.fixture(scope="function")
def db_session():
    """
    Fixture to yield a transaction-scoped database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_create_user_and_repo(db_session):
    """
    Test creating a user and their repository in the database
    and verifying the relationships and cascade deletes.
    """
    # 1. Clean existing test user if present
    existing_user = db_session.query(User).filter(User.username == "pytest_db_user").first()
    if existing_user:
        db_session.delete(existing_user)
        db_session.commit()

    # 2. Insert new user
    test_user = User(
        username="pytest_db_user",
        email="pytest_db@codepilot.ai",
        clerk_id="pytest_user_clerk_11"
    )
    db_session.add(test_user)
    db_session.commit()
    db_session.refresh(test_user)
    
    # 3. Create linked repository
    test_repo = Repository(
        user_id=test_user.id,
        name="pytest-db-repo",
        url="https://github.com/pytest/pytest-db-repo",
        health_score=95
    )
    db_session.add(test_repo)
    db_session.commit()
    db_session.refresh(test_repo)
    
    # 4. Assert records are successfully linked and retrieved
    fetched_user = db_session.query(User).filter(User.username == "pytest_db_user").first()
    assert fetched_user is not None
    assert fetched_user.email == "pytest_db@codepilot.ai"
    assert len(fetched_user.repositories) == 1
    assert fetched_user.repositories[0].name == "pytest-db-repo"
    
    # 5. Verify cascading delete behavior
    db_session.delete(test_user)
    db_session.commit()
    
    # Assert both records are deleted
    assert db_session.query(User).filter(User.id == test_user.id).first() is None
    assert db_session.query(Repository).filter(Repository.id == test_repo.id).first() is None
