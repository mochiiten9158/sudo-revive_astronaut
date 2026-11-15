
from datetime import datetime, timezone

from sqlalchemy import (
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    username: Mapped[str] = mapped_column(
        String(80), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(30), default="astronaut", nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    astronaut_profile: Mapped["Astronaut"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Mission(Base):
    __tablename__ = "missions"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    mission_code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    mission_name: Mapped[str] = mapped_column(
        String(150), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), default="planned", nullable=False
    )
    start_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    astronauts: Mapped[list["Astronaut"]] = relationship(
        back_populates="mission"
    )


class Astronaut(Base):
    __tablename__ = "astronauts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    astronaut_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    display_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    mission_id: Mapped[int | None] = mapped_column(
        ForeignKey("missions.id", ondelete="SET NULL"),
        nullable=True
    )

    dataset_subject_id: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="astronaut_profile")
    mission: Mapped["Mission | None"] = relationship(back_populates="astronauts")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    action: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    resource_type: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    resource_id: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    details: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )