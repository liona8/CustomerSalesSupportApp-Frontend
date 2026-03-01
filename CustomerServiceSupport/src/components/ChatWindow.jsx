//src/components/ChatWindow.jsx
import { useState, useRef, useEffect } from "react";
import { Headphones, X, Bot, User, Send, Hash } from "lucide-react";

const BOT_RESPONSES = [
  "Hello! I'm your ServiceHub AI assistant. I've received your details and created a support ticket for you. How can I help you today?",
  "I understand your concern. Based on the issue you described, I'd like to ask a few questions to better assist you.",
  "Could you please describe the problem in more detail? For example — any error codes on the display, unusual noises, or specific symptoms?",
  "Thank you for that information. I'm checking our knowledge base and your service history now...",
  "I've flagged this for our technical team. A senior agent will join this chat shortly. Your reference number is **TK-2847**. Is there anything else I can help you with?",
];

export const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", name: "AI Assistant", text: "Hello! I'm your ServiceHub AI assistant. I've received your details and created a support ticket for you. How can I help you today?", time: formatTime() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [botIndex, setBotIndex] = useState(1);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  function formatTime() {
    return new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
  }

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: "user", name: "You", text: input, time: formatTime() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response = BOT_RESPONSES[botIndex % BOT_RESPONSES.length];
      setMessages(m => [...m, { id: Date.now() + 1, from: botIndex > 2 ? "agent" : "bot", name: botIndex > 2 ? "Sara Lim" : "AI Assistant", text: response, time: formatTime() }]);
      setBotIndex(i => i + 1);
    }, 1500 + Math.random() * 800);
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-win-header">
        <div className="chat-win-avatar"><Headphones size={16} /></div>
        <div>
          <div className="chat-win-name">ServiceHub Support</div>
          <div className="chat-win-status"><span style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", display: "inline-block" }} /> Online · Agent assigned</div>
        </div>
        <button className="chat-win-close" onClick={onClose}><X size={14} /></button>
      </div>
      <div className="chat-win-ticket">
        <Hash size={10} /> Ticket <strong>TK-2847</strong> created · Serial: SN-WM2024-001
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`msg-bubble-row ${msg.from === "user" ? "user" : "agent"}`}>
            {msg.from !== "user" && (
              <div className={`msg-avatar-small ${msg.from === "bot" ? "msg-avatar-bot" : "msg-avatar-agent"}`}>
                {msg.from === "bot" ? <Bot size={12} /> : msg.name.split(" ").map(n => n[0]).join("")}
              </div>
            )}
            <div className="msg-content">
              <div className="msg-name">
                {msg.from === "bot" && <span className="bot-label"><Bot size={9} /> AI</span>}
                {msg.name}
              </div>
              <div className={`msg-bubble ${msg.from === "user" ? "user" : msg.from === "bot" ? "bot" : "agent"}`}>
                {msg.text.split("**").map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
              </div>
              <div className="msg-time">{msg.time}</div>
            </div>
            {msg.from === "user" && (
              <div className="msg-avatar-small msg-avatar-user"><User size={12} /></div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="msg-bubble-row agent">
            <div className="msg-avatar-small msg-avatar-bot"><Bot size={12} /></div>
            <div className="msg-content">
              <div className="msg-name">AI Assistant</div>
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="chat-win-input">
        <input
          className="chat-win-text"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button className="chat-win-send" onClick={sendMessage}><Send size={14} /></button>
      </div>
    </div>
  );
}