from fastapi import APIRouter, HTTPException, Request

try:
    from ..database.storage import load_characters, save_characters
    from ..models.character import Character
    from ..security.jwt import get_session_id_from_request
except ImportError:
    from database.storage import load_characters, save_characters
    from models.character import Character
    from security.jwt import get_session_id_from_request

router = APIRouter(prefix="/characters", tags=["Characters"])


@router.get("/")
def get_all(request: Request):
    return load_characters(get_session_id_from_request(request))


@router.post("/")
def create(character: Character, request: Request):
    session_id = get_session_id_from_request(request)
    characters = load_characters(session_id)

    if not character.id:
        character.generate_id()

    characters.append(character.dict())
    save_characters(characters, session_id)

    return character


@router.put("/{character_id}")
def update(character_id: str, updated: Character, request: Request):
    session_id = get_session_id_from_request(request)
    characters = load_characters(session_id)

    for i, character in enumerate(characters):
        if character.get("id") == character_id:
            updated.id = character_id
            characters[i] = updated.dict()
            save_characters(characters, session_id)
            return updated

    raise HTTPException(status_code=404, detail="Character not found.")


@router.delete("/{character_id}")
def delete(character_id: str, request: Request):
    session_id = get_session_id_from_request(request)
    characters = load_characters(session_id)
    new_characters = [character for character in characters if character.get("id") != character_id]

    save_characters(new_characters, session_id)

    return {"message": "Deleted Successfully"}
