from pydantic import BaseModel
from datetime import date
from uuid import UUID
from typing import Optional

class HouseholdMemberRequest(BaseModel):
    first_name: str
    date_of_birth: date
    gender: str

class HouseholdMembersResponse(BaseModel):
    member_id: UUID

class HouseholdMemberUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None