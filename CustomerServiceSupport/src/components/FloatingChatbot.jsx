// src/components/FloatingChatbot.jsx
import { useState, useRef, useEffect } from "react";
import {
  Bot, Lock, User, Send, X, MessageCircle,
  Mic, MicOff, Minus, Headphones, Phone, AlertCircle, CheckCircle
} from "lucide-react";
import "../assets/chatbot.css";
import { sendChatMessage } from "../service/chatbot";

// ── Quick reply chips shown on first load ─────────────────────
const QUICK_REPLIES = [
  "Check warranty status",
  "Error code help",
  "Schedule a repair",
  "Track my service",
  "Spare parts info",
  "Speak to an agent",
];

// ── Phrases the AI returns when it wants to hand off ─────────
// The backend sends the exact escalation message — we detect it here.
const HANDOFF_PHRASES = [
  "i'll pass you to one of our live agents",
  "saya akan sambungkan anda dengan ejen langsung",
  "someone will be with you shortly",
  "pass you to one of our live agents",
];

// ── Live agent persona (swap with real data from your backend) ─
const LIVE_AGENT = {
  name:     "Sara Lim",
  role:     "Customer Support Specialist",
  initials: "SL",
  phone:    "1300-88-5678",
  color:    "#7c3aed",   // purple — visually distinct from the AI blue
};

function getTime() {
  return new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
}

/** Returns true if the bot reply is a handoff message */
function isHandoffMessage(text = "") {
  return HANDOFF_PHRASES.some(phrase =>
    text.toLowerCase().includes(phrase)
  );
}

