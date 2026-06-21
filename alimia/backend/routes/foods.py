from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.foods import search_foods, get_food_by_id
from schemas.foods import FoodSearchResponse, FoodDetailResponse
from typing import List
from uuid import UUID

foods_router = APIRouter(prefix="/foods", tags=["foods"])

@foods_router.get("/search", response_model=List[FoodSearchResponse])
def search_food(q: str, db: Session = Depends(get_db)):
    return search_foods(db, q)

@foods_router.get("/{food_id}", response_model=FoodDetailResponse)
def detailled_food(food_id: UUID, db: Session = Depends(get_db)):
    result = get_food_by_id(db, food_id)
    if not result:
        raise HTTPException(status_code=404, detail="Resource not found")
    else:
        return result