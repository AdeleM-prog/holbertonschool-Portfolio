from models.user import User


def test_register_success(client):
    payload = {
        "first_name": "Camille",
        "email": "nouvelle.utilisatrice@example.com",
        "password": "MotDePasseSolide123!",
    }

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert "user_id" in body
    assert "token" in response.cookies


def test_register_duplicate_email(client, db_session):
    payload = {
        "first_name": "Camille",
        "email": "doublon@example.com",
        "password": "MotDePasseSolide123!",
    }

    first_response = client.post("/auth/register", json=payload)
    assert first_response.status_code == 200

    second_payload = {
        "first_name": "Autre Personne",
        "email": "doublon@example.com",
        "password": "AutreMotDePasse456!",
    }

    second_response = client.post("/auth/register", json=second_payload)

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Email already registered"

    users_count = db_session.query(User).filter(User.email == "doublon@example.com").count()
    assert users_count == 1


def test_register_password_too_short(client, db_session):
    payload = {
        "first_name": "Camille",
        "email": "motdepassecourt@example.com",
        "password": "Court1!",
    }

    response = client.post("/auth/register", json=payload)

    assert response.status_code == 422

    users_count = db_session.query(User).filter(User.email == "motdepassecourt@example.com").count()
    assert users_count == 0


def test_login_success(client):
    register_payload = {
        "first_name": "Camille",
        "email": "connexion.reussie@example.com",
        "password": "MotDePasseSolide123!",
    }
    client.post("/auth/register", json=register_payload)

    login_payload = {
        "email": "connexion.reussie@example.com",
        "password": "MotDePasseSolide123!",
    }

    response = client.post("/auth/login", json=login_payload)

    assert response.status_code == 200
    body = response.json()
    assert "user_id" in body
    assert "profile" in body
    assert body["profile"]["email"] == "connexion.reussie@example.com"
    assert "token" in response.cookies


def test_login_wrong_password(client):
    register_payload = {
        "first_name": "Camille",
        "email": "mauvais.mdp@example.com",
        "password": "MotDePasseSolide123!",
    }
    client.post("/auth/register", json=register_payload)

    login_payload = {
        "email": "mauvais.mdp@example.com",
        "password": "MauvaisMotDePasse999!",
    }

    response = client.post("/auth/login", json=login_payload)

    assert response.status_code == 401
    assert response.json()["detail"] == "unvalid credentials"