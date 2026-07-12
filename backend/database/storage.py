import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "data")
SESSION_DIR = os.path.join(DATA_DIR, "sessions")
os.makedirs(SESSION_DIR, exist_ok=True)


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


def _get_session_file(session_id=None):
    safe_session_id = _get_session_id(session_id)
    return os.path.join(SESSION_DIR, f"{safe_session_id}.json")


def get_memory(session_id=None):
    safe_session_id = _get_session_id(session_id)
    if safe_session_id not in _session_memories:
        _session_memories[safe_session_id] = ConversationMemory()
    return _session_memories[safe_session_id]


def load_characters(session_id=None):
    data_file = _get_session_file(session_id)
    if not os.path.exists(data_file):
        return []

    with open(data_file, "r") as file:
        return json.load(file)


def save_characters(characters, session_id=None):
    data_file = _get_session_file(session_id)
    os.makedirs(os.path.dirname(data_file), exist_ok=True)

    with open(data_file, "w") as file:
        json.dump(characters, file, indent=4)