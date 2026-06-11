from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=12)
    household_size: Optional[int] = None
    meals: Optional[list[str]] = None
    dietary_constraints: Optional[list[str]] = None
    dietary_constraints_other: Optional[str] = None
    diet_type: Optional[str] = None
    liked_foods: Optional[list[int]] = None
    disliked_foods: Optional[list[int]] = None