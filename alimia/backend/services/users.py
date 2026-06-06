from schemas.users import UserUpdateRequest
from sqlalchemy.orm import Session
from models.user import User
from fastapi import HTTPException
import bcrypt

def update_user(db: Session, user_id: str, data: UserUpdateRequest):
    existing_user = db.query(User).filter(User.id == user_id).first()
    if not existing_user:
        raise HTTPException(status_code=404, detail="Ressource not found")

    if data.first_name is not None:
        existing_user.first_name = data.first_name
    if data.email is not None:
        existing_user.email = data.email
    if data.password is not None:
        existing_user.password = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    if data.household_size is not None:
        existing_user.household_size = data.household_size
    if data.meals is not None:
        existing_user.meals = data.meals
    if data.dietary_constraints is not None:
        existing_user.dietary_constraints = data.dietary_constraints
    if data.dietary_constraints_other is not None:
        existing_user.dietary_constraints_other = data.dietary_constraints_other
    if data.diet_type is not None:
        existing_user.diet_type = data.diet_type
    if data.liked_foods is not None:
        existing_user.liked_foods = data.liked_foods
    if data.disliked_foods is not None:
        existing_user.disliked_foods = data.disliked_foods

    db.commit()
    db.refresh(existing_user)

    return {"Message": "Account updated successfully"}