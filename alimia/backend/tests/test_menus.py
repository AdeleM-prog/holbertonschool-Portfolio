import json


def _register(client, email):
    register_payload = {
        "first_name": "Camille",
        "email": email,
        "password": "MotDePasseSolide123!",
    }
    response = client.post("/auth/register", json=register_payload)
    return response.json()["user_id"]


def test_generate_menu_success(client, monkeypatch):
    _register(client, "menu.succes@example.com")

    fake_response = json.dumps({
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
        ]
    })

    def fake_generate_menu(db, user, members, menu_type, start_date, priority_ingredients=None):
        return fake_response

    monkeypatch.setattr("services.menus.generate_menu", fake_generate_menu)

    payload = {
        "type": "daily",
        "start_date": "2026-07-08",
    }
    response = client.post("/menus/generate", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["menu_id"] is None
    assert body["type"] == "daily"
    assert body["start_date"] == "2026-07-08"
    assert body["end_date"] == "2026-07-08"
    assert len(body["meals"]) == 1
    assert body["meals"][0]["recipe_title"] == "Soupe de légumes"


def test_generate_menu_mistral_empty_response(client, monkeypatch):
    _register(client, "menu.echec@example.com")

    def fake_generate_menu(db, user, members, menu_type, start_date, priority_ingredients=None):
        return None

    monkeypatch.setattr("services.menus.generate_menu", fake_generate_menu)

    payload = {
        "type": "daily",
        "start_date": "2026-07-08",
    }
    response = client.post("/menus/generate", json=payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "Resource not found"