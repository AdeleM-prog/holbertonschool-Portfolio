from models.food import Food
from sqlalchemy.orm import Session
from uuid import UUID

def search_foods(db: Session, query: str):
    results = db.query(Food).filter(Food.name.ilike(f"%{query}%")).all()
    return [
        {
            "food_id": r.id,
            "ciqual_code": r.ciqual_code,
            "name": r.name,
            "calories": r.energy_cal,
            "proteins": r.proteins,
            "carbs": r.carbohydrates,
            "fats": r.fats
        }
        for r in results
    ]

def get_food_by_id(db: Session, food_id: UUID):
    result = db.query(Food).filter(Food.id == food_id).first()
    if not result:
        return None
    return {
        "food_id": result.id,
        "ciqual_code": result.ciqual_code,
        "name": result.name,
        "energy_cal": result.energy_cal,
        "proteins": result.proteins,
        "carbohydrates": result.carbohydrates,
        "sugars": result.sugars,
        "fats": result.fats,
        "saturated_fats": result.saturated_fats,
        "fiber": result.fiber,
        "sodium": result.sodium,
        "calcium": result.calcium,
        "iron": result.iron,
        "magnesium": result.magnesium,
        "vitamin_a": result.vitamin_a,
        "vitamin_c": result.vitamin_c,
        "vitamin_d": result.vitamin_d,
        "vitamin_e": result.vitamin_e,
        "vitamin_b9": result.vitamin_b9,
        "vitamin_b12": result.vitamin_b12
    }