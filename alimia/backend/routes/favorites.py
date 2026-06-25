from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.auth import verify_token
from services.favorites import add_to_favorites, delete_from_favorites, get_favorites
from schemas.favorites import FavoriteResponse

favorites_router = APIRouter(prefix="/users/me/favorites", tags=["favorite_recipes"])

@favorites_router.get("/")
def get_favorite_recipes(db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return get_favorites(db, user_id)

@favorites_router.post("/{recipe_id}")
def add_favorite_recipe(recipe_id: str, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return add_to_favorites(db, user_id, recipe_id)

@favorites_router.delete("/{recipe_id}")
def delete_favorite_recipe(recipe_id: str, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return delete_from_favorites(db, user_id, recipe_id)

