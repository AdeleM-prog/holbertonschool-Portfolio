from sqlalchemy import Column, String, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class RecipeIngredients(Base):
    __tablename__ = "recipe_ingredients"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipe_id = Column(UUID(as_uuid=True), ForeignKey("recipes.id", ondelete="CASCADE"), nullable=True)
    food_id = Column(UUID(as_uuid=True), ForeignKey("foods.id"))
    quantity = Column(Float)
    unit = Column(String)
    state = Column(String, nullable=True)