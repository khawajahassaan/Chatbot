import React, { useState, useEffect, useRef } from 'react';
import './chatbox.css';

function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SUGGESTIONS = [
    '🌤️ What color is the sky?',
    '☀️ What color is the sun?',
    '📍 Where is FAST?',
];

export default function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const sendMessage = async (text) => {
        const msg = text || input;
        if (!msg.trim()) return;

        const userMessage = { role: 'user', text: msg, time: getTime() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.DEV ? 'http://localhost:8000/api/chat' : '/api/chat';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.text,
                    history: messages.map(m => ({ role: m.role, text: m.text }))
                })
            });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
            }
            
            const data = await response.json();
            setMessages([...newMessages, { role: 'bot', text: data.reply, time: getTime() }]);
        } catch (error) {
            console.error(error);
            setMessages([...newMessages, {
                role: 'bot',
                text: `⚠️ Server Error: ${error.message}`,
                time: getTime()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const isEmpty = messages.length === 0;

    return (
        <div className="chat-page">
            <div className="chat-container">

                {/* ── Header ── */}
                <div className="chat-header">
                    <div className="header-left">
                        <div className="avatar">🤖</div>
                        <div className="header-info">
                            <h2>Knowledge Agent</h2>
                            <div className="status-badge">
                                <span className="status-dot"></span>
                                Online &amp; Ready
                            </div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="action-btn" title="Clear chat"
                            onClick={() => setMessages([])}>🗑️</button>
                    </div>
                </div>


                {/* ── Messages ── */}
                <div className="chat-box">
                    {isEmpty ? (
                        <div className="empty-state">
                            <div className="empty-icon">💬</div>
                            <p className="empty-text">Ask me anything!</p>
                            <div className="suggestion-chips">
                                {SUGGESTIONS.map((s) => (
                                    <button key={s} className="chip" onClick={() => sendMessage(s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`message-wrapper ${msg.role}`}>
                                {msg.role === 'bot' && <div className="bot-icon">🤖</div>}
                                <div className="message-content">
                                    <div className={`message-bubble ${msg.role}`}>{msg.text}</div>
                                    <span className="message-time">{msg.time}</span>
                                </div>
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="message-wrapper bot">
                            <div className="bot-icon">🤖</div>
                            <div className="message-content">
                                <div className="typing-bubble">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* ── Input ── */}
                <div className="input-area">
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="chat-input"
                            placeholder="Ask a question..."
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={() => sendMessage()}
                        className="send-button"
                        disabled={isLoading || !input.trim()}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>

                <div className="chat-footer-hint">
                    Made by Hassaan Tariq
                </div>
            </div>
        </div>
    );
}