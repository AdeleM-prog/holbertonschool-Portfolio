from models.food import Food
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from unidecode import unidecode

def search_foods(db: Session, query: str):
    normalized = unidecode(query).lower()
    results = db.query(Food).filter(func.unaccent(Food.name).ilike(f"%{normalized}%")).all()
    if not results:
        words = normalized.split()
        singular_words = [w[:-1] if w.endswith("s") and len(w) > 3 else w for w in words]
        singular = " ".join(singular_words)
        results = db.query(Food).filter(func.unaccent(Food.name).ilike(f"%{singular}%")).all()
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