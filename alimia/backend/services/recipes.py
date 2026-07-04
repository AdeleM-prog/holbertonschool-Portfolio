import re
from models.recipe import Recipe
from models.recipe_ingredients import RecipeIngredients
from models.food import Food
from sqlalchemy.orm import Session
from sqlalchemy import func
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

        # 1er essai : correspondance exacte
        food_match = db.query(Food)\
            .filter(Food.name.ilike(ingredient['name']))\
            .first()

        # 2e essai : commence par le terme exact, avec frontière de mot
        if not food_match:
            escaped_name = re.escape(ingredient['name'])
            food_match = db.query(Food)\
                .filter(Food.name.op('~*')(f"^{escaped_name}\\M"))\
                .order_by(func.length(Food.name))\
                .first()

        # 3e essai : correspondance sur les entrées génériques (aliment moyen)
        if not food_match:
            food_match = db.query(Food)\
                .filter(Food.name.ilike(f"%{ingredient['name']}%"))\
                .filter(Food.name.ilike("%(aliment moyen)%"))\
                .order_by(func.length(Food.name))\
                .first()
        
        food_id = food_match.id if food_match else None

        recipe_ingredient = RecipeIngredients(
            recipe_id=recipe.id,
            food_id=food_id,
            quantity=ingredient["quantity"],
            unit=ingredient["unit"],
            state=ingredient.get("state")
        )
        db.add(recipe_ingredient)
    db.commit()
    db.refresh(recipe)

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
            "state": ri.state,
            "quantity": ri.quantity,
            "unit": ri.unit
        })

    return {
        "recipe_id": recipe.id,
        "title": recipe.name,
        "ingredients": ingredients_list,
        "steps": recipe.steps
    }