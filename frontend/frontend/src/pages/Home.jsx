import { useEffect, useState } from "react";

import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatBox from "../components/Chat/ChatBox";
import CharacterForm from "../components/CharacterForm/CharacterForm";
import { createCharacter, deleteCharacter, getCharacters, updateCharacter } from "../services/api";

function Home() {
    const [characters, setCharacters] = useState([]);
    const [selectedCharacters, setSelectedCharacters] = useState([]);
    const [editingCharacter, setEditingCharacter] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        loadCharacters();
    }, []);

    async function loadCharacters() {
        try {
            const response = await getCharacters();
            setCharacters(response.data || []);
        } catch (error) {
            console.error("Failed to load characters:", error);
        }
    }

    async function addCharacter(character) {
        try {
            const response = await createCharacter(character);
            const createdCharacter = response.data;
            setCharacters((prev) => [...prev, createdCharacter]);
            setSelectedCharacters([createdCharacter]);
            setEditingCharacter(null);
            setIsChatOpen(false);
        } catch (error) {
            console.error("Failed to create character:", error);
        }
    }

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
        } catch (error) {
            console.error("Failed to update character:", error);
        }
    }

    async function removeCharacter(character) {
        try {
            await deleteCharacter(character.id);
            setCharacters((prev) => prev.filter((item) => item.id !== character.id));
            setSelectedCharacters((prev) => prev.filter((item) => item.id !== character.id));
            setIsChatOpen(false);

            if (editingCharacter?.id === character.id) {
                setEditingCharacter(null);
            }
        } catch (error) {
            console.error("Failed to delete character:", error);
        }
    }

    const activeCharacter = selectedCharacters[0] || null;

    return (
        <div className="container">
            <Sidebar
                characters={characters}
                selectedCharacters={selectedCharacters}
                setSelectedCharacters={setSelectedCharacters}
                onEdit={setEditingCharacter}
                onDelete={removeCharacter}
                onOpenChat={() => setIsChatOpen(true)}
                setIsChatOpen={setIsChatOpen}
                isChatOpen={isChatOpen}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <div className="main">
                <div className="mobileToolbar">
                    <button
                        type="button"
                        className="mobileSidebarToggle"
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                    >
                        {isSidebarOpen ? "Hide Characters" : "Show Characters"}
                    </button>
                </div>
                <Navbar />

                {editingCharacter ? (
                    <CharacterForm
                        addCharacter={addCharacter}
                        editCharacter={saveCharacter}
                        editingCharacter={editingCharacter}
                        cancelEdit={() => setEditingCharacter(null)}
                    />
                ) : isChatOpen && selectedCharacters.length > 0 ? (
                    <ChatBox characters={selectedCharacters} />
                ) : selectedCharacters.length > 0 ? (
                    <div className="chatPrompt">
                        {/* <h3>Ready to chat?</h3> */}
                        {/* <p>Select a character and open the chat view when you are ready.</p> */}
                        {/* <button type="button" onClick={() => setIsChatOpen(true)}> */}
                            {/* Open Chat */}
                        {/* </button> */}
                    </div>
                ) : (
                    <CharacterForm addCharacter={addCharacter} />
                )}
            </div>
        </div>
    );
}

export default Home;