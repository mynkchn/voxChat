import asyncio
import json
import redis.asyncio as aioredis
import os
from websocket.manager import manager

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")


async def _route(channel: str, raw: str):
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return

    if channel.startswith("user:"):
        user_id = int(channel.split(":")[1])
        await manager.send_personal_message(user_id, data)

    elif channel.startswith("group:"):
        sender_id = data.get("sender_id")
        for user_id in list(manager.active_connections):
            if user_id != sender_id:
                await manager.send_personal_message(user_id, data)

    elif channel == "presence":
        await manager.broadcast(data)


async def _listen(pubsub):
    async for msg in pubsub.listen():
        if msg["type"] in ("message", "pmessage"):
            await _route(msg["channel"], msg["data"])


async def start_subscriber():
    r = aioredis.from_url(REDIS_URL, decode_responses=True)
    pubsub = r.pubsub()
    await pubsub.psubscribe("user:*", "group:*", "presence")
    asyncio.create_task(_listen(pubsub))
