from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.auth import verify_token
from services.menus import generate_menu_service
from schemas.menus import MenuMeal, MenuGenerateRequest, MenuResponse

menu_router = APIRouter(prefix="/menus", tags=["menu_generate"])
@menu_router.post("/generate", response_model=MenuResponse)
def generate_menu(data: MenuGenerateRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return generate_menu_service(db, user_id, data.type, data.start_date, data.priority_ingredients)

