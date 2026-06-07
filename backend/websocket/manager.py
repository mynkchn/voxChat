from fastapi import WebSocket
from database.models import *


class ConnectionManager:

    def __init__(self):
        self.active_connections: dict[int,WebSocket]={} # store the user_id with websocket connection

    async def connect(self,user_id:int,websocket:WebSocket) -> None:
        await websocket.accept()
        self.active_connections[user_id]=websocket

    def disconnect(self,user_id:int)-> None:
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self,user_id:int,data:dict)-> None:
        connection=self.active_connections.get(user_id)        
        if connection:
            await connection.send_json(data)
        else:
            return None

    async def broadcast(self,data:dict)-> None:
        for connection in self.active_connections.values():
            await connection.send_json(data)

    async def is_user_online(self,user_id:int)-> bool:
        if user_id in self.active_connections:
            return True
        return False 

manager=ConnectionManager()