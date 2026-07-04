from pydantic import BaseModel

class AssistantAskRequest(BaseModel):
    question: str

class AssistantAskResponse(BaseModel):
    answer: str