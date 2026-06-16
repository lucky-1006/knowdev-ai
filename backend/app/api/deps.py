from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.config import settings
from app.db.session import get_db
from app.models.user import User

# oauth2_scheme matches Bearer <token> in Authorization header.
# auto_error=False ensures we can intercept missing auth and supply development default fallback.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to authenticate and retrieve the current user from PostgreSQL.
    If no authentication token is provided in development mode, it gracefully
    falls back to the default 'codepilot_dev' user to simplify offline testing.
    """
    if not token:
        # Development fallback
        if settings.ENV_MODE == "development":
            dev_user = db.query(User).filter(User.username == "knowdev_dev").first()
            if dev_user:
                return dev_user
            
            # Create the dev user if it doesn't exist yet
            dev_user = User(
                username="knowdev_dev",
                email="dev@knowdev.ai",
                clerk_id="dev_bypass_999"
            )
            db.add(dev_user)
            db.commit()
            db.refresh(dev_user)
            return dev_user

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        email: str = payload.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials: email claim is missing.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Dynamically provision user upon first login success
        username = payload.get("name") or payload.get("username") or email.split("@")[0]
        user = User(
            username=username,
            email=email,
            clerk_id=payload.get("sub")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user
