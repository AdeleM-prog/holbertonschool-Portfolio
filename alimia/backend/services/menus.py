from models.menu import Menu
from models.menu_meals import MenuMeal
from sqlalchemy.orm import Session
from services.users import get_user
from services.household_members import get_members
from services.mistral import generate_menu
from fastapi import HTTPException
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

    menu = Menu(
        user_id=user_id,
        type=menu_type,
        start_date=start_date,
        end_date=end_date
    )
    db.add(menu)
    db.flush()

    for meal in data["meals"]:
        menu_meal = MenuMeal(
            menu_id=menu.id,
            recipe_id=None,
            meal_type=meal["meal_type"],
            date=meal["date"]
        )
        db.add(menu_meal)
    db.commit()
    db.refresh(menu)

    meals_list = []
    for meal in data["meals"]:
        meals_list.append({
            "date": meal["date"],
            "meal_type": meal["meal_type"],
            "recipe_title": meal["recipe_title"]
        })

    return {
        "menu_id": menu.id,
        "type": menu.type,
        "start_date": menu.start_date,
        "end_date": menu.end_date,
        "meals": meals_list
    }