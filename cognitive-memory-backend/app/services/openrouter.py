import httpx
import json
from typing import Dict, Any
from app.config import get_settings

settings = get_settings()


SYSTEM_PROMPT = """You are a memory extraction system. When given a user's statement, extract structured memory information.

Analyze the input and extract:
- memory_type: classify as "preference", "constraint", "commitment", "goal", or "identity"
- entity: the main subject (e.g., "user", "system", specific person/thing)
- attribute: the characteristic being described (e.g., "theme_preference", "dietary_restriction", "skill_level")
- value: the specific value or description
- context: additional contextual information (location, time, related entities)
- trigger: the original statement that triggered this memory
- importance_score: 0.0-1.0 (how important is this memory)
- confidence_score: 0.0-1.0 (how confident are you in this extraction)

Return ONLY valid JSON matching this exact structure:
{
  "memory_type": "preference|constraint|commitment|goal|identity",
  "entity": "string",
  "attribute": "string",
  "value": "string",
  "context": {
    "location": "string or null",
    "time": "string or null",
    "related_entities": []
  },
  "trigger": "original user statement",
  "importance_score": 0.0,
  "confidence_score": 0.0
}

Examples:
Input: "I prefer dark mode"
Output: {"memory_type": "preference", "entity": "user", "attribute": "theme_preference", "value": "dark", "context": {"location": null, "time": null, "related_entities": []}, "trigger": "I prefer dark mode", "importance_score": 0.6, "confidence_score": 0.9}

Input: "I'm allergic to peanuts"
Output: {"memory_type": "constraint", "entity": "user", "attribute": "dietary_restriction", "value": "allergic_to_peanuts", "context": {"location": null, "time": null, "related_entities": ["peanuts"]}, "trigger": "I'm allergic to peanuts", "importance_score": 0.95, "confidence_score": 1.0}

Input: "I want to learn Python by March"
Output: {"memory_type": "goal", "entity": "user", "attribute": "learning_goal", "value": "Python", "context": {"location": null, "time": "March", "related_entities": ["Python"]}, "trigger": "I want to learn Python by March", "importance_score": 0.8, "confidence_score": 0.85}

Remember: Return ONLY the JSON object, no additional text or explanation."""


async def extract_memory_from_prompt(prompt: str) -> Dict[str, Any]:
    """
    Send prompt to OpenRouter API and extract structured memory
    
    Args:
        prompt: User's input text
        
    Returns:
        Dictionary containing extracted memory structure
        
    Raises:
        Exception: If API call fails or response is invalid
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{settings.openrouter_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.openrouter_model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,  # Lower temperature for more consistent extraction
                }
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Extract the content from the response
            content = data["choices"][0]["message"]["content"].strip()
            
            # Try to parse as JSON
            # Sometimes LLMs wrap JSON in markdown code blocks
            if content.startswith("```"):
                # Remove markdown code blocks
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()
            
            memory_data = json.loads(content)
            return memory_data
            
        except httpx.HTTPStatusError as e:
            raise Exception(f"OpenRouter API error: {e.response.status_code} - {e.response.text}")
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse LLM response as JSON: {content}")
        except Exception as e:
            raise Exception(f"Error calling OpenRouter API: {str(e)}")
