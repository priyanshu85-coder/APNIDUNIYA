from google import genai

try:
    from ..config.setting import GEMINI_API_KEY
    from ..prompts.prompts import build_prompt
    from ..database.storage import get_memory
except ImportError:
    from config.setting import GEMINI_API_KEY
    from prompts.prompts import build_prompt
    from database.storage import get_memory

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def ask_character(character, question, session_id=None):
    if not GEMINI_API_KEY or client is None:
        return "Gemini API is not configured yet. Please set GEMINI_API_KEY in the environment."

    memory = get_memory(session_id)
    prompt = build_prompt(character, question)

    memory.add_user(prompt)

    history_text = "\n\n".join(
        f"{entry['role']}: {entry['content']}" for entry in memory.get_history()
    )

    response = client.models.generate_content(
        model="models/gemini-3.1-flash-lite",
        contents=history_text,
    )

    reply_text = getattr(response, "text", None) or ""
    memory.add_model(reply_text)

    return reply_text