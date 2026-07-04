from pydantic import BaseModel
from uuid import UUID

class ShoppingListItem(BaseModel):
    item_id: UUID
    ingredient: str
    quantity: float
    unit: str
    checked: bool

class ShoppingListResponse(BaseModel):
    shopping_list_id: UUID
    items: list[ShoppingListItem]

class ShoppingListItemUpdateRequest(BaseModel):
    checked: bool