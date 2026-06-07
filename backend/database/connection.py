from sqlalchemy.orm import sessionmaker,Session
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
from .models import Base

load_dotenv()
DATABASE_URL=os.getenv('DATABASE_URL')
engine=create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
SessionLocal=sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
