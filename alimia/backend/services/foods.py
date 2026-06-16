from models.food import Food
from sqlalchemy.orm import Session

def search_foods(db: Session, query: str):
    results = db.query(Food).filter(Food.name.ilike(f"%{query}%")).all()
    return [
        {
            "food_id": r.id,
            "name": r.name,
            "calories": r.energy_cal,
            "proteins": r.proteins,
            "carbs": r.carbohydrates,
            "fats": r.fats
        }
        for r in results
    ]
