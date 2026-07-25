import axios from "axios";

const SESSION_STORAGE_KEY = "persona_session_id";
const AUTH_STORAGE_KEY = "persona_auth_user";

// Returns the active storage session id used by the backend for private character data.
function getSessionId() {
    if (typeof window === "undefined") {
        return "default";
    }

    // Logged-in users use their account session, so every user gets separate data.
    const authSession = getAuthSession();
    if (authSession?.session_id) {
        return authSession.session_id;
    }

    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
        return existing;
    }

    const generatedId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(SESSION_STORAGE_KEY, generatedId);
    return generatedId;
}

// Read the saved logged-in user from browser storage.
export function getAuthSession() {
    if (typeof window === "undefined") {
        return null;
    }

    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY) || window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
        return null;
    }

    try {
        return JSON.parse(stored);
    } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

// Save the logged-in user and session id after login/signup.
export function setAuthSession(authSession, remember = false) {
    if (typeof window === "undefined") {
        return;
    }

    const storage = remember ? window.localStorage : window.sessionStorage;
    const otherStorage = remember ? window.sessionStorage : window.localStorage;

    otherStorage.removeItem(AUTH_STORAGE_KEY);
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
}

// Remove logged-in user data on logout.
export function clearAuthSession() {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// Attach the active user/session id to every backend request.
api.interceptors.request.use((config) => {
    const authSession = getAuthSession();

    config.headers = config.headers || {};
    config.headers["X-Session-Id"] = getSessionId();

    if (authSession?.access_token) {
        config.headers.Authorization = `Bearer ${authSession.access_token}`;
    }

    return config;
});

export const getSessionIdValue = () => getSessionId();

// Auth endpoints.
export const signup = (data) => {
    return api.post("/auth/signup", data);
}

export const login = (data) => {
    return api.post("/auth/login", data);
}

export const guestLogin = () => {
    return api.post("/auth/guest");
}

// Character CRUD endpoints.
export const getCharacters = () => {

    return api.get("/characters");

}

export const createCharacter = (character) => {

    return api.post(

        "/characters",

        character

    );

}

export const deleteCharacter = (id) => {

    return api.delete(

        `/characters/${id}`

    );

}

export const updateCharacter = (id, character) => {

    return api.put(

        `/characters/${id}`,

        character

    );

}

export default api;
