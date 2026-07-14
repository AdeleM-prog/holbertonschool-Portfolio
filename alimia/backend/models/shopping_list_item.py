from sqlalchemy import Column, String, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    shopping_list_id = Column(UUID(as_uuid=True), ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=False)
    ingredient = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20))
    checked = Column(Boolean, default=False, nullable=False)