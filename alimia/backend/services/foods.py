from schemas.foods import FoodSearchResponse
from models.food import Food
from sqlalchemy.orm import Session


def search_foods(db: Session, query: str):
    existing_food = db.query(Food).filter(Food.name.ilike(f"%{query}%")).all()
    return existing_food
    