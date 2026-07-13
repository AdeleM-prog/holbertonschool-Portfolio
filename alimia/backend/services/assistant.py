from sqlalchemy.orm import Session
from fastapi import HTTPException
from services.users import get_user
from services.household_members import get_members
from services.mistral import ask_assistant
from services.menus import get_current_menu
from models.menu import Menu
from models.menu_meals import MenuMeal
from datetime import date


def ask_assistant_service(db: Session, user_id: str, question: str) -> str:
    connected_user = get_user(db, user_id)
    fam_members = get_members(db, user_id)

    today = date.today()
    current_menu = db.query(Menu)\
        .filter(
            Menu.user_id == user_id,
            Menu.start_date <= today,
            Menu.end_date >= today
        )\
        .order_by(Menu.created_at.desc())\
        .first()

    current_menu_meals = None
    if current_menu:
        current_menu_meals = db.query(MenuMeal).filter(MenuMeal.menu_id == current_menu.id).all()

    answer = ask_assistant(db, connected_user, fam_members, question, current_menu_meals)
    if not answer:
        raise HTTPException(status_code=404, detail="Resource not found")

    return answer.strip()