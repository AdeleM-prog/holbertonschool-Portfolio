import bcrypt
from models.user import User
from schemas.auth import RegisterRequest, LoginRequest
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends, Request
from jose import jwt
from datetime import datetime, timezone, timedelta
import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
read_token = OAuth2PasswordBearer(tokenUrl="/auth/login")


def register(db: Session, data: RegisterRequest):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_password = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
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

def login(db: Session, data: LoginRequest):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if not existing_user:
        raise HTTPException(status_code=401, detail="unvalid credentials")

    password_check = bcrypt.checkpw(data.password.encode('utf-8'), existing_user.password.encode('utf-8'))
    if password_check == False:
        raise HTTPException(status_code=401, detail="unvalid credentials")

    new_token = create_token(str(existing_user.id))
    return {
        "user_id": existing_user.id,
        "token": new_token,
        "profile": {
            "first_name": existing_user.first_name,
            "email": existing_user.email,
            "gender": existing_user.gender,
            "birth_date": existing_user.birth_date,
            "household_size": existing_user.household_size,
            "meals": existing_user.meals,
            "dietary_constraints": existing_user.dietary_constraints,
            "dietary_constraints_other": existing_user.dietary_constraints_other,
            "diet_type": existing_user.diet_type,
            "liked_foods": existing_user.liked_foods,
            "disliked_foods": existing_user.disliked_foods,
            "created_at": existing_user.created_at,
            "updated_at": existing_user.updated_at,
        }
    }

def verify_token(request: Request):
    token = request.cookies.get("token")
    try:
        payload = jwt.decode(token, SECRET_KEY, ALGORITHM)
        get_token = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return get_token