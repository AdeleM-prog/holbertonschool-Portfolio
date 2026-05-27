from fastapi import FastAPI
from database import engine

app = FastAPI()

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
