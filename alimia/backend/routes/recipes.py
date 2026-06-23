from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.auth import verify_token
from services.recipes import create_recipe
from schemas.recipes import RecipeResponse, RecipeGenerateRequest, RecipeIngredient

recipe_router = APIRouter(prefix="/recipes", tags=["recipe_generate"])

@recipe_router.post("/generate")
def generate_recipe(data: RecipeGenerateRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return create_recipe(db, user_id, data.ingredients)
