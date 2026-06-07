from pydantic import BaseModel
from datetime import datetime


class MessageResponseSchema(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message: str
    delivered: bool
    seen: bool
    created_at: datetime

    class Config:
        from_attributes = True