import { useEffect, useState } from "react";
import "./Sidebar.css";

function Sidebar({
    characters,
    selectedCharacters,
    setSelectedCharacters,
    onEdit,
    onDelete,
    onOpenChat,
    setIsChatOpen,
    isChatOpen,
    isSidebarOpen,
    setIsSidebarOpen,
}) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        function checkMobile() {
            setIsMobile(window.innerWidth <= 768);
        }

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    function closeSidebar() {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }

    function toggleCharacter(character) {
        const exists = selectedCharacters.some(
            (item) => (item.id && character.id && item.id === character.id) || item.name === character.name
        );

        let nextSelection;
        if (exists) {
            nextSelection = selectedCharacters.filter((item) => item.name !== character.name);
        } else {
            nextSelection = [...selectedCharacters, character];
        }

        setSelectedCharacters(nextSelection);
        setIsChatOpen(nextSelection.length > 0);
        closeSidebar();
    }

    return (
        <div className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
            <div className="sidebarHeader">
                <h2>Characters</h2>
                <button type="button" className="sidebarCloseBtn" onClick={closeSidebar}>
                    ✕
                </button>
            </div>

            {selectedCharacters.length > 0 && !isChatOpen && (
                <button
                    type="button"
                    className="openChatButton"
                    onClick={() => {
                        onOpenChat();
                        closeSidebar();
                    }}
                >
                    Open Chat
                </button>
            )}

            {characters.map((character, index) => (
                <div key={character.id || index} className="characterCard">
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedCharacters.some(
                                (item) => (item.id && character.id && item.id === character.id) || item.name === character.name
                            )}
                            onChange={() => toggleCharacter(character)}
                        />
                        {character.name}
                    </label>

                    <div className="characterActions">
                        <button type="button" onClick={() => onEdit(character)}>
                            Edit
                        </button>
                        <button type="button" onClick={() => onDelete(character)}>
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Sidebar;