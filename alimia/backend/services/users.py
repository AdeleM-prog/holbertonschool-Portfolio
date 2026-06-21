from schemas.users import UserUpdateRequest
from models.user import User
from sqlalchemy.orm import Session
from fastapi import HTTPException, Response

def get_user(db: Session, user_id: str):
    existing_user = db.query(User).filter(User.id == user_id).first()
    return existing_user


def update_user(db: Session, user_id: str, data: UserUpdateRequest):
    existing_user = db.query(User).filter(User.id == user_id).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="Resource not found")
    print("data reçue:", data.model_dump(exclude_none=True))
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(existing_user, field, value)
    db.commit()
    db.refresh(existing_user)
    return {"message": "User updated successfully"}

def delete_user(db: Session, user_id: str):
    existing_user = db.query(User).filter(User.id == user_id).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(existing_user)
    db.commit()
    return Response(status_code=204)