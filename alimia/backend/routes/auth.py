from schemas.auth import RegisterRequest
from services.auth import register
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register")
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):
    regist_user = register(db, data)
    return regist_user
    