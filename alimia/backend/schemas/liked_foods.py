from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class LikedFoodRequest(BaseModel):
    food_id: UUID

class LikedFoodResponse(BaseModel):
    id: UUID
    food_id: UUID