export const FloatingChatbot = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([
    {
      id: 1, from: "bot",
      text: "👋 Hi there! I'm your ServiceHub assistant. How can I help you today?",
      time: getTime(),
    },
  ]);
  const [input,       setInput]       = useState("");
  const [isTyping,    setIsTyping]     = useState(false);
  const [showReplies, setShowReplies]  = useState(true);
  const [unread,      setUnread]       = useState(0);
  const [minimised,   setMinimised]    = useState(false);
  const [threadId,    setThreadId]     = useState(null);

  // ── Escalation state ──────────────────────────────────────
  // Once true: header swaps to agent, input is locked, call button appears
  const [isEscalated, setIsEscalated] = useState(false);

  // ── Voice state ───────────────────────────────────────────
  const [isListening,    setIsListening]    = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError,     setVoiceError]     = useState("");
  const [transcript,     setTranscript]     = useState("");
  const [voiceMode,      setVoiceMode]      = useState(false);

  const endRef        = useRef(null);
  const inputRef      = useRef(null);
  const recognitionRef = useRef(null);

  // ── Lifecycle ─────────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setMinimised(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !minimised) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen, minimised]);

  useEffect(() => {
    if (!isOpen || minimised) stopListening();
  }, [isOpen, minimised]);

  // ── Escalation trigger ────────────────────────────────────
  // Called right after the handoff message is displayed.
  // Adds the live-agent intro message after a short pause.
  const triggerEscalation = () => {
    setIsEscalated(true);
    setShowReplies(false);

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(m => [...m, {
          id:            Date.now(),
          from:          "agent",
          isHandoffIntro: true,
          text:
            `Hi, I'm ${LIVE_AGENT.name} — ${LIVE_AGENT.role} at ServiceHub. ` +
            `I've reviewed your conversation and fully understand the issue you're facing. ` +
            `You have my complete attention and I'll personally make sure this gets resolved for you. 😊\n\n` +
            `How would you like to proceed?`,
          time: getTime(),
        }]);
      }, 1600);
    }, 800);
  };

  // ── Message send ──────────────────────────────────────────
  const sendMessage = async (text) => {
    if (isEscalated) return; // input locked after handoff

    const msg = (text || input).trim();
    if (!msg) return;

    setInput("");
    setTranscript("");
    setShowReplies(false);

    setMessages(m => [...m, { id: Date.now(), from: "user", text: msg, time: getTime() }]);
    setIsTyping(true);

    try {
      const data = await sendChatMessage(msg, threadId);
      setThreadId(data.thread_id);
      setIsTyping(false);

      const replyText = data.reply;
      setMessages(m => [...m, { id: Date.now(), from: "bot", text: replyText, time: getTime() }]);

      // ── KEY DETECTION ─────────────────────────────────────
      // If the AI returned the escalation phrase → switch to live agent
      if (isHandoffMessage(replyText)) {
        triggerEscalation();
      }

    } catch {
      setIsTyping(false);
      setMessages(m => [...m, {
        id: Date.now(), from: "bot",
        text: "⚠️ Unable to connect to server.",
        time: getTime(),
      }]);
    }
  };

  // ── Voice recognition ─────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    setVoiceError("");
    const recognition = new SR();
    recognition.lang            = "en-MY";
    recognition.continuous      = false;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); setTranscript(""); };

    recognition.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        e.results[i].isFinal ? (final += t) : (interim += t);
      }
      setTranscript(final || interim);
      if (final) {
        setInput(final);
        setTimeout(() => { setIsListening(false); sendMessage(final); }, 400);
      }
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      if      (e.error === "not-allowed") setVoiceError("Microphone access denied. Allow mic in browser settings.");
      else if (e.error === "no-speech")   setVoiceError("No speech detected. Try again.");
      else                                setVoiceError("Voice input error. Try again.");
      setTimeout(() => setVoiceError(""), 4000);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  };

  const toggleVoice = () => isListening ? stopListening() : startListening();

  // ── Helpers ───────────────────────────────────────────────
  const renderText = (text) =>
    text.split("**").map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);

  const renderMultiline = (text) =>
    text.split("\n").map((line, i, arr) => (
      <span key={i}>{renderText(line)}{i < arr.length - 1 && <br />}</span>
    ));

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      {/* ── FAB Trigger ── */}
      <button
        className={`fcb-trigger ${isOpen ? "fcb-open" : ""}`}
        onClick={() => { setIsOpen(!isOpen); setUnread(0); }}
        aria-label="Chat with us"
      >
        <div className="fcb-trigger-icon">
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        </div>
        {!isOpen && unread > 0 && <span className="fcb-unread">{unread}</span>}
        {!isOpen && <span className="fcb-pulse" />}
      </button>

      {/* Tooltip pill when closed */}
      {!isOpen && (
        <div className="fcb-label-pill">
          <Bot size={12} /> Chat with us
        </div>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div className={`fcb-panel ${minimised ? "fcb-minimised" : ""}`}>

          {/* ── Header — swaps to agent when escalated ── */}
          <div className={`fcb-header ${isEscalated ? "fcb-header-agent" : ""}`}>
            <div className="fcb-header-left">
              {isEscalated ? (
                /* Live agent header */
                <>
                  <div className="fcb-avatar-wrap">
                    <div
                      className="fcb-avatar fcb-avatar-human"
                      style={{ background: LIVE_AGENT.color }}
                    >
                      <span className="fcb-initials">{LIVE_AGENT.initials}</span>
                    </div>
                    <span className="fcb-avatar-dot fcb-avatar-dot-live" />
                  </div>
                  <div>
                    <div className="fcb-name">{LIVE_AGENT.name}</div>
                    <div className="fcb-status">
                      <span className="fcb-online-dot" /> Live Agent · {LIVE_AGENT.role}
                    </div>
                  </div>
                </>
              ) : (
                /* AI bot header */
                <>
                  <div className="fcb-avatar-wrap">
                    <div className="fcb-avatar"><Bot size={17} /></div>
                    <span className="fcb-avatar-dot" />
                  </div>
                  <div>
                    <div className="fcb-name">ServiceHub AI</div>
                    <div className="fcb-status">
                      <span className="fcb-online-dot" /> Online now
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="fcb-header-btns">
              {voiceSupported && !minimised && !isEscalated && (
                <button
                  className={`fcb-hbtn fcb-voice-mode-btn ${voiceMode ? "fcb-voice-mode-on" : ""}`}
                  onClick={() => { setVoiceMode(m => !m); if (isListening) stopListening(); }}
                  title={voiceMode ? "Switch to text mode" : "Switch to voice mode"}
                >
                  <Mic size={14} />
                </button>
              )}
              <button
                className="fcb-hbtn"
                onClick={() => setMinimised(m => !m)}
                title={minimised ? "Expand" : "Minimise"}
              >
                <Minus size={14} />
              </button>
              <button className="fcb-hbtn" onClick={() => setIsOpen(false)} title="Close">
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* ── Message list ── */}
              <div className="fcb-messages">

                {/* Welcome banner */}
                <div className="fcb-welcome-banner">
                  <div className="fcb-welcome-icon"><Headphones size={18} /></div>
                  <div>
                    <div className="fcb-welcome-title">We're here to help</div>
                    <div className="fcb-welcome-sub">
                      Ask anything about your appliance, warranty, or service.
                      {voiceSupported && (
                        <span className="fcb-voice-hint"> 🎤 Voice input supported.</span>
                      )}
                    </div>
                  </div>
                </div>

                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`fcb-row ${msg.from === "user" ? "fcb-right" : "fcb-left"}`}
                  >
                    {/* Avatar */}
                    {msg.from === "bot" && (
                      <div className="fcb-bot-av"><Bot size={11} /></div>
                    )}
                    {msg.from === "agent" && (
                      <div
                        className="fcb-agent-av"
                        style={{ background: LIVE_AGENT.color }}
                      >
                        <span>{LIVE_AGENT.initials}</span>
                      </div>
                    )}

                    <div className="fcb-col">
                      {/* Agent name tag above bubble */}
                      {msg.from === "agent" && (
                        <div className="fcb-agent-name-tag">
                          <span className="fcb-agent-live-dot" />
                          {LIVE_AGENT.name} · Live Agent
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={`fcb-bubble ${
                        msg.from === "user"  ? "fcb-bubble-u"     :
                        msg.from === "agent" ? "fcb-bubble-agent" :
                        "fcb-bubble-b"
                      }`}>
                        {msg.voice && (
                          <span className="fcb-voice-tag">
                            <Mic size={8} /> Voice
                          </span>
                        )}
                        {renderMultiline(msg.text)}
                      </div>

                      {/* ── Call button on the handoff intro message ── */}
                      {msg.isHandoffIntro && (
                        <div className="fcb-handoff-actions">
                          <a
                            href={`tel:${LIVE_AGENT.phone.replace(/-/g, "")}`}
                            className="fcb-call-btn"
                          >
                            <Phone size={14} />
                            Call {LIVE_AGENT.name} · {LIVE_AGENT.phone}
                          </a>
                          <div className="fcb-handoff-hint">
                            <CheckCircle size={10} />
                            Or keep chatting — {LIVE_AGENT.name.split(" ")[0]} is reading this conversation.
                          </div>
                        </div>
                      )}

                      <div className="fcb-time">{msg.time}</div>
                    </div>

                    {msg.from === "user" && (
                      <div className="fcb-user-av"><User size={11} /></div>
                    )}
                  </div>
                ))}

                {/* Typing indicator — shows agent avatar after escalation */}
                {isTyping && (
                  <div className="fcb-row fcb-left">
                    {isEscalated ? (
                      <div
                        className="fcb-agent-av"
                        style={{ background: LIVE_AGENT.color }}
                      >
                        <span>{LIVE_AGENT.initials}</span>
                      </div>
                    ) : (
                      <div className="fcb-bot-av"><Bot size={11} /></div>
                    )}
                    <div className="fcb-typing"><span /><span /><span /></div>
                  </div>
                )}

                {/* Quick reply chips — hidden after first message or escalation */}
                {showReplies && !isTyping && !voiceMode && !isEscalated && (
                  <div className="fcb-quick-wrap">
                    <div className="fcb-quick-label">Choose a topic or type below:</div>
                    <div className="fcb-quick-grid">
                      {QUICK_REPLIES.map((r, i) => (
                        <button key={i} className="fcb-quick" onClick={() => sendMessage(r)}>
                          {r}
                        </button>
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

              {/* ── Input area — locked after escalation ── */}
              {isEscalated ? (
                <div className="fcb-escalated-bar">
                  <div className="fcb-escalated-icon">
                    <Phone size={13} />
                  </div>
                  <div className="fcb-escalated-text">
                    <strong>{LIVE_AGENT.name}</strong> has taken over this chat.
                    <span> Call or keep chatting above.</span>
                  </div>
                </div>
              ) : voiceMode ? (
                /* Voice mode panel */
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
                        <div className="fcb-voice-sublabel">
                          or switch back to text mode using the mic icon above
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="fcb-voice-type-row">
                    <input
                      className="fcb-input fcb-voice-input"
                      placeholder="Or type here…"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                    />
                    <button
                      className={`fcb-send ${input.trim() ? "active" : ""}`}
                      onClick={() => sendMessage()}
                      disabled={!input.trim()}
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Text mode input */
                <div className="fcb-input-area">
                  <input
                    ref={inputRef}
                    className="fcb-input"
                    placeholder="Type a message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                  />
                  {voiceSupported && (
                    <button
                      className={`fcb-inline-mic ${isListening ? "fcb-inline-mic-active" : ""}`}
                      onClick={toggleVoice}
                      title={isListening ? "Stop listening" : "Speak your message"}
                    >
                      {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                    </button>
                  )}
                  <button
                    className={`fcb-send ${input.trim() ? "active" : ""}`}
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                  >
                    <Send size={14} />
                  </button>
                </div>
              )}

              {/* Listening strip */}
              {isListening && !voiceMode && !isEscalated && (
                <div className="fcb-listening-strip">
                  <div className="fcb-strip-bars">
                    <span /><span /><span /><span /><span />
                  </div>
                  <span className="fcb-strip-text">
                    {transcript ? `"${transcript}"` : "Listening…"}
                  </span>
                  <button className="fcb-strip-stop" onClick={stopListening}>
                    <X size={10} />
                  </button>
                </div>
              )}

              <div className="fcb-foot">
                <Lock size={10} />
                {isEscalated
                  ? <> Secured · Now with <strong>{LIVE_AGENT.name}</strong></>
                  : <> Encrypted &amp; private · ServiceHub AI</>
                }
                {voiceSupported && !isEscalated && (
                  <span className="fcb-foot-voice"> · 🎤 Voice ready</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};