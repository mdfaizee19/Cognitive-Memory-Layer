import os
import httpx
import json

api_key = os.getenv("OPENROUTER_API_KEY", "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")

# Test with free model
url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

data = {
    "model": "qwen/qwen-2-7b-instruct:free",
    "messages": [
        {"role": "user", "content": "Say hello in one word"}
    ]
}

response = httpx.post(url, headers=headers, json=data, timeout=30.0)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
