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
    function toggleCharacter(character) {
        const exists = selectedCharacters.some(
            (item) => (item.id && character.id && item.id === character.id) || item.name === character.name
        );

        if (exists) {
            setSelectedCharacters((prev) => prev.filter((item) => item.name !== character.name));
        } else {
            setSelectedCharacters((prev) => [...prev, character]);
        }

        setIsChatOpen(false);
    }

    return (
        <div className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
            <h2>Characters</h2>

            {selectedCharacters.length > 0 && !isChatOpen && (
                <button type="button" className="openChatButton" onClick={onOpenChat}>
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