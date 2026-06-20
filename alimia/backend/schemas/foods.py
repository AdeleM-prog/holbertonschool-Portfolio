from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class FoodSearchResponse(BaseModel):
    food_id: UUID
    ciqual_code: int
    name: str
    calories: Optional[float] = None
    proteins: Optional[float] = None
    carbs: Optional[float] = None
    fats: Optional[float] = None

    model_config = {"from_attributes": True}

class FoodDetailResponse(BaseModel):
    food_id : UUID
    ciqual_code : int
    name : str
    energy_cal : Optional[float] = None
    proteins : Optional[float] = None
    carbohydrates : Optional[float] = None
    sugars : Optional[float] = None
    fats : Optional[float] = None
    saturated_fats : Optional[float] = None
    fiber : Optional[float] = None
    sodium : Optional[float] = None
    calcium : Optional[float] = None
    iron : Optional[float] = None
    magnesium : Optional[float] = None
    vitamin_a : Optional[float] = None
    vitamin_c : Optional[float] = None
    vitamin_d : Optional[float] = None
    vitamin_e : Optional[float] = None
    vitamin_b9 : Optional[float] = None
    vitamin_b12 : Optional[float] = None

    model_config = {"from_attributes": True}