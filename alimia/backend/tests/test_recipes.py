import json
import uuid
from models.recipe import Recipe
from models.food import Food


def _register(client, email):
    register_payload = {
        "first_name": "Camille",
        "email": email,
        "password": "MotDePasseSolide123!",
    }
    response = client.post("/auth/register", json=register_payload)
    return response.json()["user_id"]


def test_generate_recipe_success_unmatched_ingredient(client, db_session, monkeypatch):
    user_id = _register(client, "recette.succes@example.com")

    fake_response = json.dumps({
        "title": "Salade de quinoa au poulet",
        "ingredients": [
            {"name": "quinoa", "state": "cuit", "quantity": 200, "unit": "g"},
        ],
        "steps": ["Cuire le quinoa", "Servir"],
    })

    def fake_generate_recipe(db, user, members, ingredients=None):
        return f"```json\n{fake_response}\n```"

    monkeypatch.setattr("services.recipes.generate_recipe", fake_generate_recipe)

    response = client.post("/recipes/generate", json={"ingredients": ["quinoa"]})

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Salade de quinoa au poulet"
    assert body["steps"] == ["Cuire le quinoa", "Servir"]
    assert body["ingredients"][0]["name"] == "Inconnu"
    assert body["ingredients"][0]["quantity"] == 200

    recipes_count = db_session.query(Recipe).filter(Recipe.user_id == uuid.UUID(user_id)).count()
    assert recipes_count == 1


def test_generate_recipe_matches_existing_food(client, db_session, monkeypatch):
    user_id = _register(client, "recette.match@example.com")

    food = Food(ciqual_code=11111, name="Quinoa")
    db_session.add(food)
    db_session.commit()

    fake_response = json.dumps({
        "title": "Bol de quinoa",
        "ingredients": [
            {"name": "quinoa", "state": "cuit", "quantity": 150, "unit": "g"},
        ],
        "steps": ["Cuire le quinoa"],
    })

    def fake_generate_recipe(db, user, members, ingredients=None):
        return fake_response

    monkeypatch.setattr("services.recipes.generate_recipe", fake_generate_recipe)

    response = client.post("/recipes/generate", json={"ingredients": ["quinoa"]})

    assert response.status_code == 200
    body = response.json()
    assert body["ingredients"][0]["name"] == "Quinoa"


def test_generate_recipe_mistral_empty_response(client, monkeypatch):
    _register(client, "recette.echec@example.com")

    def fake_generate_recipe(db, user, members, ingredients=None):
        return None

    monkeypatch.setattr("services.recipes.generate_recipe", fake_generate_recipe)

    response = client.post("/recipes/generate", json={"ingredients": ["quinoa"]})

    assert response.status_code == 404
    assert response.json()["detail"] == "Resource not found"