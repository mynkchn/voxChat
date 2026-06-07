from fastapi import HTTPException, Depends, APIRouter, status
from sqlalchemy.orm import Session
from database.models import User
from database.connection import get_db
from auth.jwt_handler import JwtHandler
from auth.dependencies import get_current_user
from pydantic import BaseModel, EmailStr, Field

class SignUpSchema(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

router = APIRouter(prefix='/auth', tags=['Authentication'])
jwt_handler = JwtHandler()

@router.post('/signup')
async def signup(data: SignUpSchema, db: Session = Depends(get_db)) -> dict:
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Email already exists')
    existing_username = db.query(User).filter(User.username == data.username).first()
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Username already taken')
    hashed_password = jwt_handler.hash_password(data.password)
    user = User(username=data.username, email=data.email, password_hash=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "user created successfully"}

@router.post('/login')
async def login(data: LoginSchema, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail='Invalid Credentials')
    is_valid = jwt_handler.verify(data.password, user.password_hash)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect Password')
    token = jwt_handler.create_token({'user_id': user.id})
    return {'access_token': token, 'token_type': 'bearer'}

@router.get('/me')
async def me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "profile_picture": current_user.profile_picture,
    }

@router.get('/users/search')
async def search_users(
    q: str = "",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not q.strip():
        return []
    results = (
        db.query(User)
        .filter(
            User.username.ilike(f"%{q.strip()}%"),
            User.id != current_user.id
        )
        .limit(20)
        .all()
    )
    return [
        {"id": u.id, "username": u.username, "email": u.email, "profile_picture": u.profile_picture}
        for u in results
    ]
