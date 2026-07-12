from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .api.chat import router as chat_router
    from .api.character import router as character_router
except ImportError:
    from api.chat import router as chat_router
    from api.character import router as character_router

app = FastAPI(title="Personal Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(character_router)
app.include_router(chat_router)


@app.get("/")
def home():
    return {"message": "APNI DUNIYA AI Backend Running"}