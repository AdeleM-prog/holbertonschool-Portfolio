from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import date

class MenuGenerateRequest(BaseModel):
    type: str
    priority_ingredients: Optional[str] = None
    start_date: date

class MenuMeal(BaseModel):
    date: date
    meal_type: str
    recipe_title: str

class MenuResponse(BaseModel):
    menu_id: UUID
    type: str
    start_date: date
    end_date: date
    meals: list[MenuMeal]

    model_config = {"from_attributes": True}