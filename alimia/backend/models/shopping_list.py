from sqlalchemy import Column, ForeignKey, DateTime
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class ShoppingList(Base):
    __tablename__ = "shopping_lists"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    menu_id = Column(UUID(as_uuid=True), ForeignKey("menus.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))