from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    first_name : str
    email : EmailStr
    password : str = Field(min_length=12)

class LoginRequest(BaseModel):
    email :  EmailStr
    password : str

class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str