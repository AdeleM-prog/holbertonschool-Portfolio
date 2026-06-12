from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models.user import User
from routes.auth import auth_router
from routes.users import users_router
from models.food import Food

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
