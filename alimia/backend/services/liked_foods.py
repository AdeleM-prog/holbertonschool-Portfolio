from models.user_liked_foods import LikedFoods
from models.food import Food
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, Response

def add_liked_food(db: Session, user_id: str, food_id: UUID):
    existing = db.query(LikedFoods).filter(
        LikedFoods.user_id == user_id,
        LikedFoods.food_id == food_id
        ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Food already in liked foods")

    new_liked_food = LikedFoods(user_id=user_id, food_id=food_id)

    db.add(new_liked_food)
    db.commit()
    db.refresh(new_liked_food)

    return {"id": new_liked_food.id}


def remove_liked_food(db: Session, user_id: str, food_id: UUID):
    deleted_count = db.query(LikedFoods).filter(
        LikedFoods.user_id == user_id,
        LikedFoods.food_id == food_id
        ).delete(synchronize_session=False)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")

    db.commit()

    return Response(status_code=204)


def get_liked_foods(db: Session, user_id: str):
    rows = db.query(LikedFoods, Food.name)\
        .join(Food, LikedFoods.food_id == Food.id)\
        .filter(LikedFoods.user_id == user_id)\
        .all()
    return [{"food_id": liked.food_id, "name": name} for liked, name in rows]