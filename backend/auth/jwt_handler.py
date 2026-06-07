from passlib.context import CryptContext
from jose import jwt,JWTError
from datetime import datetime,timedelta,timezone
import os
from dotenv import load_dotenv

load_dotenv()
handler=CryptContext(schemes=['bcrypt'],deprecated='auto')
SECRET_KEY=os.getenv('SECRET_KEY')
ALGORITHM="HS256"

class JwtHandler:
    
    # creates jwt token
    def create_token(self,data:dict) -> str:
        to_encode=data.copy()
        expire=datetime.now(timezone.utc)+timedelta(minutes=1840)
        to_encode.update({
            "exp":expire,
        })
        token=jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
        return token

    # validates the hashed and plain password
    def verify(self,plain:str,hashed:str) -> bool:
        return handler.verify(plain,hashed)

    # generates the hashed password
    def hash_password(self,password:str) -> str:
        hashed=handler.hash(password)
        return hashed

    # decode the access token to get user details
    def decode_access_token(self,token:str)-> dict|None:
        try:
           payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
           return payload
        except JWTError:
               return None

