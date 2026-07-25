import { useEffect, useMemo, useState } from "react";
import {
    FaComments,
    FaLock,
    FaMagic,
    FaPlus,
    FaRocket,
    FaUserAstronaut,
} from "react-icons/fa";

import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatBox from "../components/Chat/ChatBox";
import CharacterForm from "../components/CharacterForm/CharacterForm";
import {
    clearAuthSession,
    createCharacter,
    deleteCharacter,
    getAuthSession,
    getCharacters,
    guestLogin,
    login,
    setAuthSession,
    signup,
    updateCharacter,
} from "../services/api";

const REMEMBERED_EMAIL_KEY = "persona_remembered_email";

function getRememberedEmail() {
    if (typeof window === "undefined") {
        return "";
    }

    return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
}

function Home() {
    // Character state: stores all characters, selected chat targets, and edit mode.
    const [characters, setCharacters] = useState([]);
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    const [editingCharacter, setEditingCharacter] = useState(null);

    // Layout state: controls sidebar, chat panel, current page, and character form visibility.
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [screen, setScreen] = useState("landing");
    const [showCharacterForm, setShowCharacterForm] = useState(false);

    // Auth state: controls login/signup mode, form fields, current user, and auth errors.
    const [authMode, setAuthMode] = useState("login");
    const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
    const [authUser, setAuthUser] = useState(() => getAuthSession()?.user || null);
    const [authError, setAuthError] = useState("");
    const [rememberMe, setRememberMe] = useState(() => Boolean(getRememberedEmail()));

    // Load characters once when the app opens. The API decides which user's data to load.
    useEffect(() => {
        loadCharacters();
    }, []);

    // The sidebar is a mobile drawer, but it should always be available after returning to desktop.
    useEffect(() => {
        function openSidebarOnDesktop() {
            if (window.innerWidth > 768) {
                setIsSidebarOpen(true);
            }
        }

        openSidebarOnDesktop();
        window.addEventListener("resize", openSidebarOnDesktop);
        return () => window.removeEventListener("resize", openSidebarOnDesktop);
    }, []);

    // Clear login/signup fields every time auth page opens or switches between modes.
    useEffect(() => {
        if (screen === "auth") {
            const rememberedEmail = authMode === "login" ? getRememberedEmail() : "";
            setAuthForm({ name: "", email: rememberedEmail, password: "" });
            setRememberMe(Boolean(rememberedEmail));
            setAuthError("");
        }
    }, [screen, authMode]);

    const stats = useMemo(
        () => [
            { value: characters.length || "0", label: "personas" },
            { value: "24/7", label: "chat ready" },
            { value: "AI", label: "story engine" },
        ],
        [characters.length]
    );

    // Fetch characters for the active user/session from the backend.
    async function loadCharacters() {
        try {
            const response = await getCharacters();
            setCharacters(response.data || []);
        } catch (error) {
            console.error("Failed to load characters:", error);
        }
    }

    // Open the blank character form for creating a new persona.
    function openCreateForm() {
        setEditingCharacter(null);
        setShowCharacterForm(true);
        setIsChatOpen(false);
        setIsSidebarOpen(false);
    }

    // Open the same character form with existing data for editing.
    function openEditForm(character) {
        setEditingCharacter(character);
        setShowCharacterForm(true);
        setIsChatOpen(false);
    }

    // Save a new character, add it to the list, and open chat with that character.
    async function addCharacter(character) {
        try {
            const response = await createCharacter(character);
            const createdCharacter = response.data;
            setCharacters((prev) => [...prev, createdCharacter]);
            setSelectedCharacters([createdCharacter]);
            setEditingCharacter(null);
            setShowCharacterForm(false);
            setIsChatOpen(true);
        } catch (error) {
            console.error("Failed to create character:", error);
        }
    }

    // Update an existing character and keep sidebar/chat selection in sync.
    async function saveCharacter(character) {
        if (!editingCharacter) {
            return;
        }

        try {
            const response = await updateCharacter(editingCharacter.id, character);
            const updatedCharacter = response.data;

            setCharacters((prev) =>
                prev.map((item) => (item.id === updatedCharacter.id ? updatedCharacter : item))
            );
            setSelectedCharacters((prev) =>
                prev.some((item) => item.id === updatedCharacter.id)
                    ? prev.map((item) => (item.id === updatedCharacter.id ? updatedCharacter : item))
                    : [updatedCharacter]
            );
            setEditingCharacter(null);
            setShowCharacterForm(false);
            setIsChatOpen(true);
        } catch (error) {
            console.error("Failed to update character:", error);
        }
    }

    // Delete a character from the active user's private storage.
    async function removeCharacter(character) {
        try {
            await deleteCharacter(character.id);
            setCharacters((prev) => prev.filter((item) => item.id !== character.id));
            setSelectedCharacters((prev) => prev.filter((item) => item.id !== character.id));
            setIsChatOpen(false);

            if (editingCharacter?.id === character.id) {
                setEditingCharacter(null);
                setShowCharacterForm(false);
            }
        } catch (error) {
            console.error("Failed to delete character:", error);
        }
    }

    // Submit login/signup, then store the returned user session locally.
    async function handleAuthSubmit(e) {
        e.preventDefault();
        setAuthError("");

        try {
            const authRequest = authMode === "signup" ? signup : login;
            const response = await authRequest(authForm);
            setAuthSession(response.data, authMode === "signup" || rememberMe);

            if (authMode === "login" && rememberMe) {
                window.localStorage.setItem(REMEMBERED_EMAIL_KEY, authForm.email);
            } else if (authMode === "login") {
                window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
            }

            setAuthUser(response.data.user);
            setSelectedCharacters([]);
            setEditingCharacter(null);
            setShowCharacterForm(false);
            setIsChatOpen(false);
            setScreen("studio");
            loadCharacters();
        } catch (error) {
            setAuthError(error.response?.data?.detail || "Something went wrong. Please try again.");
        }
    }

    // Guest login uses browser guest session instead of a saved account.
    async function continueAsGuest() {
        setAuthError("");

        try {
            const response = await guestLogin();
            setAuthSession(response.data, false);
            setAuthUser(response.data.user);
            setSelectedCharacters([]);
            setEditingCharacter(null);
            setShowCharacterForm(false);
            setIsChatOpen(false);
            setScreen("studio");
            loadCharacters();
        } catch (error) {
            setAuthError(error.response?.data?.detail || "Guest login failed. Please try again.");
        }
    }

    // Logout clears only the saved auth session; visitor session data remains separate.
    function handleLogout() {
        clearAuthSession();
        setAuthUser(null);
        setSelectedCharacters([]);
        setEditingCharacter(null);
        setShowCharacterForm(false);
        setIsChatOpen(false);
        setScreen("landing");
        loadCharacters();
    }

    // Smart home button: logged-in users go to Studio, guests go to landing page.
    function goHome() {
        setScreen(authUser ? "studio" : "landing");
    }

    // Public marketing-style homepage shown to guests.
    function renderLanding() {
        return (
            <main className="landingPage">
                <Navbar
                    variant="public"
                    onLogin={() => {
                        setAuthMode("login");
                        setScreen("auth");
                    }}
                    onSignup={() => {
                        setAuthMode("signup");
                        setScreen("auth");
                    }}
                    onHome={goHome}
                />

                <section className="heroSection">
                    <div className="heroCopy">
                        <span className="eyebrow">Apni Duniya-AI Persona</span>
                        <h1>Your AI. Your Rules. Your World.</h1>
                        <p>
                            One platform. Unlimited AI personalities. Create anyone you imagine, chat naturally, and even bring multiple AI characters into the same conversation. Learn, create, work, and have fun—your world, your AI.
                        </p>

                        <div className="heroActions">
                            <button
                                type="button"
                                className="primaryAction"
                                onClick={() => {
                                    setAuthMode("signup");
                                    setScreen("auth");
                                }}
                            >
                                <FaRocket />
                                Get Started
                            </button>
                            <button type="button" className="secondaryAction" onClick={continueAsGuest}>
                                <FaMagic />
                                Try Studio
                            </button>
                        </div>

                        <div className="heroStats">
                            {stats.map((item) => (
                                <div key={item.label}>
                                    <strong>{item.value}</strong>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="featureBand">
                    <article>
                        <FaPlus />
                        <h3>Create</h3>
                        <p>Add age, traits, relationships, rules, and example conversations.</p>
                    </article>
                    <article>
                        <FaComments />
                        <h3>Chat</h3>
                        <p>Select one or many characters and start a focused AI conversation.</p>
                    </article>
                    <article>
                        <FaLock />
                        <h3>Personal</h3>
                        <p>Your browser session keeps your persona workspace separate.</p>
                    </article>
                </section>

                <footer className="homeFooter">
                    <div className="footerBrand">
                        <div className="footerLogoRow">
                            <span className="footerWordmark">APNI DUNIYA-AI PERSONA</span>
                            
                        </div>
                        <p>
                            Apni Duniya is your personal AI persona studio for creating characters, saving private
                            worlds, and chatting with one or many personalities.
                        </p>
                    </div>

                    <div className="footerColumns">
                        <div>
                            <h3>Company</h3>
                            <button type="button" onClick={() => setScreen("about")}>
                                About Us
                            </button>
                            <button type="button" onClick={() => setScreen("studio")}>
                                Character Studio
                            </button>
                            <a href="mailto:zatch7061@gmail.com">Contact Us</a>
                            <button type="button" onClick={() => setScreen("faq")}>
                                FAQ
                            </button>
                        </div>
                        <div>
                            <h3>Legal</h3>
                            <button type="button">Data Privacy</button>
                            <button type="button">Terms of Use</button>
                            <button type="button">Content Rules</button>
                            <button type="button">Compliance Report</button>
                        </div>
                    </div>

                    <div className="footerBottom">
                        {/* <span>Contact: <a href="mailto:support@apniduniya.ai">support@apniduniya.ai</a></span> */}
                        <span>Copyright 2026 Apni Duniya. All rights reserved.</span>
                    </div>
                </footer>
            </main>
        );
    }

    function renderInfoPage(type) {
        const isFaq = type === "faq";

        return (
            <main className="infoPage">
                <Navbar
                    variant="public"
                    onLogin={() => {
                        setAuthMode("login");
                        setScreen("auth");
                    }}
                    onSignup={() => {
                        setAuthMode("signup");
                        setScreen("auth");
                    }}
                    onHome={goHome}
                />

                <section className="infoShell">
                    <span className="eyebrow">{isFaq ? "Help Center" : "Our Story"}</span>
                    <h1>{isFaq ? "Frequently Asked Questions" : "About Apni Duniya"}</h1>

                    {isFaq ? (
                        <div className="faqList">
                            <details open>
                                <summary>What is Apni Duniya?</summary>
                                <p>Apni Duniya is an AI persona studio where you create characters and chat with them.</p>
                            </details>
                            <details>
                                <summary>Can I chat with multiple characters?</summary>
                                <p>Yes. Select two or more characters from the sidebar and send a message to all selected characters.</p>
                            </details>
                            <details>
                                <summary>Is each user data separate?</summary>
                                <p>Yes. Logged-in users get separate MongoDB-backed character data and private sessions.</p>
                            </details>
                            <details>
                                <summary>Can I edit or delete characters?</summary>
                                <p>Yes. Each character card has edit and delete actions inside the studio sidebar.</p>
                            </details>
                        </div>
                    ) : (
                        <div className="aboutContent">
                            <p>
                                Apni Duniya is built for people who want to create their own world of AI personalities.
                                You can design characters with names, ages, traits, relationships, rules, and example
                                conversations, then chat with one or many of them.
                            </p>
                            <p>
                                The project uses React for the frontend, FastAPI for the backend, MongoDB Atlas for
                                private user data, and Gemini for AI responses.
                            </p>
                            {/* <a href="mailto:support@apniduniya.ai">Contact us at support@apniduniya.ai</a> */}
                        </div>
                    )}

                    <button type="button" className="secondaryAction" onClick={() => setScreen("landing")}>
                        Back to Home
                    </button>
                </section>
            </main>
        );
    }

    // Login/signup page. The same form changes fields based on authMode.
    function renderAuth() {
        const isSignup = authMode === "signup";

        return (
            <main className="loginPage">
                <Navbar
                    variant="public"
                    onLogin={() => {
                        setAuthMode("login");
                        setScreen("auth");
                    }}
                    onSignup={() => {
                        setAuthMode("signup");
                        setScreen("auth");
                    }}
                    onHome={goHome}
                />

                <section className="loginShell">
                    <form className="loginCard" onSubmit={handleAuthSubmit} autoComplete="off">
                        <span className="eyebrow">{isSignup ? "Create account" : "Welcome back"}</span>
                        <h1>{isSignup ? "Signup for Apni Duniya" : "Login to Apni Duniya"}</h1>
                        <p>
                            {isSignup
                                ? "Create your account so every character stays private to your profile."
                                : "Continue building your character universe and conversations."}
                        </p>

                        {isSignup && (
                            <label>
                                Name
                                <input
                                    type="text"
                                    name="display-name"
                                    autoComplete="off"
                                    placeholder="Your name"
                                    value={authForm.name}
                                    onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </label>
                        )}

                        <label>
                            Email
                            <input
                                type="email"
                                name="account-email"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck="false"
                                placeholder="you@example.com"
                                value={authForm.email}
                                onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                                required
                            />
                        </label>

                        <label>
                            Password
                            <input
                                type="password"
                                name={isSignup ? "new-account-password" : "current-account-passcode"}
                                autoComplete={isSignup ? "new-password" : "off"}
                                placeholder={isSignup ? "Minimum 6 characters" : "Enter password"}
                                value={authForm.password}
                                onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                                required
                            />
                        </label>
{/* 
                        {!isSignup && (
                            <label className="rememberRow">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                 <span>Remember me on this device</span> 
                            </label>
                        )}*/}
                        {authError && <div className="authError">{authError}</div>}

                        <button type="submit" className="primaryAction">
                            <FaLock />
                            {isSignup ? "Create Account" : "Login"}
                        </button>

                        <button
                            type="button"
                            className="textAction"
                            onClick={() => {
                                setAuthError("");
                                setAuthMode(isSignup ? "login" : "signup");
                            }}
                        >
                            {isSignup ? "Already have an account? Login" : "New here? Create account"}
                        </button>

                        <button type="button" className="guestAction" onClick={continueAsGuest}>
                            Continue as Guest
                        </button>
                    </form>
                </section>
            </main>
        );
    }

    // Main logged-in or visitor workspace with sidebar, navbar, form, and chat.
    function renderStudio() {
        return (
            <div className="container">
                <Sidebar
                    characters={characters}
                    selectedCharacters={selectedCharacters}
                    setSelectedCharacters={setSelectedCharacters}
                    onCreate={openCreateForm}
                    onEdit={openEditForm}
                    onDelete={removeCharacter}
                    onOpenChat={() => {
                        setShowCharacterForm(false);
                        setIsChatOpen(true);
                    }}
                    setIsChatOpen={setIsChatOpen}
                    isChatOpen={isChatOpen}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />
                {isSidebarOpen && (
                    <button
                        type="button"
                        className="sidebarBackdrop"
                        aria-label="Close character sidebar"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <div className="main">
                    <div className={`mobileToolbar ${isSidebarOpen ? "sidebarVisible" : ""}`}>
                        <button
                            type="button"
                            className="mobileSidebarToggle"
                            onClick={() => setIsSidebarOpen((prev) => !prev)}
                        >
                            {isSidebarOpen ? "Hide Characters" : "Show Characters"}
                        </button>
                        <button type="button" className="mobileCreateButton" onClick={openCreateForm}>
                            <FaPlus />
                            Create
                        </button>
                    </div>

                    <Navbar
                        variant="studio"
                        user={authUser}
                        onHome={goHome}
                        onLogin={() => {
                            setAuthMode("login");
                            setScreen("auth");
                        }}
                        onCreate={openCreateForm}
                        onLogout={handleLogout}
                    />

                    <section className="workspace">
                        {showCharacterForm ? (
                            <CharacterForm
                                addCharacter={addCharacter}
                                editCharacter={saveCharacter}
                                editingCharacter={editingCharacter}
                                cancelEdit={() => {
                                    setEditingCharacter(null);
                                    setShowCharacterForm(false);
                                }}
                            />
                        ) : isChatOpen && selectedCharacters.length > 0 ? (
                            <ChatBox characters={selectedCharacters} />
                        ) : (
                            <div className="studioEmptyState">
                                <span className="emptyIcon">
                                    <FaUserAstronaut />
                                </span>
                                <h2>Choose a character or create a new one</h2>
                                <p>
                                    Click a character in the sidebar to chat, or open the form to create your next AI
                                    persona.
                                </p>
                                <button type="button" className="primaryAction" onClick={openCreateForm}>
                                    <FaPlus />
                                    Create Character
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        );
    }

    // Page switcher: auth page has priority when the user is actively logging in/signing up.
    if (screen === "auth") {
        return renderAuth();
    }

    // Studio route is shown when selected from app state.
    if (screen === "studio") {
        return renderStudio();
    }

    if (screen === "about") {
        return renderInfoPage("about");
    }

    if (screen === "faq") {
        return renderInfoPage("faq");
    }

    // If a user is already logged in, never send them back to login from the home button.
    if (authUser) {
        return renderStudio();
    }

    // Default screen for visitors.
    return renderLanding();
}

export default Home;
