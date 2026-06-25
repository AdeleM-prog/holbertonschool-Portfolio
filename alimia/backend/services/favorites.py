from models.user_favorites import FavoriteRecipes
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, Response

def add_to_favorites(db: Session, user_id: str, recipe_id: str):
    existing_favorite = db.query(FavoriteRecipes).filter(
    FavoriteRecipes.user_id == user_id,
    FavoriteRecipes.recipe_id == recipe_id
    ).first()
    if existing_favorite:
        raise HTTPException(status_code=400, detail="already in favorites")
    new_favorite = FavoriteRecipes(
        user_id = user_id,
        recipe_id = recipe_id
    )
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    return new_favorite

def delete_from_favorites(db: Session, user_id: str, recipe_id: str):
    existing_favorite = db.query(FavoriteRecipes).filter(
    FavoriteRecipes.user_id == user_id,
    FavoriteRecipes.recipe_id == recipe_id
    ).first()

    if not existing_favorite:
        raise HTTPException(status_code=404, detail="recipe not found")

    db.delete(existing_favorite)
    db.commit()
    return Response(status_code=204)

def get_favorites(db: Session, user_id: str):
    favorites_list = db.query(FavoriteRecipes).filter(
    FavoriteRecipes.user_id == user_id
    ).all()

    return favorites_list