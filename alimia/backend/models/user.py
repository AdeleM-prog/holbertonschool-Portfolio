from sqlalchemy import Column, String, Integer, Date, DateTime
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from database import Base

class User (Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    gender = Column(String(20))
    birth_date = Column(Date)
    household_size = Column(Integer)
    meals = Column(ARRAY(String))
    dietary_constraints = Column(ARRAY(String))
    dietary_constraints_other = Column(String(255))
    diet_type = Column(String(50))
    liked_foods = Column(ARRAY(Integer))
    disliked_foods = Column(ARRAY(Integer))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
