from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    first_name : str
    email : EmailStr
    password : str = Field(min_length=12)