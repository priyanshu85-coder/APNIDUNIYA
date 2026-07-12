from fastapi import APIRouter, Request

try:
    from ..models.request import ChatRequest
    from ..services.gemini_service import ask_character
except ImportError:
    from models.request import ChatRequest
    from services.gemini_service import ask_character

router = APIRouter()


def get_session_id(request: Request):
    return request.headers.get("x-session-id") or request.headers.get("session-id") or "default"


@router.post("/chat")
def chat(data: ChatRequest, request: Request):
    selected_characters = data.characters or ([data.character] if data.character else [])

    if not selected_characters:
        return {"answer": "No character selected."}

    session_id = get_session_id(request)

    formatted_answers = []
    for character in selected_characters:
        reply = ask_character(character, data.question, session_id)
        formatted_answers.append({
            "name": character.name,
            "text": reply,
        })

    return {"answers": formatted_answers}