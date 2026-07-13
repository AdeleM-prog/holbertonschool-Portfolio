import uuid
from models.food import Food


def _register_and_create_food(client, db_session, email):
    register_payload = {
        "first_name": "Camille",
        "email": email,
        "password": "MotDePasseSolide123!",
    }
    register_response = client.post("/auth/register", json=register_payload)
    user_id = register_response.json()["user_id"]

    food = Food(
        ciqual_code=12345,
        name="Pomme",
    )
    db_session.add(food)
    db_session.commit()
    db_session.refresh(food)

    return user_id, food


def test_add_liked_food_success(client, db_session):
    user_id, food = _register_and_create_food(client, db_session, "aime.ajout@example.com")

    response = client.post("/users/me/liked-foods/", json={"food_id": str(food.id)})

    assert response.status_code == 200
    assert "id" in response.json()


def test_get_liked_foods_list(client, db_session):
    user_id, food = _register_and_create_food(client, db_session, "aime.liste@example.com")

    client.post("/users/me/liked-foods/", json={"food_id": str(food.id)})

    response = client.get("/users/me/liked-foods/")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["food_id"] == str(food.id)


def test_remove_liked_food_success(client, db_session):
    user_id, food = _register_and_create_food(client, db_session, "aime.suppression@example.com")

    client.post("/users/me/liked-foods/", json={"food_id": str(food.id)})
    response = client.delete(f"/users/me/liked-foods/{food.id}")

    assert response.status_code == 204

    remaining = client.get("/users/me/liked-foods/").json()
    assert remaining == []


def test_remove_liked_food_not_found(client, db_session):
    _register_and_create_food(client, db_session, "aime.absent@example.com")

    random_food_id = uuid.uuid4()
    response = client.delete(f"/users/me/liked-foods/{random_food_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Resource not found"
    