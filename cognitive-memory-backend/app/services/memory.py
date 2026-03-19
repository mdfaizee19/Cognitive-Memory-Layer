import uuid
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.memory import Memory
from app.schemas.memory import MemoryResponse, MemoryContext
from app.services.openrouter import extract_memory_from_prompt


async def create_memory_from_prompt(
    prompt: str,
    user_id: str,
    db: Session,
    origin_turn: int = 0
) -> MemoryResponse:
    """
    Process a user prompt, extract memory, and save to database
    
    Args:
        prompt: User's input text
        user_id: User identifier
        db: Database session
        origin_turn: Turn number when memory was created
        
    Returns:
        MemoryResponse object
    """
    # Extract memory structure from LLM
    llm_data = await extract_memory_from_prompt(prompt)
    
    # Generate unique ID and timestamps
    memory_id = str(uuid.uuid4())
    created_at = datetime.utcnow()
    
    # Parse context
    context = llm_data.get("context", {})
    
    # Create database model
    memory = Memory(
        memory_id=memory_id,
        user_id=user_id,
        memory_type=llm_data["memory_type"],
        entity=llm_data["entity"],
        attribute=llm_data["attribute"],
        value=llm_data["value"],
        context=json.dumps(context),  # Store as JSON string
        trigger=llm_data["trigger"],
        importance_score=llm_data.get("importance_score", 0.5),
        confidence_score=llm_data.get("confidence_score", 0.5),
        origin_turn=origin_turn,
        last_activated_turn=origin_turn,
        created_at=created_at,
        expires_at=None
    )
    
    # Save to database
    db.add(memory)
    db.commit()
    db.refresh(memory)
    
    # Return as MemoryResponse
    return MemoryResponse(
        memory_id=memory.memory_id,
        user_id=memory.user_id,
        memory_type=memory.memory_type,
        entity=memory.entity,
        attribute=memory.attribute,
        value=memory.value,
        context=MemoryContext(**context),
        trigger=memory.trigger,
        importance_score=memory.importance_score,
        confidence_score=memory.confidence_score,
        origin_turn=memory.origin_turn,
        last_activated_turn=memory.last_activated_turn,
        created_at=memory.created_at.isoformat(),
        expires_at=memory.expires_at.isoformat() if memory.expires_at else None
    )


def get_memory_by_id(memory_id: str, db: Session) -> Optional[Memory]:
    """Get a specific memory by ID"""
    return db.query(Memory).filter(Memory.memory_id == memory_id).first()


def get_memories_by_user(user_id: str, db: Session, limit: int = 100) -> List[Memory]:
    """Get all memories for a specific user"""
    return db.query(Memory)\
        .filter(Memory.user_id == user_id)\
        .order_by(Memory.created_at.desc())\
        .limit(limit)\
        .all()


def get_all_memories(db: Session, limit: int = 100) -> List[Memory]:
    """Get all memories"""
    return db.query(Memory)\
        .order_by(Memory.created_at.desc())\
        .limit(limit)\
        .all()
