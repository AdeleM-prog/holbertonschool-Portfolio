from sqlalchemy import Column, String, ForeignKey, DateTime, Integer
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from database import Base

class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    prep_time = Column(Integer)
    cook_time = Column(Integer)
    cooking_methods = Column(String)
    steps = Column(ARRAY(String))
    servings = Column(Integer)
    meal_type = Column(ARRAY(String))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))