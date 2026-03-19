# OpenRouter API Key Issue - How to Fix

## Problem
The current API key in `.env` returns: `{"error":{"message":"User not found.","code":401}}`

This means the API key is **invalid or the associated account doesn't exist**.

## Solution - Get a Valid API Key

### Step 1: Visit OpenRouter
Go to: **https://openrouter.ai**

### Step 2: Sign Up or Log In
- If you don't have an account, click "Sign Up"
- If you have an account, click "Log In"

### Step 3: Get API Key
1. Once logged in, go to your **Dashboard**
2. Navigate to **Keys** or **API Keys** section
3. Click **"Create Key"** or **"Generate New Key"**
4. Copy the new API key (starts with `sk-or-v1-...`)

### Step 4: Update .env File
Replace the key in `/home/haroon12h8/Desktop/MNEMOSYNE2/.env`:

```bash
OPENROUTER_API_KEY=your_new_key_here
```

### Step 5: Restart Backend (Optional)
The backend auto-reloads, but if needed:
```bash
# Press Ctrl+C in the terminal running uvicorn, then:
uvicorn app.main:app --reload --port 8000
```

## Free Models Available

The backend is now configured to use: **`qwen/qwen-2-7b-instruct:free`**

Other free models you can try (edit `app/config.py`):
- `meta-llama/llama-3.2-3b-instruct:free`
- `microsoft/phi-3-mini-128k-instruct:free`
- `google/gemini-flash-1.5-8b-exp`
- `nousresearch/hermes-3-llama-3.1-405b:free`

## Test After Fixing

Once you have a valid key, test with:
```bash
curl -X POST http://localhost:8000/api/memory/extract \
  -H "Content-Type: application/json" \
  -d '{"prompt": "I prefer dark mode", "user_id": "test_user"}'
```

You should get a response like:
```json
{
  "memory_id": "uuid-here",
  "user_id": "test_user",
  "memory_type": "preference",
  "entity": "user",
  "attribute": "theme_preference",
  "value": "dark",
  ...
}
```
