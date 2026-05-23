# Mnemosyne Cognitive Memory Layer

AI-powered cognitive memory system that extracts and stores structured memories from user interactions. Features a FastAPI backend with LLM integration via OpenRouter for intelligent memory extraction, and a modern React frontend with Material-UI components for a seamless user experience.

Built as an MVP product experiment for the Neurohacks Hackathon 2026, focused on exploring how AI can simulate long-term contextual memory and personalized recall systems.

- `cognitive-memory-backend/`: FastAPI backend for memory extraction, storage, and retrieval.
- `cognitive-memory-frontend/`: Vite React frontend for interacting with the memory API.

## Features

- Extracts structured memories from user prompts
- Stores memories in SQLite
- Exposes REST API endpoints for retrieval and health checks
- Frontend consumes the backend API via CORS

## Prerequisites

- Python 3.11+ (or compatible)
- Node.js 18+ / npm
- `uvicorn` and FastAPI dependencies installed in backend environment
- `npm install` run in frontend

## Setup

### 1. Backend

```bash
cd cognitive-memory-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment

Create or update the root `.env` file at `MNEMOSYNE-COGNITIVE-MEMORY-LAYER/.env` with:

```env
OPENROUTER_API_KEY=sk-or-v1-...your-api-key...
OPENROUTER_MODEL=qwen/qwen-2-7b-instruct:free
```

The backend reads this file from `app.config.Settings.Config.env_file = "../.env"`.

### 3. Frontend

```bash
cd cognitive-memory-frontend
npm install
```

## Run the app

### Backend

```bash
cd cognitive-memory-backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

API base URL:
- `http://localhost:8000`

### Frontend

```bash
cd cognitive-memory-frontend
npm run dev
```

Frontend default URL:
- `http://localhost:5173`

## API Endpoints

- `GET /api/health` — service health
- `GET /` — root service info
- `POST /api/memory/extract` — extract and store a memory
- `GET /api/memory/user/{user_id}` — retrieve memories for a user
- `GET /api/memory/{memory_id}` — retrieve a single memory
- `GET /api/memory/` — list all memories

## Notes

- The frontend is configured to allow CORS from `http://localhost:5173`.
- The backend stores data in `cognitive-memory-backend/memories.db`.
- If the frontend uses a different port, update `cognitive-memory-backend/app/config.py` `cors_origins` list.

## Troubleshooting

- If the backend fails to start, confirm `.env` exists and contains a valid `OPENROUTER_API_KEY`.
- If the frontend fails, run `npm install` again and make sure Node.js is up to date.
