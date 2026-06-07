from sqlalchemy.orm import Mapped,mapped_column,DeclarativeBase,relationship
from sqlalchemy import (
    Integer,
    Boolean,
    String,
    DateTime,
    Text,
    ForeignKey,
)
from datetime import datetime,timezone,timedelta

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    profile_picture: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    last_seen: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    sent_messages = relationship(
        "Message",
        foreign_keys="Message.sender_id",
        back_populates="sender"
    )

    received_messages = relationship(
        "Message",
        foreign_keys="Message.receiver_id",
        back_populates="receiver"
    )

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    sender_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    receiver_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    message: Mapped[str] = mapped_column(
        Text
    )

    message_type: Mapped[str] = mapped_column(
        String(50),
        default="text"
    )

    delivered: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    seen: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    sender = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="sent_messages"
    )

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
        back_populates="received_messages"
    )

# class Message(Base):
#     __tablename__ = "messages"

#     id: Mapped[int] = mapped_column(
#         Integer,
#         primary_key=True
#     )

#     sender_id: Mapped[int] = mapped_column(
#         ForeignKey("users.id")
#     )

#     receiver_id: Mapped[int] = mapped_column(
#         ForeignKey("users.id")
#     )

#     message: Mapped[str] = mapped_column(
#         Text
#     )

#     message_type: Mapped[str] = mapped_column(
#         String(50),
#         default="text"
#     )

#     delivered: Mapped[bool] = mapped_column(
#         Boolean,
#         default=False
#     )

#     seen: Mapped[bool] = mapped_column(
#         Boolean,
#         default=False
#     )

#     created_at: Mapped[datetime] = mapped_column(
#         DateTime,
#         default=datetime.utcnow
#     )

#     sender = relationship(
#         "User",
#         foreign_keys=[sender_id],
#         back_populates="sent_messages"
#     )

#     receiver = relationship(
#         "User",
#         foreign_keys=[receiver_id],
#         back_populates="received_messages"
#     )

class Group(Base):
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    group_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    group_photo: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    members = relationship(
        "GroupMember",
        back_populates="group",
        cascade="all, delete"
    )

    messages = relationship(
        "GroupMessage",
        back_populates="group",
        cascade="all, delete"
    )
    
class GroupMember(Base):
    __tablename__ = "group_members"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    group_id: Mapped[int] = mapped_column(
        ForeignKey("groups.id")
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    group = relationship(
        "Group",
        back_populates="members"
    )

    user = relationship("User")


class GroupMessage(Base):
    __tablename__ = "group_messages"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    group_id: Mapped[int] = mapped_column(
        ForeignKey("groups.id")
    )

    sender_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    message: Mapped[str] = mapped_column(
        Text
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    group = relationship(
        "Group",
        back_populates="messages"
    )

    sender = relationship("User")


