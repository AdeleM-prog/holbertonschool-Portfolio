from models.user_favorites import FavoriteRecipes
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, Response

def add_to_favorites(db: Session, user_id: str, recipe_id: str):


def delete_from_favorites(db: Session, user_id: str, reciped_id: str):

def get_favorites(db: Session, user_id: str):