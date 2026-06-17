from models.user import User
from schemas.household_members import HouseholdMemberRequest, HouseholdMembersResponse, HouseholdMemberUpdateRequest
from models.household_members import HouseholdMembers
from sqlalchemy.orm import Session
from fastapi import HTTPException, Response

def create_member(db: Session, user_id:str, data:HouseholdMemberRequest):
    new_member = HouseholdMembers(
        user_id=user_id,
        first_name=data.first_name,
        gender=data.gender,
        birth_date=data.date_of_birth
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return {"member_id": new_member.id}


def update_member(db: Session, user_id: str, member_id: str, data: HouseholdMemberUpdateRequest):
    updated_HH_member = db.query(HouseholdMembers).filter(
        HouseholdMembers.id == member_id,
        HouseholdMembers.user_id == user_id
        ).first()
    
    if not updated_HH_member:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(updated_HH_member, field, value)

    db.commit()
    db.refresh(updated_HH_member)
    return {"message": "Member updated successfully"}


def delete_member(db: Session, user_id: str, member_id:str):
    deleted_HH_member = db.query(HouseholdMembers).filter(
        HouseholdMembers.id == member_id,
        HouseholdMembers.user_id == user_id
        ).first()
    
    if not deleted_HH_member:
        raise HTTPException(status_code=404, detail="Resource not found")

    db.delete(deleted_HH_member)
    db.commit()

    return Response(status_code=204)