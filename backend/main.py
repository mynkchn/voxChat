from fastapi import FastAPI,Depends
import uvicorn
from auth.routes import router as auth_router
from database.models import *
from websocket.routes import router as websocket_router
from chat.routes import router as chat_router
from fastapi.middleware.cors import CORSMiddleware


app=FastAPI(title='RunMySocials')

# middleware to integrate with front end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include the api routes of other apps
app.include_router(auth_router)
app.include_router(websocket_router)
app.include_router(chat_router)

# root route
@app.get('/')
async def root() -> dict:
    return {'status':'ok'}

if __name__=='__main__':
    uvicorn.run(app,host='localhost',port=5000)