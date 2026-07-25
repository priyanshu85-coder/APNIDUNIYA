from fastapi import APIRouter, HTTPException, Request

try:
    from ..database.auth_storage import authenticate_user, create_user
    from ..models.auth import AuthRequest, AuthResponse
    from ..security.jwt import create_access_token, get_token_payload_from_request
except ImportError:
    from database.auth_storage import authenticate_user, create_user
    from models.auth import AuthRequest, AuthResponse
    from security.jwt import create_access_token, get_token_payload_from_request

router = APIRouter(prefix="/auth", tags=["Auth"])


# Signup creates a new user account and returns that user's private session id.
@router.post("/signup", response_model=AuthResponse)
def signup(data: AuthRequest):
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    created = create_user(data.name or "", data.email, data.password)
    if not created:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user, session_id = created
    return {
        "user": user,
        "session_id": session_id,
        "access_token": create_access_token(user, session_id),
        "token_type": "bearer",
    }


# Login checks email/password and returns the same private session id for that user.
@router.post("/login", response_model=AuthResponse)
def login(data: AuthRequest):
    authenticated = authenticate_user(data.email, data.password)
    if not authenticated:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user, session_id = authenticated
    return {
        "user": user,
        "session_id": session_id,
        "access_token": create_access_token(user, session_id),
        "token_type": "bearer",
    }


# Guest login creates a short-lived JWT for the browser's guest session.
@router.post("/guest", response_model=AuthResponse)
def guest_login(request: Request):
    guest_session_id = request.headers.get("x-session-id") or request.headers.get("session-id") or "guest"
    guest_user = {
        "id": guest_session_id,
        "name": "Guest",
        "email": "guest@apniduniya.local",
    }

    return {
        "user": guest_user,
        "session_id": guest_session_id,
        "access_token": create_access_token(guest_user, guest_session_id, account_type="guest"),
        "token_type": "bearer",
    }


# Profile is protected and returns the user data from a valid JWT.
@router.get("/profile")
def profile(request: Request):
    payload = get_token_payload_from_request(request)
    return {
        "id": payload.get("sub"),
        "name": payload.get("name"),
        "email": payload.get("email"),
        "session_id": payload.get("session_id"),
        "account_type": payload.get("account_type", "user"),
    }
