from fastapi import Depends,HTTPException,status
from fastapi.security import OAuth2PasswordBearer
from auth.jwt_handler import JwtHandler
from database.connection import get_db
from database.models import User 
from sqlalchemy.orm import Session


# extacting the bearer token from the base login url payload
oauth2_scheme=OAuth2PasswordBearer(tokenUrl='/auth/login')
jwt_handler=JwtHandler()


# for handling the normal http authentication
async def get_current_user(token:str=Depends(oauth2_scheme),db:Session=Depends(get_db)):
        payload=jwt_handler.decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='Invalid Token')
        user_id=payload.get('user_id')
        user=db.query(User).filter(User.id==user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail='User not found')
        return user

# for handling the websocket connection 
async def get_current_user_ws(token:str,db:Session):
        payload=jwt_handler.decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='Invalid Token')
        user_id=payload.get('user_id')
        user=db.query(User).filter(User.id==user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail='User not found')
        return user
   
        
    
