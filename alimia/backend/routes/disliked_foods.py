from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.auth import verify_token
from services.disliked_foods import add_disliked_food, remove_disliked_food, get_disliked_foods
from schemas.disliked_foods import DislikedFoodRequest, DislikedFoodResponse

disliked_foods_router = APIRouter(prefix="/users/me/disliked-foods", tags=["disliked_foods"])

@disliked_foods_router.get("/")
def get_disliked_food(db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return get_disliked_foods(db, user_id)

@disliked_foods_router.post("/")
def new_liked_food(data: DislikedFoodRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return add_disliked_food(db, user_id, data.food_id)

@disliked_foods_router.delete("/{food_id}")
def delete_liked_food(food_id: str, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return remove_disliked_food(db, user_id, food_id)
