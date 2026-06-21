from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class DislikedFoodRequest(BaseModel):
    food_id: UUID

class DislikedFoodResponse(BaseModel):
    id: UUID
    food_id: UUID
