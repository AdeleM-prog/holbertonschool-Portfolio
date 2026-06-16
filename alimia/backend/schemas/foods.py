from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class FoodSearchResponse(BaseModel):
    food_id: UUID
    name: str
    calories: Optional[float] = None
    proteins: Optional[float] = None
    carbs: Optional[float] = None
    fats: Optional[float] = None

    model_config = {"from_attributes": True}