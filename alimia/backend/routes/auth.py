from schemas.auth import RegisterRequest, LoginRequest
from services.auth import register, login
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register")
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):
    regist_user = register(db, data)
    return regist_user

@auth_router.post("/login")
def user_login(data: LoginRequest, db: Session = Depends(get_db)):
    user_log_in = login(db, data)
    return user_log_in