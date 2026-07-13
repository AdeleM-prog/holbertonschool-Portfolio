from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models.user import User
from models.household_members import HouseholdMembers
from models.user_liked_foods import LikedFoods
from models.user_disliked_foods import DislikedFoods
from models.recipe import Recipe
from models.recipe_ingredients import RecipeIngredients
from models.user_favorites import FavoriteRecipes
from models.menu import Menu
from models.menu_meals import MenuMeal
from models.shopping_list import ShoppingList
from models.shopping_list_item import ShoppingListItem
from routes.auth import auth_router
from models.food import Food
from routes.users import users_router
from routes.foods import foods_router
from routes.household_members import HH_members_router
from routes.liked_foods import liked_foods_router
from routes.disliked_foods import disliked_foods_router
from routes.recipes import recipe_router
from routes.favorites import favorites_router
from routes.menus import menu_router
from routes.assistant import assistant_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    try:
        conn = engine.connect()
        conn.close()
        Base.metadata.create_all(bind=engine)
        print("Connexion à la base de données réussie")
    except Exception as e:
        print(f"Erreur de connexion : {e}")

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(foods_router)
app.include_router(HH_members_router)
app.include_router(liked_foods_router)
app.include_router(disliked_foods_router)
app.include_router(recipe_router)
app.include_router(favorites_router)
app.include_router(menu_router)
app.include_router(assistant_router)
