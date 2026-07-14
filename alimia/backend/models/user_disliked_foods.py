from sqlalchemy import Column, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class DislikedFoods(Base):
    __tablename__ = "disliked_foods"
    __table_args__ = (UniqueConstraint('user_id', 'food_id', name='uq_disliked_foods_user_food'),)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_id = Column(UUID(as_uuid=True), ForeignKey("foods.id"), nullable=False)