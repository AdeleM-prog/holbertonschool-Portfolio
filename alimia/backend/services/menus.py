from models.menu import Menu
from models.menu_meals import MenuMeal
from models.recipe import Recipe
from models.recipe_ingredients import RecipeIngredients
from models.food import Food
from schemas.menus import MenuSaveRequest
from sqlalchemy import func
from sqlalchemy.orm import Session
from services.users import get_user
from services.household_members import get_members
from services.mistral import generate_menu, update_menu, update_draft_menu
from fastapi import HTTPException
from unidecode import unidecode
import json
from datetime import timedelta
from datetime import date


def generate_menu_service(db: Session, user_id: str, menu_type: str, start_date, priority_ingredients=None):
    connected_user = get_user(db, user_id)
    fam_members = get_members(db, user_id)
    menu_generation = generate_menu(db, connected_user, fam_members, menu_type, start_date, priority_ingredients)
    if not menu_generation:
        raise HTTPException(status_code=404, detail="Resource not found")
    menu_generation = menu_generation.strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(menu_generation)

    end_date = start_date if menu_type == "daily" else start_date + timedelta(days=6)

    meals_list = []
    for meal in data["meals"]:
        meals_list.append({
            "date": meal["date"],
            "meal_type": meal["meal_type"],
            "recipe_title": meal["recipe_title"],
            "recipe": meal.get("recipe")
        })

    return {
        "menu_id": None,
        "type": menu_type,
        "start_date": start_date,
        "end_date": end_date,
        "meals": meals_list
    }

def get_menu_by_id(db: Session, user_id: str, menu_id: str):
    existing_menu = db.query(Menu).filter(Menu.id == menu_id).first()
    if not existing_menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    meals_list = db.query(MenuMeal).filter(MenuMeal.menu_id == existing_menu.id).all()

    meals = []
    for meal in meals_list:
        recipe_data = None
        if meal.recipe_id:
            recipe = db.query(Recipe).filter(Recipe.id == meal.recipe_id).first()
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
                recipe_data = {
                    "ingredients": ingredients_list,
                    "steps": recipe.steps
                }

        meals.append({
            "date": meal.date,
            "meal_type": meal.meal_type,
            "recipe_title": meal.recipe_title,
            "recipe": recipe_data
        })

    return {
        "menu_id": existing_menu.id,
        "type": existing_menu.type,
        "start_date": existing_menu.start_date,
        "end_date": existing_menu.end_date,
        "meals": meals
    }

def update_menu_service(menu_id, user_id, db, instructions, priority_ingredients):

    generated_menu = db.query(Menu).filter(Menu.id == menu_id).first()
    if not generated_menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    connected_user = get_user(db, user_id)
    fam_members = get_members(db, user_id)
    updt_menu = update_menu(db, connected_user, fam_members, generated_menu, instructions=instructions, priority_ingredients=priority_ingredients)

    updated_menu = updt_menu.strip().removeprefix("```json").removesuffix("```").strip()

    db.query(MenuMeal).filter(MenuMeal.menu_id == menu_id).delete()

    data = json.loads(updated_menu)

    for meal in data["meals"]:
        recipe_id = None
        if meal.get("recipe"):
            recipe = Recipe(
                user_id=user_id,
                name=meal["recipe_title"],
                steps=meal["recipe"]["steps"]
            )
            db.add(recipe)
            db.flush()

            for ingredient in meal["recipe"]["ingredients"]:
                name_normalized = unidecode(ingredient["name"]).lower()
                food_match = db.query(Food)\
                    .filter(func.unaccent(Food.name).ilike(f"{name_normalized}%"))\
                    .order_by(func.length(Food.name))\
                    .first()
                if not food_match:
                    food_match = db.query(Food)\
                        .filter(func.unaccent(Food.name).ilike(f"%{name_normalized}%"))\
                        .order_by(func.length(Food.name))\
                        .first()

                recipe_ingredient = RecipeIngredients(
                    recipe_id=recipe.id,
                    food_id=food_match.id if food_match else None,
                    quantity=ingredient["quantity"],
                    unit=ingredient["unit"]
                )
                db.add(recipe_ingredient)
            recipe_id = recipe.id

        menu_meal = MenuMeal(
            menu_id=menu_id,
            recipe_id=recipe_id,
            meal_type=meal["meal_type"],
            date=meal["date"],
            recipe_title=meal["recipe_title"]
        )
        db.add(menu_meal)
    
    db.commit()

    return get_menu_by_id(db, user_id, menu_id)


