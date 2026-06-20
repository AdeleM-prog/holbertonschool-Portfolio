from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.auth import verify_token
from services.liked_foods import add_liked_food, remove_liked_food, get_liked_foods
from schemas.liked_foods import LikedFoodRequest, LikedFoodResponse

liked_foods_router = APIRouter(prefix="/users/me/liked-foods", tags=["liked_foods"])

@liked_foods_router.get("/")
def get_liked_food(db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return get_liked_foods(db, user_id)

@liked_foods_router.post("/")
def new_liked_food(data: LikedFoodRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return add_liked_food(db, user_id, data.food_id)

@liked_foods_router.delete("/{food_id}")
def delete_liked_food(food_id: str, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return remove_liked_food(db, user_id, food_id)
