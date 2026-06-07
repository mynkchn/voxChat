import json
import redis.asyncio as aioredis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
_redis = None


async def get_redis():
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(REDIS_URL, decode_responses=True)
    return _redis


async def publish(channel: str, data: dict):
    r = await get_redis()
    await r.publish(channel, json.dumps(data))


async def publish_dm(receiver_id: int, payload: dict):
    await publish(f"user:{receiver_id}", payload)


async def publish_group(group_id: int, payload: dict):
    await publish(f"group:{group_id}", payload)


async def publish_presence(payload: dict):
    await publish("presence", payload)
