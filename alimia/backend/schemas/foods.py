from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class FoodSearchResponse(BaseModel):
    food_id: UUID = Field(alias="id")
    name: str
    calories: Optional[float] = Field(alias="energy_cal", default=None)
    proteins: Optional[float] = None
    carbs: Optional[float] = Field(alias="carbohydrates", default=None)
    fats: Optional[float] = None

    model_config = {"from_attributes": True, "populate_by_name": True}