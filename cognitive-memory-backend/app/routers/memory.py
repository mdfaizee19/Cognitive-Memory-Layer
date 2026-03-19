from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.memory import (
    MemoryExtractRequest,
    MemoryResponse,
    MemoryListResponse,
    MemoryContext
)
from app.services.memory import (
    create_memory_from_prompt,
    get_memory_by_id,
    get_memories_by_user,
    get_all_memories
)

router = APIRouter(prefix="/api/memory", tags=["memory"])


@router.post("/extract", response_model=MemoryResponse)
async def extract_memory(
    request: MemoryExtractRequest,
    db: Session = Depends(get_db)
):
    """
    Extract memory from user prompt and store in database
    
    Args:
        request: Contains prompt and user_id
        db: Database session
        
    Returns:
        Extracted and stored memory
    """
    try:
        memory = await create_memory_from_prompt(
            prompt=request.prompt,
            user_id=request.user_id,
            db=db
        )
        return memory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract memory: {str(e)}")


@router.get("/{memory_id}", response_model=MemoryResponse)
def get_memory(memory_id: str, db: Session = Depends(get_db)):
    """
    Get a specific memory by ID
    
    Args:
        memory_id: UUID of the memory
        db: Database session
        
    Returns:
        Memory object
    """
    memory = get_memory_by_id(memory_id, db)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    memory_dict = memory.to_dict()
    return MemoryResponse(**memory_dict)


@router.get("/user/{user_id}", response_model=MemoryListResponse)
def get_user_memories(
    user_id: str,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all memories for a specific user
    
    Args:
        user_id: User identifier
        limit: Maximum number of memories to return
        db: Database session
        
    Returns:
        List of memories
    """
    memories = get_memories_by_user(user_id, db, limit)
    memory_responses = [MemoryResponse(**m.to_dict()) for m in memories]
    
    return MemoryListResponse(
        memories=memory_responses,
        total=len(memory_responses)
    )


@router.get("/", response_model=MemoryListResponse)
def list_memories(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all memories
    
    Args:
        limit: Maximum number of memories to return
        db: Database session
        
    Returns:
        List of all memories
    """
    memories = get_all_memories(db, limit)
    memory_responses = [MemoryResponse(**m.to_dict()) for m in memories]
    
    return MemoryListResponse(
        memories=memory_responses,
        total=len(memory_responses)
    )
