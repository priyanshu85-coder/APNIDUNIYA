from fastapi import APIRouter, Request

try:
    from ..database.storage import get_memory
    from ..models.request import ChatRequest
    from ..security.jwt import get_session_id_from_request
    from ..services.gemini_service import ask_character
except ImportError:
    from database.storage import get_memory
    from models.request import ChatRequest
    from security.jwt import get_session_id_from_request
    from services.gemini_service import ask_character

router = APIRouter()


@router.post("/chat")
def chat(data: ChatRequest, request: Request):
    selected_characters = data.characters or ([data.character] if data.character else [])

    if not selected_characters:
        return {"answer": "No character selected."}

    session_id = get_session_id_from_request(request)

    formatted_answers = []
    for character in selected_characters:
        reply = ask_character(character, data.question, session_id)
        formatted_answers.append({
            "name": character.name,
            "text": reply,
        })

    return {"answers": formatted_answers}


@router.get("/conversation-history")
def conversation_history(request: Request):
    session_id = get_session_id_from_request(request)
    return {"history": get_memory(session_id).get_history()}
