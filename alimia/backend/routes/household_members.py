from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.auth import verify_token
from services.household_members import get_members, create_member, update_member, delete_member
from schemas.household_members import HouseholdMemberRequest, HouseholdMemberUpdateRequest, HouseholdMembersResponse

HH_members_router = APIRouter(prefix="/users/me/household-members", tags=["household_members"])

@HH_members_router.get("/")
def get_HH_members_route(db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return get_members(db, user_id)

@HH_members_router.post("/", response_model=HouseholdMembersResponse)
def create_hh_member_route(data: HouseholdMemberRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return create_member(db, user_id, data)

@HH_members_router.patch("/{member_id}")
def update_hh_member_route(member_id: str, data: HouseholdMemberUpdateRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return update_member(db, user_id, member_id, data)

@HH_members_router.delete("/{member_id}")
def delete_hh_member_route(member_id: str, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return delete_member(db, user_id, member_id)