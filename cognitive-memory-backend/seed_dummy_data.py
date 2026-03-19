"""
Script to populate the database with 10 dummy memory entries
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, init_db
from app.models.memory import Memory
import uuid
import json
from datetime import datetime, timedelta
import random

# Initialize database
init_db()

# Create dummy memories
dummy_memories = [
    {
        "user_id": "demo_user",
        "memory_type": "preference",
        "entity": "user",
        "attribute": "theme_preference",
        "value": "dark_mode",
        "context": {"location": None, "time": None, "related_entities": ["UI", "settings"]},
        "trigger": "User prefers dark mode for better eye comfort",
        "importance_score": 0.95,
        "confidence_score": 0.98
    },
    {
        "user_id": "demo_user",
        "memory_type": "goal",
        "entity": "user",
        "attribute": "learning_goal",
        "value": "machine_learning",
        "context": {"location": None, "time": "2026-06", "related_entities": ["Python", "AI", "courses"]},
        "trigger": "User wants to master machine learning by June 2026",
        "importance_score": 0.92,
        "confidence_score": 0.89
    },
    {
        "user_id": "demo_user",
        "memory_type": "constraint",
        "entity": "user",
        "attribute": "dietary_restriction",
        "value": "vegetarian",
        "context": {"location": None, "time": None, "related_entities": ["food", "health"]},
        "trigger": "User follows a vegetarian diet",
        "importance_score": 0.88,
        "confidence_score": 0.95
    },
    {
        "user_id": "demo_user",
        "memory_type": "commitment",
        "entity": "user",
        "attribute": "daily_routine",
        "value": "morning_workout",
        "context": {"location": "gym", "time": "06:00:00", "related_entities": ["fitness", "health"]},
        "trigger": "User committed to daily morning workouts at 6 AM",
        "importance_score": 0.85,
        "confidence_score": 0.87
    },
    {
        "user_id": "demo_user",
        "memory_type": "identity",
        "entity": "user",
        "attribute": "profession",
        "value": "software_engineer",
        "context": {"location": "San Francisco", "time": None, "related_entities": ["career", "technology"]},
        "trigger": "User identifies as a software engineer in San Francisco",
        "importance_score": 0.82,
        "confidence_score": 0.93
    },
    {
        "user_id": "demo_user",
        "memory_type": "preference",
        "entity": "user",
        "attribute": "communication_style",
        "value": "direct_concise",
        "context": {"location": None, "time": None, "related_entities": ["communication", "work"]},
        "trigger": "User prefers direct and concise communication",
        "importance_score": 0.78,
        "confidence_score": 0.84
    },
    {
        "user_id": "demo_user",
        "memory_type": "goal",
        "entity": "user",
        "attribute": "travel_goal",
        "value": "visit_japan",
        "context": {"location": "Tokyo", "time": "2026-12", "related_entities": ["travel", "culture"]},
        "trigger": "User plans to visit Japan in December 2026",
        "importance_score": 0.75,
        "confidence_score": 0.81
    },
    {
        "user_id": "demo_user",
        "memory_type": "preference",
        "entity": "user",
        "attribute": "music_taste",
        "value": "electronic_ambient",
        "context": {"location": None, "time": None, "related_entities": ["music", "relaxation"]},
        "trigger": "User enjoys electronic and ambient music",
        "importance_score": 0.71,
        "confidence_score": 0.79
    },
    {
        "user_id": "demo_user",
        "memory_type": "constraint",
        "entity": "user",
        "attribute": "time_constraint",
        "value": "no_meetings_before_10am",
        "context": {"location": "office", "time": "10:00:00", "related_entities": ["work", "schedule"]},
        "trigger": "User prefers no meetings before 10 AM",
        "importance_score": 0.68,
        "confidence_score": 0.76
    },
    {
        "user_id": "demo_user",
        "memory_type": "identity",
        "entity": "user",
        "attribute": "hobby",
        "value": "photography",
        "context": {"location": None, "time": "weekends", "related_entities": ["creative", "art"]},
        "trigger": "User practices photography as a hobby on weekends",
        "importance_score": 0.64,
        "confidence_score": 0.73
    }
]

# Add memories to database
db = SessionLocal()
try:
    print("Adding 10 dummy memories to the database...")
    for i, mem_data in enumerate(dummy_memories, 1):
        memory = Memory(
            memory_id=str(uuid.uuid4()),
            user_id=mem_data["user_id"],
            memory_type=mem_data["memory_type"],
            entity=mem_data["entity"],
            attribute=mem_data["attribute"],
            value=mem_data["value"],
            context=json.dumps(mem_data["context"]),
            trigger=mem_data["trigger"],
            importance_score=mem_data["importance_score"],
            confidence_score=mem_data["confidence_score"],
            origin_turn=i,
            last_activated_turn=i,
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            expires_at=None
        )
        db.add(memory)
        print(f"  ✓ Added: {mem_data['memory_type']} - {mem_data['trigger'][:50]}...")
    
    db.commit()
    print("\n✅ Successfully added 10 dummy memories to the database!")
    print("You can now see them in the hierarchical structure.\n")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
