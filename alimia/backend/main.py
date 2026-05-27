from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine

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
        print("Connexion à la base de données réussie")
    except Exception as e:
        print(f"Erreur de connexion : {e}")

@app.get("/health")
def health_check():
    return {"status": "ok"}
