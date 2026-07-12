import { useEffect, useRef, useState } from "react";
import api from "../../services/api";
import Message from "./Message";
import ChatInput from "./ChatInput";
import "./ChatBox.css";

function ChatBox({ characters }) {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    async function sendMessage(question, targetCharacter) {
        const effectiveTarget = targetCharacter || null;
        const userMessage = {
            sender: "user",
            text: question,
        };

        setMessages((prev) => [...prev, userMessage]);

        try {
            const payload = {
                question,
                characters: effectiveTarget ? [effectiveTarget] : characters,
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
                <span>Chat with {characters.map((c) => c.name).join(", ") || "selected characters"}</span>
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
                onSelectCharacter={() => {}}
            />
        </div>
    );
}

export default ChatBox;