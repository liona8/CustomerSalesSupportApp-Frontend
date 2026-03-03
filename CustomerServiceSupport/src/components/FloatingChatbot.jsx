// src/components/FloatingChatbot.jsx
import { useState, useRef, useEffect } from "react";
import { Bot, Lock, User, Send, X, MessageCircle, Minus, Headphones } from "lucide-react";
import "../assets/chatbot.css";

const QUICK_REPLIES = [
  "Check warranty status",
  "Error code help",
  "Schedule a repair",
  "Track my service",
  "Spare parts info",
  "Speak to an agent",
];

const CHATBOT_FLOWS = {
  "Check warranty status": "Sure! Please share your serial number (e.g. SN-WM2024-001) and I'll check your warranty status right away.",
  "Error code help": "I can help with that! Please tell me the error code on your appliance display (e.g. E3, F5) and the product model.",
  "Schedule a repair": "I'll help you book a technician. Could you describe the issue? A technician will be scheduled within 24–48 hours.",
  "Track my service": "Please share your Ticket ID (e.g. TK-2841) or serial number and I'll pull up your service status.",
  "Spare parts info": "I can check parts availability. Please share your product model and the part needed, or describe the fault.",
  "Speak to an agent": "Connecting you now... 🟢 **Sara Lim** has joined the chat. How can she help you today?",
};

const GENERIC_REPLIES = [
  "I understand. Let me look into that for you...",
  "Thanks for the details! I'm checking our records now.",
  "Got it. Based on what you've described, I recommend submitting a service request. Shall I create one?",
  "I've flagged this for our technical team. Reference **TK-2851** has been created. Anything else?",
  "You're all set! Is there anything else I can help you with today?",
];

function getTime() {
  return new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
}

export const FloatingChatbot = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "👋 Hi there! I'm your ServiceHub assistant. How can I help you today?", time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [botTurn, setBotTurn] = useState(0);
  const [showReplies, setShowReplies] = useState(true);
  const [unread, setUnread] = useState(0);
  const [minimised, setMinimised] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) { setUnread(0); setMinimised(false); setTimeout(() => inputRef.current?.focus(), 150); }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !minimised) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen, minimised]);

  const addBotMsg = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(m => [...m, { id: Date.now(), from: "bot", text, time: getTime() }]);
      if (!isOpen) setUnread(u => u + 1);
    }, 900 + Math.random() * 500);
  };

  const sendMessage = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    setShowReplies(false);
    setMessages(m => [...m, { id: Date.now(), from: "user", text: msg, time: getTime() }]);
    const reply = CHATBOT_FLOWS[msg] || GENERIC_REPLIES[botTurn % GENERIC_REPLIES.length];
    setBotTurn(t => t + 1);
    addBotMsg(reply);
  };

  const renderText = (text) =>
    text.split("**").map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);

  return (
    <>
      {/* FAB Trigger */}
      <button className={`fcb-trigger ${isOpen ? "fcb-open" : ""}`}
        onClick={() => { setIsOpen(!isOpen); setUnread(0); }} aria-label="Chat with us">
        <div className="fcb-trigger-icon">{isOpen ? <X size={22} /> : <MessageCircle size={22} />}</div>
        {!isOpen && unread > 0 && <span className="fcb-unread">{unread}</span>}
        {!isOpen && <span className="fcb-pulse" />}
      </button>

      {/* Tooltip label when closed */}
      {!isOpen && (
        <div className="fcb-label-pill">
          <Bot size={12} /> Chat with us
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className={`fcb-panel ${minimised ? "fcb-minimised" : ""}`}>
          {/* Header */}
          <div className="fcb-header">
            <div className="fcb-header-left">
              <div className="fcb-avatar-wrap">
                <div className="fcb-avatar"><Bot size={17} /></div>
                <span className="fcb-avatar-dot" />
              </div>
              <div>
                <div className="fcb-name">ServiceHub AI</div>
                <div className="fcb-status"><span className="fcb-online-dot" /> Online now</div>
              </div>
            </div>
            <div className="fcb-header-btns">
              <button className="fcb-hbtn" onClick={() => setMinimised(m => !m)} title={minimised ? "Expand" : "Minimise"}>
                <Minus size={14} />
              </button>
              <button className="fcb-hbtn" onClick={() => setIsOpen(false)} title="Close">
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Body */}
              <div className="fcb-messages">
                {/* Welcome banner */}
                <div className="fcb-welcome-banner">
                  <div className="fcb-welcome-icon"><Headphones size={18} /></div>
                  <div>
                    <div className="fcb-welcome-title">We're here to help</div>
                    <div className="fcb-welcome-sub">Ask anything about your appliance, warranty, or service request.</div>
                  </div>
                </div>

                {messages.map(msg => (
                  <div key={msg.id} className={`fcb-row ${msg.from === "user" ? "fcb-right" : "fcb-left"}`}>
                    {msg.from === "bot" && <div className="fcb-bot-av"><Bot size={11} /></div>}
                    <div className="fcb-col">
                      <div className={`fcb-bubble ${msg.from === "user" ? "fcb-bubble-u" : "fcb-bubble-b"}`}>
                        {renderText(msg.text)}
                      </div>
                      <div className="fcb-time">{msg.time}</div>
                    </div>
                    {msg.from === "user" && <div className="fcb-user-av"><User size={11} /></div>}
                  </div>
                ))}

                {isTyping && (
                  <div className="fcb-row fcb-left">
                    <div className="fcb-bot-av"><Bot size={11} /></div>
                    <div className="fcb-typing"><span /><span /><span /></div>
                  </div>
                )}

                {showReplies && !isTyping && (
                  <div className="fcb-quick-wrap">
                    <div className="fcb-quick-label">Choose a topic or type below:</div>
                    <div className="fcb-quick-grid">
                      {QUICK_REPLIES.map((r, i) => (
                        <button key={i} className="fcb-quick" onClick={() => sendMessage(r)}>{r}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="fcb-input-area">
                <input ref={inputRef} className="fcb-input" placeholder="Type a message..."
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()} />
                <button className={`fcb-send ${input.trim() ? "active" : ""}`} onClick={() => sendMessage()} disabled={!input.trim()}>
                  <Send size={14} />
                </button>
              </div>

              <div className="fcb-foot">
                <Lock size={10} /> Encrypted &amp; private · ServiceHub AI
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}