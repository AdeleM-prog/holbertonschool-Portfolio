from pydantic import BaseModel, EmailStr, Field
from datetime import date
from uuid import UUID
from typing import Optional

class UserProfile(BaseModel):
    user_id: UUID = Field(alias="id")
    first_name: Optional[str] = None
    email: EmailStr
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    household_size: Optional[int] = None
    meals: Optional[list[str]] = None
    dietary_constraints: Optional[str] = None
    diet_type: Optional[str] = None
    liked_foods: Optional[str] = None
    disliked_foods: Optional[str] = None

    model_config = {"from_attributes": True, "populate_by_name": True}

class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=12)
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    household_size: Optional[int] = None
    meals: Optional[list[str]] = None
    dietary_constraints: Optional[list[str]] = None
    dietary_constraints_other: Optional[str] = None
    diet_type: Optional[str] = None
    liked_foods: Optional[list[int]] = None
    disliked_foods: Optional[list[int]] = None