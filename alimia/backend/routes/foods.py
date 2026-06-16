from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.foods import search_foods
from schemas.foods import FoodSearchResponse
from typing import List

foods_router = APIRouter(prefix="/foods", tags=["foods"])

@foods_router.get("/search", response_model=List[FoodSearchResponse])
def search_food(q: str, db: Session = Depends(get_db)):
    return search_foods(db, q)