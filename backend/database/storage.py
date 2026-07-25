try:
    from .mongo import get_database
except ImportError:
    from mongo import get_database


class ConversationMemory:
    def __init__(self):
        self.messages = []

    def add_user(self, text):
        self.messages.append({"role": "user", "content": text})

    def add_model(self, text):
        self.messages.append({"role": "model", "content": text})

    def get_history(self):
        return self.messages


_session_memories = {}


def _get_session_id(session_id=None):
    return session_id or "default"


def _characters_collection():
    return get_database()["characters"]


def get_memory(session_id=None):
    safe_session_id = _get_session_id(session_id)
    if safe_session_id not in _session_memories:
        _session_memories[safe_session_id] = ConversationMemory()
    return _session_memories[safe_session_id]


def load_characters(session_id=None):
    # MongoDB Atlas stores one character document per user/session.
    collection = _characters_collection()
    document = collection.find_one({"session_id": _get_session_id(session_id)}, {"_id": 0, "characters": 1})
    return document.get("characters", []) if document else []


def save_characters(characters, session_id=None):
    # Upsert replaces the active user's/session's character list in MongoDB.
    collection = _characters_collection()
    collection.update_one(
        {"session_id": _get_session_id(session_id)},
        {"$set": {"session_id": _get_session_id(session_id), "characters": characters}},
        upsert=True,
    )
