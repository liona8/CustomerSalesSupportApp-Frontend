// src/components/FloatingChatbot.jsx
import { useState, useRef, useEffect } from "react";
import { Bot, Lock, User, Send, X, MessageCircle, Mic, MicOff, Minus, Headphones } from "lucide-react";
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

export const FloatingChatbot = ({ isOpen, setIsOpen }) =>{
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "👋 Hi there! I'm your ServiceHub assistant. How can I help you today?", time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [botTurn, setBotTurn] = useState(0);
  const [showReplies, setShowReplies] = useState(true);
  const [unread, setUnread] = useState(0);
  const [minimised, setMinimised] = useState(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [voiceMode, setVoiceMode] = useState(false); // full voice UI mode

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  useEffect(() => {
    if (isOpen) { setUnread(0); setMinimised(false); setTimeout(() => inputRef.current?.focus(), 150); }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !minimised) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen, minimised]);

  // Stop listening if panel closes or minimises
  useEffect(() => {
    if (!isOpen || minimised) stopListening();
  }, [isOpen, minimised]);

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
    setTranscript("");
    setShowReplies(false);
    setMessages(m => [...m, { id: Date.now(), from: "user", text: msg, time: getTime() }]);
    const reply = CHATBOT_FLOWS[msg] || GENERIC_REPLIES[botTurn % GENERIC_REPLIES.length];
    setBotTurn(t => t + 1);
    addBotMsg(reply);
  };

  // ── Voice recognition ──
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setVoiceError("");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-MY";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); setTranscript(""); };

    recognition.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) {
        setInput(final);
        // Auto-send after brief pause
        setTimeout(() => {
          setIsListening(false);
          sendMessage(final);
        }, 400);
      }
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      if (e.error === "not-allowed") setVoiceError("Microphone access denied. Please allow mic in browser settings.");
      else if (e.error === "no-speech") setVoiceError("No speech detected. Try again.");
      else setVoiceError("Voice input error. Try again.");
      setTimeout(() => setVoiceError(""), 4000);
    };

    recognition.onend = () => { setIsListening(false); };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  };

  const toggleVoice = () => {
    if (isListening) stopListening();
    else startListening();
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
              {voiceSupported && !minimised && (
                <button
                  className={`fcb-hbtn fcb-voice-mode-btn ${voiceMode ? "fcb-voice-mode-on" : ""}`}
                  onClick={() => { setVoiceMode(m => !m); if (isListening) stopListening(); }}
                  title={voiceMode ? "Switch to text mode" : "Switch to voice mode"}
                >
                  <Mic size={14} />
                </button>
              )}
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
              {/* Messages */}
              <div className="fcb-messages">
                <div className="fcb-welcome-banner">
                  <div className="fcb-welcome-icon"><Headphones size={18} /></div>
                  <div>
                    <div className="fcb-welcome-title">We're here to help</div>
                    <div className="fcb-welcome-sub">
                      Ask anything about your appliance, warranty, or service.
                      {voiceSupported && <span className="fcb-voice-hint"> 🎤 Voice input supported.</span>}
                    </div>
                  </div>
                </div>

                {messages.map(msg => (
                  <div key={msg.id} className={`fcb-row ${msg.from === "user" ? "fcb-right" : "fcb-left"}`}>
                    {msg.from === "bot" && <div className="fcb-bot-av"><Bot size={11} /></div>}
                    <div className="fcb-col">
                      <div className={`fcb-bubble ${msg.from === "user" ? "fcb-bubble-u" : "fcb-bubble-b"}`}>
                        {msg.voice && <span className="fcb-voice-tag"><Mic size={8} /> Voice</span>}
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

                {showReplies && !isTyping && !voiceMode && (
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

              {/* Voice error toast */}
              {voiceError && (
                <div className="fcb-voice-error">
                  <AlertCircle size={12} /> {voiceError}
                </div>
              )}

              {/* ── VOICE MODE UI ── */}
              {voiceMode ? (
                <div className="fcb-voice-panel">
                  <div className="fcb-voice-top">
                    {isListening ? (
                      <div className="fcb-listening-state">
                        <div className="fcb-mic-rings">
                          <span className="fcb-ring fcb-ring-1" />
                          <span className="fcb-ring fcb-ring-2" />
                          <span className="fcb-ring fcb-ring-3" />
                          <button className="fcb-mic-btn fcb-mic-active" onClick={stopListening}>
                            <MicOff size={22} />
                          </button>
                        </div>
                        <div className="fcb-voice-label">Listening…</div>
                        {transcript && (
                          <div className="fcb-transcript">
                            <span className="fcb-transcript-text">"{transcript}"</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="fcb-idle-state">
                        <button className="fcb-mic-btn" onClick={startListening}>
                          <Mic size={22} />
                        </button>
                        <div className="fcb-voice-label">Tap to speak</div>
                        <div className="fcb-voice-sublabel">or switch back to text mode using the mic icon above</div>
                      </div>
                    )}
                  </div>

                  {/* Also allow typing in voice mode */}
                  <div className="fcb-voice-type-row">
                    <input
                      className="fcb-input fcb-voice-input"
                      placeholder="Or type here…"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                    />
                    <button className={`fcb-send ${input.trim() ? "active" : ""}`} onClick={() => sendMessage()} disabled={!input.trim()}>
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                /* ── TEXT MODE UI ── */
                <div className="fcb-input-area">
                  <input
                    ref={inputRef}
                    className="fcb-input"
                    placeholder="Type a message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                  />
                  {/* Inline mic button in text mode */}
                  {voiceSupported && (
                    <button
                      className={`fcb-inline-mic ${isListening ? "fcb-inline-mic-active" : ""}`}
                      onClick={toggleVoice}
                      title={isListening ? "Stop listening" : "Speak your message"}
                    >
                      {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                    </button>
                  )}
                  <button className={`fcb-send ${input.trim() ? "active" : ""}`} onClick={() => sendMessage()} disabled={!input.trim()}>
                    <Send size={14} />
                  </button>
                </div>
              )}

              {/* Inline listening indicator strip (text mode) */}
              {isListening && !voiceMode && (
                <div className="fcb-listening-strip">
                  <div className="fcb-strip-bars">
                    <span /><span /><span /><span /><span />
                  </div>
                  {transcript
                    ? <span className="fcb-strip-text">"{transcript}"</span>
                    : <span className="fcb-strip-text">Listening…</span>}
                  <button className="fcb-strip-stop" onClick={stopListening}><X size={10} /></button>
                </div>
              )}

              <div className="fcb-foot">
                <Lock size={10} /> Encrypted &amp; private · ServiceHub AI
                {voiceSupported && <span className="fcb-foot-voice"> · 🎤 Voice ready</span>}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}