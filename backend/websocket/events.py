from sqlalchemy.orm import Session
from database.models import Message, User, Group, GroupMember, GroupMessage
from websocket.manager import manager


async def handle_event(sender_id: int, data: dict, db: Session):
    event_map = {
        "message":       handle_message_event,
        "typing":        handle_typing_event,
        "seen":          handle_seen_event,
        "online":        handle_online_event,
        "offline":       handle_offline_event,
        "group_message": handle_group_message_event,
        "group_typing":  handle_group_typing_event,
    }
    handler = event_map.get(data.get("type"))
    if handler:
        await handler(sender_id, data, db)



async def handle_message_event(sender_id: int, data: dict, db: Session):
    receiver_id = data.get("receiver_id")
    message     = data.get("message")
    if not receiver_id or not message:
        return
    receiver = db.query(User).filter(User.id == receiver_id).first()
    if not receiver:
        return

    new_msg = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        message=message,
        delivered=False,
        seen=False
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    # Push to receiver if online
    online = await manager.is_user_online(receiver_id)
    if online:
        await manager.send_personal_message(receiver_id, {
            "type":       "message",
            "message_id": new_msg.id,
            "sender_id":  sender_id,
            "message":    message,
            "created_at": new_msg.created_at.isoformat(),
        })
        new_msg.delivered = True
        db.commit()

    # Notify sender of delivery confirmation (optimistic → real id + delivered flag)
    await manager.send_personal_message(sender_id, {
        "type":       "delivered",
        "message_id": new_msg.id,
    })



async def handle_typing_event(sender_id: int, data: dict, db: Session):
    receiver_id = data.get("receiver_id")
    if not receiver_id:
        return
    await manager.send_personal_message(receiver_id, {
        "type":      "typing",
        "sender_id": sender_id,
    })


async def handle_seen_event(sender_id: int, data: dict, db: Session):
    message_ids = data.get("message_ids")
    if not message_ids:
        return

    messages = db.query(Message).filter(Message.id.in_(message_ids)).all()
    notified_senders = set()
    for msg in messages:
        msg.seen = True
        notified_senders.add(msg.sender_id)
    db.commit()

    # Notify original senders their messages were seen
    for sid in notified_senders:
        await manager.send_personal_message(sid, {
            "type":        "seen",
            "message_ids": message_ids,
        })

async def handle_online_event(sender_id: int, data: dict, db: Session):
    await manager.broadcast({"type": "online", "user_id": sender_id})

async def handle_offline_event(sender_id: int, data: dict, db: Session):
    await manager.broadcast({"type": "offline", "user_id": sender_id})


async def handle_group_message_event(sender_id: int, data: dict, db: Session):
    group_id = data.get("group_id")
    message  = data.get("message")
    if not group_id or not message:
        return

    # Verify sender is a member
    membership = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == sender_id
    ).first()
    if not membership:
        return

    new_msg = GroupMessage(group_id=group_id, sender_id=sender_id, message=message)
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    # Push to all other online members
    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    for m in members:
        if m.user_id == sender_id:
            continue
        await manager.send_personal_message(m.user_id, {
            "type":       "group_message",
            "message_id": new_msg.id,
            "group_id":   group_id,
            "sender_id":  sender_id,
            "message":    message,
            "created_at": new_msg.created_at.isoformat(),
        })

    # Ack back to sender
    await manager.send_personal_message(sender_id, {
        "type":       "group_delivered",
        "message_id": new_msg.id,
        "group_id":   group_id,
    })


async def handle_group_typing_event(sender_id: int, data: dict, db: Session):
    group_id = data.get("group_id")
    if not group_id:
        return

    members = db.query(GroupMember).filter(GroupMember.group_id == group_id).all()
    for m in members:
        if m.user_id == sender_id:
            continue
        await manager.send_personal_message(m.user_id, {
            "type":      "group_typing",
            "group_id":  group_id,
            "sender_id": sender_id,
        })
