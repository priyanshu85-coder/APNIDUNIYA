import axios from "axios";

const SESSION_STORAGE_KEY = "persona_session_id";

function getSessionId() {
    if (typeof window === "undefined") {
        return "default";
    }

    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
        return existing;
    }

    const generatedId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.localStorage.setItem(SESSION_STORAGE_KEY, generatedId);
    return generatedId;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    config.headers["X-Session-Id"] = getSessionId();
    return config;
});

export const getSessionIdValue = () => getSessionId();

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