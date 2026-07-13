from models.user import User


def test_get_user_me_success(client):
    register_payload = {
        "first_name": "Camille",
        "email": "profil.utilisateur@example.com",
        "password": "MotDePasseSolide123!",
    }
    client.post("/auth/register", json=register_payload)

    response = client.get("/users/me")

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "profil.utilisateur@example.com"
    assert body["first_name"] == "Camille"


def test_get_user_me_unauthenticated(client):
    response = client.get("/users/me")

    assert response.status_code == 401


def test_update_user_success(client, db_session):
    register_payload = {
        "first_name": "Camille",
        "email": "mise.a.jour@example.com",
        "password": "MotDePasseSolide123!",
    }
    client.post("/auth/register", json=register_payload)

    update_payload = {
        "gender": "female",
        "household_size": 3,
    }
    response = client.patch("/users/me", json=update_payload)

    assert response.status_code == 200
    assert response.json() == {"message": "User updated successfully"}

    updated_user = db_session.query(User).filter(User.email == "mise.a.jour@example.com").first()
    assert updated_user.gender == "female"
    assert updated_user.household_size == 3


def test_delete_user_success(client, db_session):
    register_payload = {
        "first_name": "Camille",
        "email": "suppression.compte@example.com",
        "password": "MotDePasseSolide123!",
    }
    client.post("/auth/register", json=register_payload)

    response = client.delete("/users/me")

    assert response.status_code == 204

    deleted_user = db_session.query(User).filter(User.email == "suppression.compte@example.com").first()
    assert deleted_user is None