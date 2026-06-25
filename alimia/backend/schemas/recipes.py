from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class RecipeIngredient(BaseModel):
    name: str
    state: Optional[str] = None
    quantity: float
    unit: str

    model_config = {"from_attributes": True}

class RecipeResponse(BaseModel):
    recipe_id: UUID
    title: str
    ingredients: Optional[list[RecipeIngredient]] = None
    steps: list[str]

    model_config = {"from_attributes": True}

class RecipeGenerateRequest(BaseModel):
    ingredients:  list[str]
