import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "apni_duniya")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-in-production")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))


def get_gemini_api_key():
    return GEMINI_API_KEY


def get_mongodb_uri():
    return MONGODB_URI


def get_mongodb_db_name():
    return MONGODB_DB_NAME


def get_jwt_secret_key():
    return JWT_SECRET_KEY


def get_jwt_expire_minutes():
    return JWT_EXPIRE_MINUTES
