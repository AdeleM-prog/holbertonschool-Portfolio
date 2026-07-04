from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.auth import verify_token
from schemas.menus import MenuGenerateRequest, MenuResponse, MenuUpdateRequest, MenuSaveRequest, MenuDraftUpdateRequest
from schemas.shopping_lists import ShoppingListResponse, ShoppingListItem, ShoppingListItemUpdateRequest
from services.menus import generate_menu_service, get_menu_by_id, update_menu_service, save_menu, get_current_menu, update_draft_menu_service
from services.shopping_lists import generate_shopping_list_service, get_shopping_list_service, update_shopping_list_item_service

menu_router = APIRouter(prefix="/menus", tags=["menu_generate"])

@menu_router.post("/generate", response_model=MenuResponse)
def generate_menu(data: MenuGenerateRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return generate_menu_service(db, user_id, data.type, data.start_date, data.priority_ingredients)

@menu_router.get("/current", response_model=MenuResponse)
def get_current_week_menu(db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return get_current_menu(db, user_id)

@menu_router.get("/{menu_id}")
def get_menus(menu_id: str, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return get_menu_by_id(db, user_id, menu_id)

@menu_router.patch("/{menu_id}", response_model=MenuResponse)
def update_menu(menu_id: str, data: MenuUpdateRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return update_menu_service(menu_id, user_id, db, data.instructions, data.priority_ingredients)

@menu_router.post("/", response_model=MenuResponse)
def create_menu(data: MenuSaveRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return save_menu(db, user_id, data)

@menu_router.post("/update-draft", response_model=MenuResponse)
def update_draft(data: MenuDraftUpdateRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return update_draft_menu_service(db, user_id, data.menu.dict(), data.instructions, data.priority_ingredients)

@menu_router.post("/{menu_id}/shopping-list", response_model=ShoppingListResponse, status_code=201)
def create_shopping_list(menu_id: str, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return generate_shopping_list_service(db, user_id, menu_id)

@menu_router.get("/{menu_id}/shopping-list", response_model=ShoppingListResponse)
def read_shopping_list(menu_id: str, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return get_shopping_list_service(db, user_id, menu_id)

@menu_router.patch("/{menu_id}/shopping-list/items/{item_id}", response_model=ShoppingListItem)
def update_shopping_list_item(menu_id: str, item_id: str, data: ShoppingListItemUpdateRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    return update_shopping_list_item_service(db, user_id, menu_id, item_id, data.checked)