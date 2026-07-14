from models.user_disliked_foods import DislikedFoods
from models.food import Food
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, Response

def add_disliked_food(db: Session, user_id: str, food_id: UUID):
    existing = db.query(DislikedFoods).filter(
        DislikedFoods.user_id == user_id,
        DislikedFoods.food_id == food_id
        ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Food already in disliked foods")

    new_disliked_food = DislikedFoods(user_id=user_id, food_id=food_id)

    db.add(new_disliked_food)
    db.commit()
    db.refresh(new_disliked_food)

    return {"id": new_disliked_food.id}


def remove_disliked_food(db: Session, user_id: str, food_id: UUID):
    deleted_count = db.query(DislikedFoods).filter(
        DislikedFoods.user_id == user_id,
        DislikedFoods.food_id == food_id
        ).delete(synchronize_session=False)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")

    db.commit()

    return Response(status_code=204)


def get_disliked_foods(db: Session, user_id: str):
    rows = db.query(DislikedFoods, Food.name)\
        .join(Food, DislikedFoods.food_id == Food.id)\
        .filter(DislikedFoods.user_id == user_id)\
        .all()
    return [{"food_id": disliked.food_id, "name": name} for disliked, name in rows]