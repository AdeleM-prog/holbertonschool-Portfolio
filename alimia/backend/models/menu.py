from sqlalchemy import Column, String, Date, DateTime, ForeignKey
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class Menu(Base):
    __tablename__ = "menus"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String(20), nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))