def save_menu(db: Session, user_id: str, data: MenuSaveRequest):

    menu = Menu(
        user_id=user_id,
        type=data.type,
        start_date=data.start_date,
        end_date=data.end_date
    )
    db.add(menu)
    db.flush()

    for meal in data.meals:
        recipe_id = None
        if meal.recipe:
            recipe = Recipe(
                user_id=user_id,
                name=meal.recipe_title,
                steps=meal.recipe.steps
            )
            db.add(recipe)
            db.flush()

            for ingredient in meal.recipe.ingredients:
                name_normalized = unidecode(ingredient.name).lower()
                food_match = db.query(Food)\
                    .filter(func.unaccent(Food.name).ilike(f"{name_normalized}%"))\
                    .order_by(func.length(Food.name))\
                    .first()
                if not food_match:
                    food_match = db.query(Food)\
                        .filter(func.unaccent(Food.name).ilike(f"%{name_normalized}%"))\
                        .order_by(func.length(Food.name))\
                        .first()

                recipe_ingredient = RecipeIngredients(
                    recipe_id=recipe.id,
                    food_id=food_match.id if food_match else None,
                    quantity=ingredient.quantity,
                    unit=ingredient.unit
                )
                db.add(recipe_ingredient)
            recipe_id = recipe.id

        menu_meal = MenuMeal(
            menu_id=menu.id,
            recipe_id=recipe_id,
            recipe_title=meal.recipe_title,
            meal_type=meal.meal_type,
            date=meal.date
        )
        db.add(menu_meal)

    db.commit()
    db.refresh(menu)

    return {
        "menu_id": menu.id,
        "type": menu.type,
        "start_date": menu.start_date,
        "end_date": menu.end_date,
        "meals": [
            {
                "date": meal.date,
                "meal_type": meal.meal_type,
                "recipe_title": meal.recipe_title,
                "recipe": {
                    "ingredients": [
                        {"name": i.name, "quantity": i.quantity, "unit": i.unit}
                        for i in meal.recipe.ingredients
                    ],
                    "steps": meal.recipe.steps
                } if meal.recipe else None
            }
            for meal in data.meals
        ]
    }

def get_current_menu(db: Session, user_id: str):
    today = date.today()
    existing_menu = db.query(Menu)\
        .filter(
            Menu.user_id == user_id,
            Menu.start_date <= today,
            Menu.end_date >= today
        )\
        .order_by(Menu.created_at.desc())\
        .first()
    if not existing_menu:
        raise HTTPException(status_code=404, detail="No menu found for the current week")
    
    return get_menu_by_id(db, user_id, existing_menu.id)

def update_draft_menu_service(db: Session, user_id: str, draft_menu, instructions=None, priority_ingredients=None):
    connected_user = get_user(db, user_id)
    fam_members = get_members(db, user_id)
    
    menu_generation = update_draft_menu(db, connected_user, fam_members, draft_menu, instructions, priority_ingredients)
    if not menu_generation:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    menu_generation = menu_generation.strip().removeprefix("```json").removesuffix("```").strip()
    data = json.loads(menu_generation)

    meals_list = []
    for meal in data["meals"]:
        meals_list.append({
            "date": meal["date"],
            "meal_type": meal["meal_type"],
            "recipe_title": meal["recipe_title"],
            "recipe": meal.get("recipe")
        })

    return {
        "menu_id": None,
        "type": draft_menu["type"],
        "start_date": draft_menu["start_date"],
        "end_date": draft_menu["end_date"],
        "meals": meals_list
    }