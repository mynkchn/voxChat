from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from database.connection import get_db
from database.models import Message, User, Group, GroupMember, GroupMessage
from auth.dependencies import get_current_user
from chat.schemas import MessageResponseSchema
from websocket.manager import manager

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/messages/{user_id}", response_model=list[MessageResponseSchema])
async def get_messages(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            and_(Message.sender_id == user_id, Message.receiver_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()
    return messages


@router.get("/conversations")
async def get_conversations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # All user IDs that have exchanged messages with current user
    sent_ids = {row.receiver_id for row in db.query(Message.receiver_id).filter(Message.sender_id == current_user.id)}
    recv_ids = {row.sender_id for row in db.query(Message.sender_id).filter(Message.receiver_id == current_user.id)}
    peer_ids = sent_ids | recv_ids

    result = []
    for uid in peer_ids:
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            continue
        # Latest message in this thread
        last_msg = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == uid),
                and_(Message.sender_id == uid, Message.receiver_id == current_user.id)
            )
        ).order_by(Message.created_at.desc()).first()

        # Unread = messages from them to me that haven't been seen
        unread = db.query(func.count(Message.id)).filter(
            Message.sender_id == uid,
            Message.receiver_id == current_user.id,
            Message.seen == False
        ).scalar()

        result.append({
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "profile_picture": user.profile_picture,
            "last_message": last_msg.message if last_msg else None,
            "last_message_at": last_msg.created_at.isoformat() if last_msg else None,
            "unread_count": unread,
        })

    # Sort by most recent message
    result.sort(key=lambda x: x["last_message_at"] or "", reverse=True)
    return result


@router.get("/online-users")
async def get_online_users(current_user=Depends(get_current_user)):
    online_ids = list(manager.active_connections.keys())
    return {"online_user_ids": online_ids}

@router.post("/groups")
async def create_group(
    data: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Group name required")
    group = Group(group_name=name, created_by=current_user.id)
    db.add(group)
    db.commit()
    db.refresh(group)
    # Add creator as first member
    member = GroupMember(group_id=group.id, user_id=current_user.id)
    db.add(member)
    # Add extra member_ids if provided
    for mid in data.get("member_ids", []):
        if mid != current_user.id:
            db.add(GroupMember(group_id=group.id, user_id=mid))
    db.commit()
    return {"id": group.id, "name": group.group_name, "created_by": group.created_by}


@router.get("/groups")
async def get_groups(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    memberships = db.query(GroupMember).filter(GroupMember.user_id == current_user.id).all()
    result = []
    for m in memberships:
        group = db.query(Group).filter(Group.id == m.group_id).first()
        if not group:
            continue
        last_msg = db.query(GroupMessage).filter(
            GroupMessage.group_id == group.id
        ).order_by(GroupMessage.created_at.desc()).first()
        result.append({
            "id": group.id,
            "name": group.group_name,
            "group_photo": group.group_photo,
            "created_by": group.created_by,
            "last_message": last_msg.message if last_msg else None,
            "last_message_at": last_msg.created_at.isoformat() if last_msg else None,
            "unread_count": 0,
        })
    return result


@router.get("/groups/{group_id}/messages")
async def get_group_messages(
    group_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Verify membership
    membership = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")

    messages = db.query(GroupMessage).filter(
        GroupMessage.group_id == group_id
    ).order_by(GroupMessage.created_at.asc()).all()

    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "group_id": m.group_id,
            "message": m.message,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.post("/groups/{group_id}/members")
async def add_group_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    existing = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id
    ).first()
    if existing:
        return {"message": "Already a member"}
    db.add(GroupMember(group_id=group_id, user_id=user_id))
    db.commit()
    return {"message": "Member added"}
