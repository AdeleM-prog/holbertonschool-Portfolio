import uuid
from models.menu import Menu
from models.menu_meals import MenuMeal
from models.recipe import Recipe
from models.recipe_ingredients import RecipeIngredients
from models.food import Food
from models.shopping_list import ShoppingList
from models.shopping_list_item import ShoppingListItem


def _register(client, email):
    register_payload = {
        "first_name": "Camille",
        "email": email,
        "password": "MotDePasseSolide123!",
    }
    response = client.post("/auth/register", json=register_payload)
    return response.json()["user_id"]


def _build_menu_with_two_recipes(db_session, user_id):
    food = Food(ciqual_code=99999, name="Tomate")
    db_session.add(food)
    db_session.flush()

    menu = Menu(user_id=uuid.UUID(user_id), type="daily", start_date="2026-07-08", end_date="2026-07-08")
    db_session.add(menu)
    db_session.flush()

    recipe_1 = Recipe(user_id=uuid.UUID(user_id), name="Salade", steps=["Couper"])
    recipe_2 = Recipe(user_id=uuid.UUID(user_id), name="Sauce", steps=["Mixer"])
    db_session.add_all([recipe_1, recipe_2])
    db_session.flush()

    ingredient_1 = RecipeIngredients(recipe_id=recipe_1.id, food_id=food.id, quantity=100, unit="g")
    ingredient_2 = RecipeIngredients(recipe_id=recipe_2.id, food_id=food.id, quantity=50, unit="g")
    db_session.add_all([ingredient_1, ingredient_2])

    meal_1 = MenuMeal(menu_id=menu.id, recipe_id=recipe_1.id, meal_type="lunch", date="2026-07-08", recipe_title="Salade")
    meal_2 = MenuMeal(menu_id=menu.id, recipe_id=recipe_2.id, meal_type="dinner", date="2026-07-08", recipe_title="Sauce")
    db_session.add_all([meal_1, meal_2])

    db_session.commit()
    db_session.refresh(menu)

    return menu


def test_generate_shopping_list_aggregates_quantities(client, db_session):
    user_id = _register(client, "liste.generation@example.com")
    menu = _build_menu_with_two_recipes(db_session, user_id)

    response = client.post(f"/menus/{menu.id}/shopping-list")

    assert response.status_code == 201
    body = response.json()
    assert len(body["items"]) == 1
    assert body["items"][0]["ingredient"] == "Tomate"
    assert body["items"][0]["quantity"] == 150
    assert body["items"][0]["checked"] is False


def test_generate_shopping_list_replaces_existing(client, db_session):
    user_id = _register(client, "liste.regeneration@example.com")
    menu = _build_menu_with_two_recipes(db_session, user_id)

    client.post(f"/menus/{menu.id}/shopping-list")
    second_response = client.post(f"/menus/{menu.id}/shopping-list")

    assert second_response.status_code == 201

    lists_count = db_session.query(ShoppingList).filter(ShoppingList.menu_id == menu.id).count()
    assert lists_count == 1

    items_count = db_session.query(ShoppingListItem).join(ShoppingList).filter(
        ShoppingList.menu_id == menu.id
    ).count()
    assert items_count == 1


def test_get_shopping_list_success(client, db_session):
    user_id = _register(client, "liste.lecture@example.com")
    menu = _build_menu_with_two_recipes(db_session, user_id)

    client.post(f"/menus/{menu.id}/shopping-list")
    response = client.get(f"/menus/{menu.id}/shopping-list")

    assert response.status_code == 200
    assert len(response.json()["items"]) == 1


def test_update_shopping_list_item_checked(client, db_session):
    user_id = _register(client, "liste.coche@example.com")
    menu = _build_menu_with_two_recipes(db_session, user_id)

    generate_response = client.post(f"/menus/{menu.id}/shopping-list")
    item_id = generate_response.json()["items"][0]["item_id"]

    response = client.patch(
        f"/menus/{menu.id}/shopping-list/items/{item_id}",
        json={"checked": True},
    )

    assert response.status_code == 200
    assert response.json()["checked"] is True


def test_shopping_list_wrong_owner(client, db_session):
    owner_id = _register(client, "liste.proprietaire@example.com")
    menu = _build_menu_with_two_recipes(db_session, owner_id)

    _register(client, "liste.autre.utilisateur@example.com")

    response = client.get(f"/menus/{menu.id}/shopping-list")

    assert response.status_code == 404
    assert response.json()["detail"] == "Menu introuvable"