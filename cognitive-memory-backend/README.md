# Cognitive Memory Backend

FastAPI backend service for extracting and storing cognitive memories using OpenRouter AI.

## Features

- 🧠 **Memory Extraction**: Uses LLM to extract structured memories from user prompts
- 💾 **Database Storage**: SQLite database for persistent memory storage
- 🔗 **API Endpoints**: RESTful API for memory management
- 🌐 **CORS Enabled**: Ready for frontend integration

## Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Configure environment**:
Make sure the `.env` file in the parent directory contains:
```
OPENROUTER_API_KEY=your_api_key_here
```

3. **Run the server**:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Extract Memory
```bash
POST /api/memory/extract
Content-Type: application/json

{
  "prompt": "I prefer dark mode",
  "user_id": "user123"
}
```

### Get Memory by ID
```bash
GET /api/memory/{memory_id}
```

### Get User's Memories
```bash
GET /api/memory/user/{user_id}
```

### List All Memories
```bash
GET /api/memory/
```

### Health Check
```bash
GET /api/health
```

## Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Memory Schema

Memories are structured as:
```json
{
  "memory_id": "uuid",
  "user_id": "string",
  "memory_type": "preference|constraint|commitment|goal|identity",
  "entity": "string",
  "attribute": "string",
  "value": "string",
  "context": {
    "location": "string|null",
    "time": "ISO8601|null",
    "related_entities": []
  },
  "trigger": "string",
  "importance_score": 0.0,
  "confidence_score": 0.0,
  "origin_turn": 0,
  "last_activated_turn": 0,
  "created_at": "timestamp",
  "expires_at": "timestamp|null"
}
```
