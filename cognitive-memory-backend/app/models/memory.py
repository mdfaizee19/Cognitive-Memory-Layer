import uuid
import json
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, DateTime
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from app.database import Base


class Memory(Base):
    """SQLAlchemy model for memory storage"""
    __tablename__ = "memories"

    memory_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    memory_type = Column(String, nullable=False)
    
    entity = Column(String, nullable=False)
    attribute = Column(String, nullable=False)
    value = Column(Text, nullable=False)
    
    context = Column(Text, nullable=False, default="{}")  # JSON as text for SQLite
    trigger = Column(Text, nullable=False)
    
    importance_score = Column(Float, default=0.5)
    confidence_score = Column(Float, default=0.5)
    
    origin_turn = Column(Integer, default=0)
    last_activated_turn = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=True)

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            "memory_id": self.memory_id,
            "user_id": self.user_id,
            "memory_type": self.memory_type,
            "entity": self.entity,
            "attribute": self.attribute,
            "value": self.value,
            "context": json.loads(self.context) if isinstance(self.context, str) else self.context,
            "trigger": self.trigger,
            "importance_score": self.importance_score,
            "confidence_score": self.confidence_score,
            "origin_turn": self.origin_turn,
            "last_activated_turn": self.last_activated_turn,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }
