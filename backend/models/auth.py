from pydantic import BaseModel, field_validator


# Request body used by both signup and login.
class AuthRequest(BaseModel):
    name: str | None = None
    email: str
    password: str

    # Normalize and validate email before it reaches auth storage.
    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        clean_value = value.strip().lower()
        if "@" not in clean_value or "." not in clean_value.split("@")[-1]:
            raise ValueError("Enter a valid email address.")
        return clean_value


# User data that is safe to send back to the frontend.
class PublicUser(BaseModel):
    id: str
    name: str
    email: str


# Response sent after successful login/signup.
class AuthResponse(BaseModel):
    user: PublicUser
    session_id: str
    access_token: str
    token_type: str = "bearer"
