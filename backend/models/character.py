from typing import Optional
from uuid import uuid4

from pydantic import BaseModel


class Character(BaseModel):
    id: Optional[str] = None
    name: str
    gender: str
    age: int
    personality: str
    relationship: str
    rules: str
    example: str

    def generate_id(self):
        self.id = str(uuid4())