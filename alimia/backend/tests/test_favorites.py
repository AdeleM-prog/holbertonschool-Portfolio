import uuid
from models.recipe import Recipe
from models.recipe_ingredients import RecipeIngredients
from models.user_favorites import FavoriteRecipes


def _register_and_create_recipe(client, db_session, email):
    register_payload = {
        "first_name": "Camille",
        "email": email,
        "password": "MotDePasseSolide123!",
    }
    register_response = client.post("/auth/register", json=register_payload)
    user_id = register_response.json()["user_id"]

    recipe = Recipe(
        user_id=uuid.UUID(user_id),
        name="Salade de quinoa",
        prep_time=10,
        cook_time=15,
        steps=["Cuire le quinoa", "Mélanger les légumes"],
        servings=2,
        meal_type=["dinner"],
    )
    db_session.add(recipe)
    db_session.commit()
    db_session.refresh(recipe)

    return user_id, recipe


def test_add_favorite_success(client, db_session):
    user_id, recipe = _register_and_create_recipe(client, db_session, "favori.ajout@example.com")

    response = client.post(f"/users/me/favorites/{recipe.id}")

    assert response.status_code == 200

    favorite = db_session.query(FavoriteRecipes).filter(
        FavoriteRecipes.user_id == user_id,
        FavoriteRecipes.recipe_id == recipe.id,
    ).first()
    assert favorite is not None


def test_add_favorite_duplicate(client, db_session):
    user_id, recipe = _register_and_create_recipe(client, db_session, "favori.doublon@example.com")

    client.post(f"/users/me/favorites/{recipe.id}")
    second_response = client.post(f"/users/me/favorites/{recipe.id}")

    assert second_response.status_code == 400
    assert second_response.json()["detail"] == "already in favorites"


def test_delete_favorite_success(client, db_session):
    user_id, recipe = _register_and_create_recipe(client, db_session, "favori.suppression@example.com")

    client.post(f"/users/me/favorites/{recipe.id}")
    response = client.delete(f"/users/me/favorites/{recipe.id}")

    assert response.status_code == 204

    favorite = db_session.query(FavoriteRecipes).filter(
        FavoriteRecipes.user_id == user_id,
        FavoriteRecipes.recipe_id == recipe.id,
    ).first()
    assert favorite is None


def test_delete_favorite_not_found(client, db_session):
    _register_and_create_recipe(client, db_session, "favori.absent@example.com")

    random_recipe_id = uuid.uuid4()
    response = client.delete(f"/users/me/favorites/{random_recipe_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "recipe not found"


def test_get_favorites_list(client, db_session):
    user_id, recipe = _register_and_create_recipe(client, db_session, "favori.liste@example.com")

    ingredient = RecipeIngredients(
        recipe_id=recipe.id,
        food_id=None,
        quantity=100,
        unit="g",
    )
    db_session.add(ingredient)
    db_session.commit()

    client.post(f"/users/me/favorites/{recipe.id}")

    response = client.get("/users/me/favorites/")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["title"] == "Salade de quinoa"
    assert body[0]["ingredients"][0]["name"] == "Inconnu"
    assert body[0]["ingredients"][0]["quantity"] == 100