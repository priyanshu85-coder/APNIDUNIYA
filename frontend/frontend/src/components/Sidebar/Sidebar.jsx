import { FaCommentDots, FaEdit, FaPlus, FaTimes, FaTrashAlt, FaUserAstronaut } from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({
    characters,
    selectedCharacters,
    setSelectedCharacters,
    onCreate,
    onEdit,
    onDelete,
    onOpenChat,
    setIsChatOpen,
    isChatOpen,
    isSidebarOpen,
    setIsSidebarOpen,
}) {
    function closeSidebar() {
        setIsSidebarOpen(false);
    }

    function toggleCharacter(character) {
        const exists = selectedCharacters.some(
            (item) => (item.id && character.id && item.id === character.id) || item.name === character.name
        );

        const nextSelection = exists
            ? selectedCharacters.filter(
                  (item) => !((item.id && character.id && item.id === character.id) || item.name === character.name)
              )
            : [...selectedCharacters, character];

        setSelectedCharacters(nextSelection);
        setIsChatOpen(nextSelection.length > 0);
        closeSidebar();
    }

    return (
        <aside className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
            <div className="sidebarHeader">
                <div>
                    <span>Studio</span>
                    <h2 className="character">Characters</h2>
                </div>
                <button type="button" className="sidebarCloseBtn" onClick={closeSidebar} aria-label="Close sidebar">
                    <FaTimes />
                </button>
            </div>

            {/* <button type="button" className="newBtn" onClick={onCreate}> */}
            <button
    type="button"
    className="newBtn"
    onClick={() => {
        onCreate();
        closeSidebar();
    }}
>
                <FaPlus />
                New Character
            </button>

            {selectedCharacters.length > 0 && !isChatOpen && (
                <button
                    type="button"
                    className="openChatButton"
                    onClick={() => {
                        onOpenChat();
                        closeSidebar();
                    }}
                >
                    <FaCommentDots />
                    Open Chat
                </button>
            )}

            <div className="characterList">
                {characters.length === 0 ? (
                    <div className="sidebarEmpty">
                        <FaUserAstronaut />
                        <p>No characters yet.</p>
                    </div>
                ) : (
                    characters.map((character, index) => {
                        const isSelected = selectedCharacters.some(
                            (item) =>
                                (item.id && character.id && item.id === character.id) || item.name === character.name
                        );

                        return (
                            <article
                                key={character.id || index}
                                className={`characterCard ${isSelected ? "selected" : ""}`}
                                onClick={() => toggleCharacter(character)}
                            >
                                <label
                                    className="characterSelect"
                                    onClick={(event) => event.stopPropagation()}
                                    aria-label={`Select ${character.name || "character"}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleCharacter(character)}
                                    />
                                </label>
                                <div className="characterAvatar">
                                    {(character.name || "A").slice(0, 1).toUpperCase()}
                                </div>
                                <div className="characterInfo">
                                    <h3>{character.name || "Unnamed"}</h3>
                                    <p>{character.relationship || character.personality || "Ready to chat"}</p>
                                </div>

                                <div className="characterActions" onClick={(e) => e.stopPropagation()}>
                                    <button type="button" onClick={() => onEdit(character)} aria-label="Edit character">
                                        <FaEdit />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(character)}
                                        aria-label="Delete character"
                                    >
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
