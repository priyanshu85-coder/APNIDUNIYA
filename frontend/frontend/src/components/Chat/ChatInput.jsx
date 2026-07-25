import { useRef, useState } from "react";

import "./ChatInput.css";

function ChatInput({ sendMessage, selectedCharacters, recipientIds, onRecipientIdsChange }) {
    const [input, setInput] = useState("");
    const recipientPickerRef = useRef(null);
    const isAllSelected = recipientIds === null;
    const selectedRecipients = isAllSelected
        ? selectedCharacters
        : selectedCharacters.filter((character) => recipientIds.includes(character.id));
    const recipientLabel = isAllSelected
        ? "All selected members"
        : selectedRecipients.map((character) => character.name).join(", ") || "Choose members";

    function handleSend() {
        if (!input.trim() || selectedRecipients.length === 0) return;

        sendMessage(input);
        setInput("");
    }

    function toggleRecipient(characterId) {
        if (isAllSelected) {
            onRecipientIdsChange([characterId]);
            recipientPickerRef.current?.removeAttribute("open");
            return;
        }

        onRecipientIdsChange(
            recipientIds.includes(characterId)
                ? recipientIds.filter((id) => id !== characterId)
                : [...recipientIds, characterId]
        );
        recipientPickerRef.current?.removeAttribute("open");
    }

    return (
        <div className="inputBox">
            <details ref={recipientPickerRef} className="recipientPicker">
                <summary>{recipientLabel}</summary>
                <div className="recipientMenu">
                    <button
                        type="button"
                        onClick={() => {
                            onRecipientIdsChange(null);
                            recipientPickerRef.current?.removeAttribute("open");
                        }}
                    >
                        Select all members
                    </button>
                    {selectedCharacters.map((character) => {
                        const isSelected = isAllSelected || recipientIds.includes(character.id);

                        return (
                            <label key={character.id}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleRecipient(character.id)}
                                />
                                <span>{character.name}</span>
                            </label>
                        );
                    })}
                </div>
            </details>

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

            <button type="button" onClick={handleSend} disabled={selectedRecipients.length === 0}>
                Send
            </button>
        </div>
    );
}

export default ChatInput;
