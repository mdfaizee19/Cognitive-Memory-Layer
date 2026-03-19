from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class MemoryType(str, Enum):
    """Enum for memory types"""
    PREFERENCE = "preference"
    CONSTRAINT = "constraint"
    COMMITMENT = "commitment"
    GOAL = "goal"
    IDENTITY = "identity"


class MemoryContext(BaseModel):
    """Context information for a memory"""
    location: Optional[str] = None
    time: Optional[str] = None
    related_entities: List[str] = Field(default_factory=list)


class MemoryExtractRequest(BaseModel):
    """Request schema for memory extraction"""
    prompt: str
    user_id: str = "default_user"


class MemoryResponse(BaseModel):
    """Response schema matching the required memory structure"""
    memory_id: str
    user_id: str
    memory_type: MemoryType
    entity: str
    attribute: str
    value: str
    context: MemoryContext
    trigger: str
    importance_score: float = Field(ge=0.0, le=1.0)
    confidence_score: float = Field(ge=0.0, le=1.0)
    origin_turn: int
    last_activated_turn: int
    created_at: str
    expires_at: Optional[str] = None

    class Config:
        from_attributes = True


class MemoryListResponse(BaseModel):
    """Response schema for list of memories"""
    memories: List[MemoryResponse]
    total: int
