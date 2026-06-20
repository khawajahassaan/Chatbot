import React, { useState, useEffect, useRef } from 'react';
import './chatbox.css';

export default function Chatbot() {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your custom knowledge base bot. How can I help?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useGeneralKnowledge, setUseGeneralKnowledge] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMessage.text,
                    use_general_knowledge: useGeneralKnowledge
                })
            });

            const data = await response.json();
            setMessages([...newMessages, { role: 'bot', text: data.reply }]);
        } catch (error) {
            console.error("Fetch error:", error);
            setMessages([...newMessages, { role: 'bot', text: 'Error connecting to the server. Make sure the Python backend is running.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="avatar">✨</div>
                <div>
                    <h2>Knowledge Agent</h2>
                    <p className="status">Online & Ready</p>
                </div>
            </div>

            <div className="toggle-container">
                <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={useGeneralKnowledge} 
                        onChange={(e) => setUseGeneralKnowledge(e.target.checked)} 
                    />
                    <span className="slider"></span>
                </label>
                <span>Use general knowledge if answer is not in context</span>
            </div>

            <div className="chat-box">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-wrapper ${msg.role}`}>
                        <div className={`message-bubble ${msg.role}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message-wrapper bot">
                        <div className="message-bubble bot typing">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="chat-input"
                    placeholder="Ask a question..."
                    disabled={isLoading}
                />
                <button onClick={sendMessage} className="send-button" disabled={isLoading || !input.trim()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    );
}