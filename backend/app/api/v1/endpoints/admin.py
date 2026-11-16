from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.ipo import IPO
from app.models.sentiment import NewsArticle
from app.schemas.auth import UserProfileResponse, AdminUserListResponse
from app.api.deps import require_admin

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/users", response_model=AdminUserListResponse)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only: list registered users with pagination and optional search."""
    query = select(User)
    count_query = select(func.count(User.id))

    if search:
        search_filter = (User.email.ilike(f"%{search}%")) | (User.username.ilike(f"%{search}%"))
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    query = query.order_by(desc(User.created_at)).offset(skip).limit(limit)

    users_res = await db.execute(query)
    users = users_res.scalars().all()

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    return AdminUserListResponse(
        users=[UserProfileResponse.model_validate(u) for u in users],
        total=total
    )


@router.get("/users/{user_id}", response_model=UserProfileResponse)
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    """Admin-only: retrieve a single user profile."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserProfileResponse.model_validate(user)


@router.put("/users/{user_id}/role", response_model=UserProfileResponse)
async def update_user_role(
    user_id: int,
    role: UserRole = Query(..., description="Target role: admin, user, analyst"),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only: promote or change a user's role."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.role = role
    await db.commit()
    await db.refresh(user)
    return UserProfileResponse.model_validate(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def deactivate_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Admin-only: deactivate a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.is_active = False
    await db.commit()
    return {"message": f"User {user.username} (ID: {user_id}) has been deactivated."}


@router.get("/stats")
async def get_admin_platform_stats(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Admin-only: overall platform system statistics."""
    total_users_res = await db.execute(select(func.count(User.id)))
    total_users = total_users_res.scalar() or 0

    active_users_res = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    active_users = active_users_res.scalar() or 0

    total_ipos_res = await db.execute(select(func.count(IPO.id)))
    total_ipos = total_ipos_res.scalar() or 0

    total_news_res = await db.execute(select(func.count(NewsArticle.id)))
    total_news = total_news_res.scalar() or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_ipos_tracked": total_ipos,
        "total_news_articles": total_news,
        "system_status": "ONLINE",
        "redis_cache": "CONNECTED",
        "database_engine": "PostgreSQL 16 (Async Engine)"
    }
