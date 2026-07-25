import hashlib
import hmac
import secrets
from uuid import uuid4

try:
    from .mongo import get_database
except ImportError:
    from mongo import get_database

def _users_collection():
    collection = get_database()["users"]
    collection.create_index("email", unique=True)
    return collection


# Hash passwords with a unique salt so raw passwords are never stored.
def _hash_password(password, salt=None):
    password_salt = salt or secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        password_salt.encode("utf-8"),
        120000,
    ).hex()
    return password_salt, password_hash


# Return only safe user fields to the frontend.
def _public_user(user):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
    }


# Create a user and assign a private session id used for separate character data.
def create_user(name, email, password):
    clean_email = email.strip().lower()

    salt, password_hash = _hash_password(password)
    user_id = str(uuid4())
    user = {
        "id": user_id,
        "name": name.strip() or clean_email.split("@")[0],
        "email": clean_email,
        "password_salt": salt,
        "password_hash": password_hash,
        "session_id": f"user_{user_id}",
    }

    # Save account in the MongoDB users collection.
    collection = _users_collection()
    if collection.find_one({"email": clean_email}):
        return None

    collection.insert_one(user)
    return _public_user(user), user["session_id"]


# Check login credentials against the saved password hash.
def authenticate_user(email, password):
    clean_email = email.strip().lower()

    # Find the user document by email in MongoDB.
    collection = _users_collection()
    user = collection.find_one({"email": clean_email}, {"_id": 0})

    if not user:
        return None

    _, password_hash = _hash_password(password, user["password_salt"])
    if not hmac.compare_digest(password_hash, user["password_hash"]):
        return None

    return _public_user(user), user["session_id"]
