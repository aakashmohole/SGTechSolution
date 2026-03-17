from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserInDBBase(UserBase):
    id: int
    role: str

    model_config = ConfigDict(from_attributes=True)

class User(UserInDBBase):
    pass
