from schemas.auth import RegisterRequest, LoginRequest
from services.auth import register, login, verify_token
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database import get_db

auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register")
def register_user(data: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    regist_user = register(db, data)
    response.set_cookie(
        key="token",
        value=regist_user["token"],
        httponly=True,
        samesite="lax",
    )
    return {"user_id": regist_user["user_id"]}

@auth_router.post("/login")
def user_login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user_log_in = login(db, data)
    response.set_cookie(
        key="token",
        value=user_log_in["token"],
        httponly=True,
        samesite="lax",
    )
    return {"user_id": user_log_in["user_id"], "profile": user_log_in["profile"]}

@auth_router.get("/me")
def auth_me(user_id: str = Depends(verify_token)):
    return user_id