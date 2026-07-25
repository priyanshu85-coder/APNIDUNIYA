from fastapi import APIRouter, Request

try:
    from ..models.character import Character
    from ..security.jwt import get_session_id_from_request
    from ..services.gemini_service import ask_character
except ImportError:
    from models.character import Character
    from security.jwt import get_session_id_from_request
    from services.gemini_service import ask_character

router = APIRouter(
    prefix="/discussion",
    tags=["Discussion"]
)


@router.post("/")
def discussion(characters: list[Character], question: str, request: Request):
    session_id = get_session_id_from_request(request)

    discussion = []

    for character in characters:

        answer = ask_character(
            character,
            question,
            session_id
        )

        discussion.append(
            {
                "name": character.name,
                "answer": answer
            }
        )

    return {
        "discussion": discussion
    }
