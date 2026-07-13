from models.menu import Menu
from models.menu_meals import MenuMeal


def _register(client, email):
    register_payload = {
        "first_name": "Camille",
        "email": email,
        "password": "MotDePasseSolide123!",
    }
    response = client.post("/auth/register", json=register_payload)
    return response.json()["user_id"]


def test_save_menu_with_recipe(client, db_session):
    _register(client, "menu.sauvegarde@example.com")

    payload = {
        "type": "daily",
        "start_date": "2026-07-08",
        "end_date": "2026-07-08",
        "meals": [
            {
                "date": "2026-07-08",
                "meal_type": "dinner",
                "recipe_title": "Soupe de légumes",
                "recipe": {
                    "ingredients": [
                        {"name": "carotte", "quantity": 200, "unit": "g"},
                    ],
                    "steps": ["Éplucher les carottes", "Cuire à la vapeur"],
                },
            }
        ],
    }

    response = client.post("/menus/", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["menu_id"] is not None
    assert body["meals"][0]["recipe"]["ingredients"][0]["quantity"] == 200

    menu = db_session.query(Menu).filter(Menu.id == body["menu_id"]).first()
    assert menu is not None

    menu_meal = db_session.query(MenuMeal).filter(MenuMeal.menu_id == menu.id).first()
    assert menu_meal is not None
    assert menu_meal.recipe_id is not None
    assert menu_meal.recipe_title == "Soupe de légumes"


def test_save_menu_missing_recipe_rejected(client):
    _register(client, "menu.sans.recette@example.com")

    payload = {
        "type": "daily",
        "start_date": "2026-07-08",
        "end_date": "2026-07-08",
        "meals": [
            {
                "date": "2026-07-08",
                "meal_type": "breakfast",
                "recipe_title": "Petit-déjeuner libre",
                "recipe": None,
            }
        ],
    }

    response = client.post("/menus/", json=payload)

    assert response.status_code == 422