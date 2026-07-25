from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .api.auth import router as auth_router
    from .api.chat import router as chat_router
    from .api.character import router as character_router
    from .database.mongo import verify_mongodb_connection
except ImportError:
    from api.auth import router as auth_router
    from api.chat import router as chat_router
    from api.character import router as character_router
    from database.mongo import verify_mongodb_connection

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
app.include_router(auth_router)
# for health check 
@app.get("/health")
def health():
    return {"status": "OK"} 

@app.head("/health")
def health_head():
    return Response(status_code=200)

@app.on_event("startup")
def startup_check():
    verify_mongodb_connection()


@app.get("/")
def home():
    return {"message": "APNI DUNIYA AI Backend Running"}
