from models.user_favorites import FavoriteRecipes
from models.recipe import Recipe
from models.recipe_ingredients import RecipeIngredients
from models.food import Food
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

    result = []
    for favorite in favorites_list:
        recipe = db.query(Recipe).filter(Recipe.id == favorite.recipe_id).first()
        if recipe:
            recipe_ingredients = db.query(RecipeIngredients).filter(RecipeIngredients.recipe_id == recipe.id).all()
            ingredients_list = []
            for ri in recipe_ingredients:
                if ri.food_id:
                    food = db.query(Food).filter(Food.id == ri.food_id).first()
                    name = food.name if food else "Inconnu"
                else:
                    name = "Inconnu"
                ingredients_list.append({
                    "name": name,
                    "quantity": ri.quantity,
                    "unit": ri.unit
                })
            result.append({
                "id": favorite.id,
                "user_id": favorite.user_id,
                "recipe_id": favorite.recipe_id,
                "created_at": favorite.created_at,
                "title": recipe.name,
                "ingredients": ingredients_list,
                "steps": recipe.steps
            })
    return result