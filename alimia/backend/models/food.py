from sqlalchemy import Column, String, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class Food(Base):
    __tablename__ = "foods"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ciqual_code = Column(Integer)
    name = Column(String(255), nullable=False)
    energy_cal = Column(Float, nullable=True)
    proteins = Column(Float, nullable=True)
    carbohydrates = Column(Float, nullable=True)
    sugars = Column(Float, nullable=True)
    fats = Column(Float, nullable=True)
    saturated_fats = Column(Float, nullable=True)
    fiber = Column(Float, nullable=True)
    sodium = Column(Float, nullable=True)
    calcium = Column(Float, nullable=True)
    iron = Column(Float, nullable=True)
    magnesium = Column(Float, nullable=True)
    vitamin_a = Column(Float, nullable=True)
    vitamin_c = Column(Float, nullable=True)
    vitamin_d = Column(Float, nullable=True)
    vitamin_e = Column(Float, nullable=True)
    vitamin_b9 = Column(Float, nullable=True)
    vitamin_b12 = Column(Float, nullable=True)
