from fastapi import APIRouter,WebSocket,WebSocketDisconnect
from websocket.manager import manager
from auth.dependencies import get_current_user_ws
from database.connection import get_db
from sqlalchemy.orm import Session
from .events import handle_event


router=APIRouter()

# socket route
@router.websocket('/ws')
async def websocket_endpoint(websocket:WebSocket):
    try:
        token=websocket.query_params.get('token')
        db=next(get_db())
        user=await get_current_user_ws(token,db)
        await manager.connect(user.id,websocket)
        while True:
            data=await websocket.receive_json()
            await handle_event(user.id,data,db)
    except WebSocketDisconnect:
        manager.disconnect(user.id)

