from models.user_disliked_foods import DislikedFoods
from models.food import Food
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, Response

def add_disliked_food(db: Session, user_id: str, food_id: UUID):

    new_disliked_food = DislikedFoods(user_id=user_id, food_id=food_id)

    db.add(new_disliked_food)
    db.commit()
    db.refresh(new_disliked_food)

    return {"id": new_disliked_food.id}


def remove_disliked_food(db: Session, user_id: str, food_id: UUID):
    removed_disliked_food = db.query(DislikedFoods).filter(
        DislikedFoods.user_id == user_id,
        DislikedFoods.food_id == food_id
        ).first()
    if not removed_disliked_food:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    db.delete(removed_disliked_food)
    db.commit()

    return Response(status_code=204)
    

def get_disliked_foods(db: Session, user_id: str):
    all_disliked_foods = db.query(DislikedFoods).filter(DislikedFoods.user_id == user_id).all()
    return all_disliked_foods