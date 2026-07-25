import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import Message from "./Message";
import ChatInput from "./ChatInput";
import "./ChatBox.css";

function ChatBox({ characters }) {
    const [messages, setMessages] = useState([]);
    // null means every character currently selected in the sidebar.
    const [recipientIds, setRecipientIds] = useState(null);
    const messagesEndRef = useRef(null);
    const recipients = recipientIds === null
        ? characters
        : characters.filter((character) => recipientIds.includes(character.id));

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    useEffect(() => {
        setRecipientIds((currentIds) => {
            if (currentIds === null) return null;

            return currentIds.filter((id) => characters.some((character) => character.id === id));
        });
    }, [characters]);

    async function sendMessage(question) {
        const userMessage = {
            sender: "user",
            text: question,
        };

        setMessages((prev) => [...prev, userMessage]);

        try {
            const payload = {
                question,
                characters: recipients,
            };

            const response = await api.post("/chat", payload);

            const aiMessages = (response.data.answers || []).map((item) => ({
                sender: item.name,
                text: item.text,
            }));

            setMessages((prev) => [...prev, ...aiMessages]);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="chatContainer">
            <div className="chatHeader">
                <span>
                    Chat with {recipients.map((character) => character.name).join(", ") || "selected characters"}
                </span>
                <button type="button" onClick={() => setMessages([])}>
                    New Chat
                </button>
            </div>

            <div className="messages">
                {messages.length === 0 ? (
                    <div className="emptyState">
                        {/* <h3>Start a conversation</h3> */}
                        {/* <p>Choose a character or talk to all selected ones.</p> */}
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <Message key={index} sender={msg.sender} text={msg.text} />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <ChatInput
                sendMessage={sendMessage}
                selectedCharacters={characters}
                recipientIds={recipientIds}
                onRecipientIdsChange={setRecipientIds}
            />
        </div>
    );
}

export default ChatBox;
