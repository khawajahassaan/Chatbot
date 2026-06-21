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

        <div className="chat-page">
            <div className="chat-container">
                
                {/* ── Messages ── */}
                <div className="chat-box">
                    {isEmpty ? (
                        <div className="hero-empty-state">
                            <h1 className="hero-title">Ready when you are.</h1>
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
                <div className="input-area-wrapper">
                    <div className="input-pill">
                        <button className="icon-btn plus-btn" title="Add attachment">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="pill-input"
                            placeholder="Ask anything"
                            disabled={isLoading}
                        />
                        
                        <div className="pill-actions">
                            <button className="icon-btn mic-btn" title="Voice input">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                            </button>
                            <button className="voice-mode-btn" onClick={() => sendMessage()} disabled={isLoading && !input.trim()}>
                                {input.trim() ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
                                        Voice
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="chat-footer-hint">
                    Made by <a href="https://www.linkedin.com/in/khawaja-hassaan-tariq/" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Hassaan Tariq</a>
                </div>
            </div>
        </div>
    );
}