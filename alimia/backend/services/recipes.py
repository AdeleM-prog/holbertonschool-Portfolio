from models.recipe import Recipe
from models.recipe_ingredients import RecipeIngredients
from models.food import Food
from sqlalchemy.orm import Session
from fastapi import HTTPException, Response
from services.users import get_user
from services.household_members import get_members
from services.mistral import generate_recipe
import json

def create_recipe(db: Session, user_id: str, ingredients=None):
    connected_user = get_user(db, user_id)
    fam_members = get_members(db, user_id)
    recipe_generation = generate_recipe(db, connected_user, fam_members, ingredients)
    if not recipe_generation:
        raise HTTPException(status_code=404, detail="Resource not found")
    recipe_generation = recipe_generation.strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(recipe_generation)
    
    recipe = Recipe(
    user_id=user_id,
    name=data["title"],
    steps=data["steps"]
    )

    db.add(recipe)
    db.flush()

    for ingredient in data["ingredients"]:
        food_match = db.query(Food).filter(Food.name.ilike(f"%{ingredient["name"]}%")).first()
        food_id = food_match.id if food_match else None

        recipe_ingredient = RecipeIngredients(
            recipe_id=recipe.id,
            food_id=food_id,
            quantity=ingredient["quantity"],
            unit=ingredient["unit"]
        )
        db.add(recipe_ingredient)
    db.commit()
    db.refresh(recipe)

    return recipe

    