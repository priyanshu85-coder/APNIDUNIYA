from functools import lru_cache

import certifi
from pymongo import MongoClient

try:
    from ..config.setting import get_mongodb_db_name, get_mongodb_uri
except ImportError:
    from config.setting import get_mongodb_db_name, get_mongodb_uri


# Create one reusable MongoDB client. MongoDB is required for app storage.
@lru_cache(maxsize=1)
def get_database():
    mongodb_uri = get_mongodb_uri()

    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is required. Add your MongoDB Atlas connection string in backend/.env.")

    client = MongoClient(mongodb_uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    return client[get_mongodb_db_name()]


# Ping MongoDB Atlas so backend startup prints a real connection status.
def verify_mongodb_connection():
    database = get_database()
    database.command("ping")
    print(f"MongoDB Atlas connected successfully. Database: {get_mongodb_db_name()}")
