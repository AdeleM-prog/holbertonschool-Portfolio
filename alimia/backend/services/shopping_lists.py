from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.menu import Menu
from models.menu_meals import MenuMeal
from models.recipe_ingredients import RecipeIngredients
from models.food import Food
from models.shopping_list import ShoppingList
from models.shopping_list_item import ShoppingListItem as ShoppingListItemModel
from schemas.shopping_lists import ShoppingListResponse, ShoppingListItem as ShoppingListItemSchema

UNIT_ALIASES = {
    "pièce": "pièce", "pièces": "pièce",
    "cuillère à soupe": "cuillère à soupe", "cuillères à soupe": "cuillère à soupe",
    "cuillère à café": "cuillère à café", "cuillères à café": "cuillère à café",
    "gousse": "gousse", "gousses": "gousse",
    "tranche": "tranche", "tranches": "tranche",
    "pincée": "pincée", "pincées": "pincée",
    "g": "g", "kg": "kg", "ml": "ml", "cl": "cl", "l": "l",
}


def normalize_unit(unit: str) -> str:
    if not unit:
        return unit
    key = unit.strip().lower()
    return UNIT_ALIASES.get(key, key)


def _get_owned_menu(db: Session, user_id: str, menu_id: str) -> Menu:
    menu = db.query(Menu).filter(Menu.id == menu_id, Menu.user_id == user_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu introuvable")
    return menu


def generate_shopping_list_service(db: Session, user_id: str, menu_id: str) -> ShoppingListResponse:
    _get_owned_menu(db, user_id, menu_id)

    meals = db.query(MenuMeal).filter(MenuMeal.menu_id == menu_id).all()
    recipe_ids = [meal.recipe_id for meal in meals if meal.recipe_id is not None]

    rows = (
        db.query(RecipeIngredients, Food.name)
        .join(Food, RecipeIngredients.food_id == Food.id)
        .filter(RecipeIngredients.recipe_id.in_(recipe_ids))
        .all()
    )

    aggregated = {}
    for recipe_ingredient, food_name in rows:
        normalized_unit = normalize_unit(recipe_ingredient.unit)
        key = (recipe_ingredient.food_id, normalized_unit)
        if key not in aggregated:
            aggregated[key] = {"name": food_name, "quantity": 0.0, "unit": normalized_unit}
        aggregated[key]["quantity"] += recipe_ingredient.quantity or 0.0

    existing_list = db.query(ShoppingList).filter(ShoppingList.menu_id == menu_id).first()
    if existing_list:
        db.query(ShoppingListItemModel).filter(
            ShoppingListItemModel.shopping_list_id == existing_list.id
        ).delete(synchronize_session=False)
        shopping_list = existing_list
    else:
        shopping_list = ShoppingList(menu_id=menu_id, user_id=user_id)
        db.add(shopping_list)
        db.flush()

    created_items = []
    for data in aggregated.values():
        item = ShoppingListItemModel(
            shopping_list_id=shopping_list.id,
            ingredient=data["name"],
            quantity=data["quantity"],
            unit=data["unit"],
            checked=False,
        )
        db.add(item)
        created_items.append(item)

    db.commit()

    return ShoppingListResponse(
        shopping_list_id=shopping_list.id,
        items=[
            ShoppingListItemSchema(
                item_id=item.id,
                ingredient=item.ingredient,
                quantity=item.quantity,
                unit=item.unit,
                checked=item.checked,
            )
            for item in created_items
        ],
    )


def get_shopping_list_service(db: Session, user_id: str, menu_id: str) -> ShoppingListResponse:
    _get_owned_menu(db, user_id, menu_id)

    shopping_list = db.query(ShoppingList).filter(ShoppingList.menu_id == menu_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Aucune liste de courses générée pour ce menu")

    items = db.query(ShoppingListItemModel).filter(
        ShoppingListItemModel.shopping_list_id == shopping_list.id
    ).all()

    return ShoppingListResponse(
        shopping_list_id=shopping_list.id,
        items=[
            ShoppingListItemSchema(
                item_id=item.id,
                ingredient=item.ingredient,
                quantity=item.quantity,
                unit=item.unit,
                checked=item.checked,
            )
            for item in items
        ],
    )


def update_shopping_list_item_service(db: Session, user_id: str, menu_id: str, item_id: str, checked: bool) -> ShoppingListItemSchema:
    _get_owned_menu(db, user_id, menu_id)

    shopping_list = db.query(ShoppingList).filter(ShoppingList.menu_id == menu_id).first()
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Aucune liste de courses pour ce menu")

    item = db.query(ShoppingListItemModel).filter(
        ShoppingListItemModel.id == item_id,
        ShoppingListItemModel.shopping_list_id == shopping_list.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article introuvable dans cette liste")

    item.checked = checked
    db.commit()
    db.refresh(item)

    return ShoppingListItemSchema(
        item_id=item.id,
        ingredient=item.ingredient,
        quantity=item.quantity,
        unit=item.unit,
        checked=item.checked,
    )