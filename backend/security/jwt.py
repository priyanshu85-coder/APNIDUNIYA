import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request, status

try:
    from ..config.setting import get_jwt_expire_minutes, get_jwt_secret_key
except ImportError:
    from config.setting import get_jwt_expire_minutes, get_jwt_secret_key


def _base64url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _base64url_decode(data):
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}".encode("utf-8"))


def _sign(message):
    return _base64url_encode(
        hmac.new(
            get_jwt_secret_key().encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256,
        ).digest()
    )


# Create a signed JWT for a logged-in user or guest user.
def create_access_token(user, session_id, account_type="user"):
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=get_jwt_expire_minutes())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "session_id": session_id,
        "account_type": account_type,
        "exp": int(expires_at.timestamp()),
    }

    encoded_header = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    encoded_payload = _base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{encoded_header}.{encoded_payload}"
    signature = _sign(signing_input)
    return f"{signing_input}.{signature}"


# Verify a JWT and return its payload. Invalid or expired tokens return None.
def verify_access_token(token):
    try:
        encoded_header, encoded_payload, signature = token.split(".")
        signing_input = f"{encoded_header}.{encoded_payload}"

        if not hmac.compare_digest(_sign(signing_input), signature):
            return None

        payload = json.loads(_base64url_decode(encoded_payload))
        if payload.get("exp", 0) < int(datetime.now(timezone.utc).timestamp()):
            return None

        return payload
    except Exception:
        return None


def get_token_payload_from_request(request: Request):
    authorization = request.headers.get("authorization", "")
    if authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        payload = verify_access_token(token)
        if payload:
            return payload

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Valid JWT access token is required.",
        headers={"WWW-Authenticate": "Bearer"},
    )


# Protected routes use only a verified JWT session id.
def get_session_id_from_request(request: Request):
    payload = get_token_payload_from_request(request)
    if not payload.get("session_id"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token session is missing.")
    return payload["session_id"]
