import bcrypt
from models.user import User
from schemas.auth import RegisterRequest
from sqlalchemy.orm import Session
from fastapi import HTTPException
from jose import jwt
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def register(db: Session, data: RegisterRequest):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")
    hashed_password = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(
    first_name=data.first_name,
    email=data.email,
    password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    new_token = create_token(str(new_user.id))
    return {
        "user_id": new_user.id,
        "token": new_token
    }

def create_token(user_id):
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, ALGORITHM)

