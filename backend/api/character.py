from fastapi import APIRouter, HTTPException, Request

try:
    from ..database.storage import load_characters, save_characters
    from ..models.character import Character
except ImportError:
    from database.storage import load_characters, save_characters
    from models.character import Character

router = APIRouter(prefix="/characters", tags=["Characters"])


def get_session_id(request: Request):
    return request.headers.get("x-session-id") or request.headers.get("session-id") or "default"


@router.get("/")
def get_all(request: Request):
    return load_characters(get_session_id(request))


@router.post("/")
def create(character: Character, request: Request):
    characters = load_characters(get_session_id(request))

    if not character.id:
        character.generate_id()

    characters.append(character.dict())
    save_characters(characters, get_session_id(request))

    return character


@router.put("/{character_id}")
def update(character_id: str, updated: Character, request: Request):
    characters = load_characters(get_session_id(request))

    for i, character in enumerate(characters):
        if character.get("id") == character_id:
            updated.id = character_id
            characters[i] = updated.dict()
            save_characters(characters, get_session_id(request))
            return updated

    raise HTTPException(status_code=404, detail="Character not found.")


@router.delete("/{character_id}")
def delete(character_id: str, request: Request):
    characters = load_characters(get_session_id(request))
    new_characters = [character for character in characters if character.get("id") != character_id]

    save_characters(new_characters, get_session_id(request))

    return {"message": "Deleted Successfully"}