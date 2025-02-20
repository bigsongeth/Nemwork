from typing import Any, Callable, Dict, List, Optional, Union
import httpx
import json

class Agent:
    def __init__(
        self,
        name: str,
        model: str,
        api_key: str,
        base_url: Optional[str] = None,
        instructions: Optional[str] = None,
        functions: Optional[List[Callable]] = None,
        context_variables: Optional[Dict[str, Any]] = None,
    ):
        self.name = name
        self.model = model
        self.api_key = api_key
        self.base_url = base_url
        self.instructions = instructions
        self.functions = functions or []
        self.context_variables = context_variables or {}
        self.client = httpx.Client()

    def chat(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        data = {
            "model": self.model,
            "messages": messages,
            "max_tokens": kwargs.get("max_tokens", 150),
            "temperature": kwargs.get("temperature", 0.7)
        }
        
        response = self.client.post(
            self.base_url + "/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"API request failed with status {response.status_code}: {response.text}") 