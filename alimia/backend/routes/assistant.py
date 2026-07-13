from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.auth import verify_token
from schemas.assistant import AssistantAskRequest, AssistantAskResponse
from services.assistant import ask_assistant_service

assistant_router = APIRouter(prefix="/assistant", tags=["assistant"])

@assistant_router.post("/ask", response_model=AssistantAskResponse)
def ask(data: AssistantAskRequest, db: Session = Depends(get_db), user_id: str = Depends(verify_token)):
    answer = ask_assistant_service(db, user_id, data.question)
    return AssistantAskResponse(answer=answer)