from schemas.users import UserUpdateRequest
from services.users import update_user, delete_user
from services.auth import verify_token
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db

users_router= APIRouter(prefix="/users", tags=["users"])

@users_router.patch("/me")
def update_user_route(data: UserUpdateRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    updated_user = update_user(db, user_id, data)
    return updated_user

@users_router.delete("/me")
def delete_user_route(db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    deleted_user = delete_user(db, user_id)
    return deleted_user