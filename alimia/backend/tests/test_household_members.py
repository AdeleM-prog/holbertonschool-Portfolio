import uuid


def _register(client, email):
    register_payload = {
        "first_name": "Camille",
        "email": email,
        "password": "MotDePasseSolide123!",
    }
    response = client.post("/auth/register", json=register_payload)
    return response.json()["user_id"]


def test_create_member_success(client):
    _register(client, "membre.creation@example.com")

    payload = {
        "first_name": "Léo",
        "date_of_birth": "2015-03-20",
        "gender": "male",
    }
    response = client.post("/users/me/household-members/", json=payload)

    assert response.status_code == 200
    assert "member_id" in response.json()


def test_get_members_list(client):
    _register(client, "membre.liste@example.com")

    payload = {
        "first_name": "Léo",
        "date_of_birth": "2015-03-20",
        "gender": "male",
    }
    client.post("/users/me/household-members/", json=payload)

    response = client.get("/users/me/household-members/")

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["first_name"] == "Léo"


def test_update_member_success(client):
    _register(client, "membre.maj@example.com")

    payload = {
        "first_name": "Léo",
        "date_of_birth": "2015-03-20",
        "gender": "male",
    }
    create_response = client.post("/users/me/household-members/", json=payload)
    member_id = create_response.json()["member_id"]

    update_payload = {"first_name": "Léonard"}
    response = client.patch(f"/users/me/household-members/{member_id}", json=update_payload)

    assert response.status_code == 200
    assert response.json() == {"message": "Member updated successfully"}

    members = client.get("/users/me/household-members/").json()
    assert members[0]["first_name"] == "Léonard"


def test_update_member_not_found(client):
    _register(client, "membre.maj.absent@example.com")

    random_member_id = uuid.uuid4()
    response = client.patch(
        f"/users/me/household-members/{random_member_id}",
        json={"first_name": "Inconnu"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Resource not found"


def test_delete_member_success(client):
    _register(client, "membre.suppression@example.com")

    payload = {
        "first_name": "Léo",
        "date_of_birth": "2015-03-20",
        "gender": "male",
    }
    create_response = client.post("/users/me/household-members/", json=payload)
    member_id = create_response.json()["member_id"]

    response = client.delete(f"/users/me/household-members/{member_id}")

    assert response.status_code == 204

    members = client.get("/users/me/household-members/").json()
    assert members == []


def test_delete_member_not_found(client):
    _register(client, "membre.suppression.absent@example.com")

    random_member_id = uuid.uuid4()
    response = client.delete(f"/users/me/household-members/{random_member_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Resource not found"