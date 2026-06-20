from models.user_liked_foods import LikedFoods
from models.food import Food
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, Response

def add_liked_food(db: Session, user_id: str, food_id: UUID):

    new_liked_food = LikedFoods(user_id=user_id, food_id=food_id)

    db.add(new_liked_food)
    db.commit()
    db.refresh(new_liked_food)

    return {"id": new_liked_food.id}


def remove_liked_food(db: Session, user_id: str, food_id: UUID):
    removed_liked_food = db.query(LikedFoods).filter(
        LikedFoods.user_id == user_id,
        LikedFoods.food_id == food_id
        ).first()
    if not removed_liked_food:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(removed_liked_food)
    db.commit()

    return Response(status_code=204)
    

def get_liked_foods(db: Session, user_id: str):
    all_liked_foods = db.query(LikedFoods).filter(LikedFoods.user_id == user_id).all()
    return all_liked_foods