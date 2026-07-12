from typing import List, Optional
from pydantic import BaseModel

try:
    from ..models.character import Character
except ImportError:
    from models.character import Character


class ChatRequest(BaseModel):
    character: Optional[Character] = None
    characters: Optional[List[Character]] = None
    question: str


class ChatResponse(BaseModel):
    answer: str