from pydantic import BaseModel, Field
from schemas.recipes import RecipeIngredient
from uuid import UUID
from typing import Optional
from datetime import date

class MenuGenerateRequest(BaseModel):
    type: str
    priority_ingredients: Optional[str] = None
    start_date: date

class MenuRecipe(BaseModel):
    ingredients: list[RecipeIngredient]
    steps: list[str]

class MenuMeal(BaseModel):
    date: date
    meal_type: str
    recipe: MenuRecipe
    recipe_title: str

class MenuResponse(BaseModel):
    menu_id: Optional[UUID] = None
    type: str
    start_date: date
    end_date: date
    meals: list[MenuMeal]

    model_config = {"from_attributes": True}

class MenuUpdateRequest(BaseModel):
    instructions: Optional[str] = None
    priority_ingredients: Optional[str] = None

class MenuSaveRequest(BaseModel):
    type: str
    start_date: date
    end_date: date
    meals: list[MenuMeal]

class MenuDraftUpdateRequest(BaseModel):
    menu: MenuSaveRequest
    instructions: Optional[str] = None
    priority_ingredients: Optional[str] = None
