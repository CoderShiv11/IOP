import json
import logging
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

redis_client: Optional[aioredis.Redis] = None


async def init_redis() -> Optional[aioredis.Redis]:
    global redis_client
    try:
        redis_client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=3,
        )
        await redis_client.ping()
        logger.info("Successfully connected to Redis at %s:%s", settings.REDIS_HOST, settings.REDIS_PORT)
        return redis_client
    except Exception as e:
        logger.warning("Redis connection failed (%s). Continuing in fallback in-memory cache mode.", str(e))
        redis_client = None
        return None


async def close_redis() -> None:
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed.")


class CacheService:
    """Async Redis-backed cache with in-memory fallback."""
    _memory_fallback: dict = {}

    @classmethod
    async def get(cls, key: str) -> Optional[Any]:
        if redis_client:
            try:
                val = await redis_client.get(key)
                if val:
                    return json.loads(val)
            except Exception as e:
                logger.error("Redis get failed for key %s: %s", key, e)
        # Fallback
        entry = cls._memory_fallback.get(key)
        return entry

    @classmethod
    async def set(cls, key: str, value: Any, ttl_seconds: int = settings.REDIS_TTL_DEFAULT) -> bool:
        serialized = json.dumps(value, default=str)
        if redis_client:
            try:
                await redis_client.set(key, serialized, ex=ttl_seconds)
                return True
            except Exception as e:
                logger.error("Redis set failed for key %s: %s", key, e)
        # Fallback
        cls._memory_fallback[key] = value
        return True

    @classmethod
    async def delete(cls, key: str) -> bool:
        if redis_client:
            try:
                await redis_client.delete(key)
                return True
            except Exception as e:
                logger.error("Redis delete failed for key %s: %s", key, e)
        cls._memory_fallback.pop(key, None)
        return True

