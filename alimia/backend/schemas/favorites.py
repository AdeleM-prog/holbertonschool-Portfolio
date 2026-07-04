from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class FavoriteIngredient(BaseModel):
    name: str
    quantity: float
    unit: str

class FavoriteResponse(BaseModel):
    id: UUID
    user_id: UUID
    recipe_id: UUID
    created_at: datetime
    title: str
    ingredients: list[FavoriteIngredient]
    steps: list[str]

    model_config = {"from_attributes": True}