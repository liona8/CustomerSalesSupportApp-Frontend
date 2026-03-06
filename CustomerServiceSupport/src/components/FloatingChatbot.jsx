// src/components/FloatingChatbot.jsx
import { useState, useRef, useEffect } from "react";
import {
  Bot, Lock, User, Send, X, MessageCircle,
  Mic, MicOff, Minus, Headphones, Phone, AlertCircle,
  CheckCircle, Globe, ChevronDown,
} from "lucide-react";
import "../assets/chatbot.css";
import { sendChatMessage } from "../service/chatbot";

// ── Quick reply chips shown on first load ─────────────────────
const QUICK_REPLIES = [
  "Check warranty status",
  "Track my service",
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

const VOICE_LANGUAGES = [
  { code: "en-MY", label: "English (Malaysia)",   flag: "🇲🇾", region: "Southeast Asia" },
  { code: "ms-MY", label: "Bahasa Malaysia",       flag: "🇲🇾", region: "Southeast Asia" },
  { code: "zh-CN", label: "中文 (普通话)",          flag: "🇨🇳", region: "East Asia" },
  { code: "zh-TW", label: "中文 (繁體)",            flag: "🇹🇼", region: "East Asia" }
];

const DEFAULT_LANG = VOICE_LANGUAGES[0]; // en-MY

// ── Live agent persona (swap with real data from your backend) ─
const LIVE_AGENT = {
  name:     "Sara Lim",
  role:     "Customer Support Specialist",
  initials: "SL",
  phone:    "1300-88-5678",
  color:    "#7c3aed",
};

function getTime() {
  return new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
}

function isHandoffMessage(text = "") {
  return HANDOFF_PHRASES.some(phrase =>
    text.toLowerCase().includes(phrase)
  );
}

const LANG_REGIONS = [...new Set(VOICE_LANGUAGES.map(l => l.region))];

export const FloatingChatbot = ({ isOpen, setIsOpen }) => {
  const [messages,    setMessages]   = useState([{
    id: 1, from: "bot",
    text: "👋 Hi there! I'm your Fiamma Service customer service assistant. How can I help you today?",
    time: getTime(),
  }]);
  const [input,        setInput]        = useState("");
  const [isTyping,     setIsTyping]     = useState(false);
  const [showReplies,  setShowReplies]  = useState(true);
  const [unread,       setUnread]       = useState(0);
  const [minimised,    setMinimised]    = useState(false);
  const [threadId,     setThreadId]     = useState(null);
  const [isEscalated,  setIsEscalated]  = useState(false);

  // Voice
  const [isListening,    setIsListening]    = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError,     setVoiceError]     = useState("");
  const [transcript,     setTranscript]     = useState("");
  const [voiceMode,      setVoiceMode]      = useState(false);

  // Language
  const [selectedLang,   setSelectedLang]   = useState(DEFAULT_LANG);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langSearch,     setLangSearch]     = useState("");

  const endRef         = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);
  const langPickerRef  = useRef(null);

  // ── Effects ────────────────────────────────────────────────
  useEffect(() => {
    setVoiceSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnread(0); setMinimised(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !minimised) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen, minimised]);

  useEffect(() => {
    if (!isOpen || minimised) stopListening();
  }, [isOpen, minimised]);

  // Close picker on outside click
  useEffect(() => {
    const fn = (e) => {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target)) {
        setShowLangPicker(false); setLangSearch("");
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Escalation ─────────────────────────────────────────────
  const triggerEscalation = () => {
    setIsEscalated(true); setShowReplies(false);
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(m => [...m, {
          id: Date.now(), from: "agent", isHandoffIntro: true,
          text:
            `Hi, I'm ${LIVE_AGENT.name} — ${LIVE_AGENT.role} at Fiamma Customer Service. ` +
            `I've reviewed your conversation and fully understand the issue you're facing. ` +
            `You have my complete attention and I'll personally make sure this gets resolved for you. 😊\n\n` +
            `How would you like to proceed?`,
          time: getTime(),
        }]);
      }, 1600);
    }, 800);
  };

  // ── Send message ───────────────────────────────────────────
  const sendMessage = async (text) => {
    if (isEscalated) return;
    const msg = (text || input).trim();
    if (!msg) return;
    setInput(""); setTranscript(""); setShowReplies(false);
    setMessages(m => [...m, { id: Date.now(), from: "user", text: msg, time: getTime() }]);
    setIsTyping(true);
    try {
      const data = await sendChatMessage(msg, threadId);
      setThreadId(data.thread_id); setIsTyping(false);
      const replyText = data.reply;
      setMessages(m => [...m, { id: Date.now(), from: "bot", text: replyText, time: getTime() }]);
      if (isHandoffMessage(replyText)) triggerEscalation();
    } catch {
      setIsTyping(false);
      setMessages(m => [...m, { id: Date.now(), from: "bot", text: "⚠️ Unable to connect to server.", time: getTime() }]);
    }
  };

  // ── Voice recognition ──────────────────────────────────────
  const startListening = (lang = selectedLang) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setVoiceError("");
    const r            = new SR();
    r.lang            = lang.code;
    r.continuous      = false;
    r.interimResults  = true;
    r.maxAlternatives = 1;

    r.onstart  = () => { setIsListening(true); setTranscript(""); };
    r.onend    = () => setIsListening(false);
    r.onresult = (e) => {
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
    r.onerror = (e) => {
      setIsListening(false);
      const m = {
        "not-allowed": "Microphone access denied. Please allow mic in browser settings.",
        "no-speech":   "No speech detected. Please try again.",
        "network":     "Network error. Check your connection.",
      };
      setVoiceError(m[e.error] || "Voice input error. Please try again.");
      setTimeout(() => setVoiceError(""), 5000);
    };
    recognitionRef.current = r;
    r.start();
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  };

  const toggleVoice = () => isListening ? stopListening() : startListening(selectedLang);

  const selectLanguage = (lang) => {
    setSelectedLang(lang);
    setShowLangPicker(false);
    setLangSearch("");
    if (isListening) { stopListening(); setTimeout(() => startListening(lang), 300); }
  };

  const filteredLangs = VOICE_LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  // Group filtered results by region
  const groupedLangs = LANG_REGIONS.reduce((acc, region) => {
    const items = filteredLangs.filter(l => l.region === region);
    if (items.length) acc[region] = items;
    return acc;
  }, {});

  // Render helpers
  const renderText = (t) => t.split("**").map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
  const renderMultiline = (t) => t.split("\n").map((line, i, arr) => (
    <span key={i}>{renderText(line)}{i < arr.length - 1 && <br />}</span>
  ));

  // ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* FAB */}
      <button className={`fcb-trigger ${isOpen ? "fcb-open" : ""}`}
        onClick={() => { setIsOpen(!isOpen); setUnread(0); }} aria-label="Chat with us">
        <div className="fcb-trigger-icon">{isOpen ? <X size={22} /> : <MessageCircle size={22} />}</div>
        {!isOpen && unread > 0 && <span className="fcb-unread">{unread}</span>}
        {!isOpen && <span className="fcb-pulse" />}
      </button>

      {!isOpen && <div className="fcb-label-pill"><Bot size={12} /> Chat with us</div>}

      {isOpen && (
        <div className={`fcb-panel ${minimised ? "fcb-minimised" : ""}`}>

          {/* ── Header ── */}
          <div className={`fcb-header ${isEscalated ? "fcb-header-agent" : ""}`}>
            <div className="fcb-header-left">
              {isEscalated ? (
                <>
                  <div className="fcb-avatar-wrap">
                    <div className="fcb-avatar fcb-avatar-human" style={{ background: LIVE_AGENT.color }}>
                      <span className="fcb-initials">{LIVE_AGENT.initials}</span>
                    </div>
                    <span className="fcb-avatar-dot fcb-avatar-dot-live" />
                  </div>
                  <div>
                    <div className="fcb-name">{LIVE_AGENT.name}</div>
                    <div className="fcb-status"><span className="fcb-online-dot" /> Live Agent · {LIVE_AGENT.role}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="fcb-avatar-wrap">
                    <div className="fcb-avatar"><Bot size={17} /></div>
                    <span className="fcb-avatar-dot" />
                  </div>
                  <div>
                    <div className="fcb-name">Fiamma Customer Guardian AI</div>
                    <div className="fcb-status"><span className="fcb-online-dot" /> Online now</div>
                  </div>
                </>
              )}
            </div>

            <div className="fcb-header-btns">
              {voiceSupported && !minimised && !isEscalated && (
                <>
                  {/* ── Language selector ─────────────── */}
                  <div className="fcb-lang-wrap" ref={langPickerRef}>
                    <button
                      className={`fcb-hbtn fcb-lang-btn ${showLangPicker ? "fcb-voice-mode-on" : ""}`}
                      onClick={() => { setShowLangPicker(p => !p); setLangSearch(""); }}
                      title={`Voice language: ${selectedLang.label}`}
                    >
                      <span className="fcb-lang-flag-sm">{selectedLang.flag}</span>
                      <ChevronDown size={10} style={{ transition: "transform 0.2s", transform: showLangPicker ? "rotate(180deg)" : "none" }} />
                    </button>

                    {showLangPicker && (
                      <div className="fcb-lang-dropdown">
                        {/* Dropdown header */}
                        <div className="fcb-lang-dropdown-header">
                          <Globe size={13} /> Voice Input Language
                        </div>

                        {/* Currently selected */}
                        <div className="fcb-lang-current">
                          <span className="fcb-lang-current-label">Currently:</span>
                          <span className="fcb-lang-current-val">
                            {selectedLang.flag} {selectedLang.label}
                          </span>
                        </div>

                        {/* Search */}
                        <div className="fcb-lang-search-wrap">
                          <input
                            className="fcb-lang-search"
                            placeholder="Search language…"
                            value={langSearch}
                            onChange={e => setLangSearch(e.target.value)}
                            autoFocus
                          />
                        </div>

                        {/* Grouped list */}
                        <div className="fcb-lang-list">
                          {Object.keys(groupedLangs).length === 0 ? (
                            <div className="fcb-lang-empty">No results for "{langSearch}"</div>
                          ) : Object.entries(groupedLangs).map(([region, langs]) => (
                            <div key={region}>
                              <div className="fcb-lang-region">{region}</div>
                              {langs.map(lang => (
                                <button
                                  key={lang.code}
                                  className={`fcb-lang-option ${selectedLang.code === lang.code ? "fcb-lang-active" : ""}`}
                                  onClick={() => selectLanguage(lang)}
                                >
                                  <span className="fcb-lang-flag">{lang.flag}</span>
                                  <div className="fcb-lang-text">
                                    <span className="fcb-lang-label">{lang.label}</span>
                                    <span className="fcb-lang-code">{lang.code}</span>
                                  </div>
                                  {selectedLang.code === lang.code && <CheckCircle size={13} className="fcb-lang-check" />}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Voice mode toggle ──────────────── */}
                  <button
                    className={`fcb-hbtn fcb-voice-mode-btn ${voiceMode ? "fcb-voice-mode-on" : ""}`}
                    onClick={() => { setVoiceMode(m => !m); if (isListening) stopListening(); }}
                    title={voiceMode ? "Switch to text mode" : "Switch to voice mode"}
                  >
                    <Mic size={14} />
                  </button>
                </>
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
              {/* ── Messages ── */}
              <div className="fcb-messages">
                <div className="fcb-welcome-banner">
                  <div className="fcb-welcome-icon"><Headphones size={18} /></div>
                  <div>
                    <div className="fcb-welcome-title">We're here to help</div>
                    <div className="fcb-welcome-sub">
                      Ask anything about your appliance, warranty, or service.
                      {voiceSupported && <span className="fcb-voice-hint"> 🎤 {selectedLang.flag} Voice ready.</span>}
                    </div>
                  </div>
                </div>

                {messages.map(msg => (
                  <div key={msg.id} className={`fcb-row ${msg.from === "user" ? "fcb-right" : "fcb-left"}`}>
                    {msg.from === "bot"   && <div className="fcb-bot-av"><Bot size={11} /></div>}
                    {msg.from === "agent" && (
                      <div className="fcb-agent-av" style={{ background: LIVE_AGENT.color }}>
                        <span>{LIVE_AGENT.initials}</span>
                      </div>
                    )}
                    <div className="fcb-col">
                      {msg.from === "agent" && (
                        <div className="fcb-agent-name-tag">
                          <span className="fcb-agent-live-dot" />{LIVE_AGENT.name} · Live Agent
                        </div>
                      )}
                      <div className={`fcb-bubble ${
                        msg.from === "user"  ? "fcb-bubble-u"     :
                        msg.from === "agent" ? "fcb-bubble-agent" : "fcb-bubble-b"
                      }`}>
                        {msg.voice && (
                          <span className="fcb-voice-tag">
                            <Mic size={8} /> {msg.voiceLang || selectedLang.flag}
                          </span>
                        )}
                        {renderMultiline(msg.text)}
                      </div>
                      {msg.isHandoffIntro && (
                        <div className="fcb-handoff-actions">
                          <a href={`tel:${LIVE_AGENT.phone.replace(/-/g,"")}`} className="fcb-call-btn">
                            <Phone size={14} /> Call {LIVE_AGENT.name} · {LIVE_AGENT.phone}
                          </a>
                          <div className="fcb-handoff-hint">
                            <CheckCircle size={10} />
                            Or keep chatting — {LIVE_AGENT.name.split(" ")[0]} is reading this conversation.
                          </div>
                        </div>
                      )}
                      <div className="fcb-time">{msg.time}</div>
                    </div>
                    {msg.from === "user" && <div className="fcb-user-av"><User size={11} /></div>}
                  </div>
                ))}

                {isTyping && (
                  <div className="fcb-row fcb-left">
                    {isEscalated
                      ? <div className="fcb-agent-av" style={{ background: LIVE_AGENT.color }}><span>{LIVE_AGENT.initials}</span></div>
                      : <div className="fcb-bot-av"><Bot size={11} /></div>}
                    <div className="fcb-typing"><span /><span /><span /></div>
                  </div>
                )}

                {showReplies && !isTyping && !voiceMode && !isEscalated && (
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

              {voiceError && (
                <div className="fcb-voice-error"><AlertCircle size={12} /> {voiceError}</div>
              )}

              {/* ── Input area ── */}
              {isEscalated ? (
                <div className="fcb-escalated-bar">
                  <div className="fcb-escalated-icon"><Phone size={13} /></div>
                  <div className="fcb-escalated-text">
                    <strong>{LIVE_AGENT.name}</strong> has taken over this chat.
                    <span> Call or keep chatting above.</span>
                  </div>
                </div>

              ) : voiceMode ? (
                <div className="fcb-voice-panel">
                  {/* Language bar inside voice mode */}
                  <div className="fcb-voice-lang-bar">
                    <Globe size={12} />
                    <span className="fcb-voice-lang-label">Speaking in:</span>
                    <button
                      className="fcb-voice-lang-chip"
                      onClick={() => { setShowLangPicker(p => !p); setLangSearch(""); }}
                    >
                      {selectedLang.flag} {selectedLang.label}
                      <ChevronDown size={11} style={{ marginLeft: 4 }} />
                    </button>
                  </div>

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
                        <div className="fcb-voice-label">
                          Listening in {selectedLang.flag} {selectedLang.label}…
                        </div>
                        {transcript && (
                          <div className="fcb-transcript">
                            <span className="fcb-transcript-text">"{transcript}"</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="fcb-idle-state">
                        <button className="fcb-mic-btn" onClick={() => startListening(selectedLang)}>
                          <Mic size={22} />
                        </button>
                        <div className="fcb-voice-label">Tap to speak</div>
                        <div className="fcb-voice-sublabel">
                          {selectedLang.flag} {selectedLang.label} · change above
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="fcb-voice-type-row">
                    <input className="fcb-input fcb-voice-input" placeholder="Or type here…"
                      value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()} />
                    <button className={`fcb-send ${input.trim() ? "active" : ""}`}
                      onClick={() => sendMessage()} disabled={!input.trim()}>
                      <Send size={14} />
                    </button>
                  </div>
                </div>

              ) : (
                <div className="fcb-input-area">
                  <input ref={inputRef} className="fcb-input" placeholder="Type a message..."
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()} />
                  {voiceSupported && (
                    <button
                      className={`fcb-inline-mic ${isListening ? "fcb-inline-mic-active" : ""}`}
                      onClick={toggleVoice}
                      title={isListening ? `Stop (${selectedLang.label})` : `Speak in ${selectedLang.label}`}
                    >
                      {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                    </button>
                  )}
                  <button className={`fcb-send ${input.trim() ? "active" : ""}`}
                    onClick={() => sendMessage()} disabled={!input.trim()}>
                    <Send size={14} />
                  </button>
                </div>
              )}

              {/* Listening strip (text mode) */}
              {isListening && !voiceMode && !isEscalated && (
                <div className="fcb-listening-strip">
                  <div className="fcb-strip-bars"><span /><span /><span /><span /><span /></div>
                  <span className="fcb-strip-lang-badge">{selectedLang.flag}</span>
                  <span className="fcb-strip-text">
                    {transcript ? `"${transcript}"` : `Listening in ${selectedLang.label}…`}
                  </span>
                  <button className="fcb-strip-stop" onClick={stopListening}><X size={10} /></button>
                </div>
              )}

              <div className="fcb-foot">
                <Lock size={10} />
                {isEscalated
                  ? <> Secured · Now with <strong>{LIVE_AGENT.name}</strong></>
                  : <> Encrypted &amp; private · Fiamma AI</>}
                {voiceSupported && !isEscalated && (
                  <span className="fcb-foot-voice"> · 🎤 {selectedLang.flag} {selectedLang.label}</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};