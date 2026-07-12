import { useState } from "react";

import "./ChatInput.css";

function ChatInput({ sendMessage, selectedCharacters, onSelectCharacter }) {
    const [input, setInput] = useState("");
    const [selectedCharacterId, setSelectedCharacterId] = useState("");

    function handleSend() {
        if (!input.trim()) return;

        const target = selectedCharacters.find((character) => character.id === selectedCharacterId) || null;
        sendMessage(input, target);
        setInput("");
    }

    return (
        <div className="inputBox">
            <select
                value={selectedCharacterId}
                onChange={(e) => {
                    const nextValue = e.target.value;
                    setSelectedCharacterId(nextValue);
                    const target = selectedCharacters.find((character) => character.id === nextValue) || null;
                    onSelectCharacter(target);
                }}
            >
                <option value="">All selected characters</option>
                {selectedCharacters.map((character) => (
                    <option key={character.id} value={character.id}>
                        {character.name}
                    </option>
                ))}
            </select>

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSend();
                    }
                }}
            />

            <button onClick={handleSend}>Send</button>
        </div>
    );
}

export default ChatInput;