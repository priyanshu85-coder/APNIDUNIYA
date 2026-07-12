from fastapi import APIRouter

try:
    from ..models.character import Character
    from ..services.gemini_service import ask_character
except ImportError:
    from models.character import Character
    from services.gemini_service import ask_character

router = APIRouter(
    prefix="/discussion",
    tags=["Discussion"]
)


@router.post("/")
def discussion(characters: list[Character], question: str):

    discussion = []

    for character in characters:

        answer = ask_character(
            character,
            question
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