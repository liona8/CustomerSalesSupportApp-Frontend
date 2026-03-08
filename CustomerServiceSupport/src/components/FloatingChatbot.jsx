// src/components/FloatingChatbot.jsx
import { useState, useRef, useEffect } from "react";
import {
  Bot, Lock, User, Send, X, MessageCircle,
  Mic, MicOff, Minus, Headphones, Phone, AlertCircle,
  CheckCircle, Globe, ChevronDown, Paperclip, ImageIcon, XCircle,
} from "lucide-react";
import "../assets/chatbot.css";
import { sendChatMessage } from "../service/chatbot";

// ─────────────────────────────────────────────────────────────
const QUICK_REPLIES = [
  "Check warranty status",
  "Track my service",
  "Speak to an agent",
];

const HANDOFF_PHRASES = [
  "i'll pass you to one of our live agents",
  "saya akan sambungkan anda dengan ejen langsung",
  "someone will be with you shortly",
  "pass you to one of our live agents",
];

const VOICE_LANGUAGES = [
  { code: "en-MY", label: "English (Malaysia)", flag: "🇲🇾", region: "Southeast Asia" },
  { code: "ms-MY", label: "Bahasa Malaysia",     flag: "🇲🇾", region: "Southeast Asia" },
  { code: "zh-CN", label: "中文 (普通话)",        flag: "🇨🇳", region: "East Asia"      },
];

const DEFAULT_LANG  = VOICE_LANGUAGES[0];
const LANG_REGIONS  = [...new Set(VOICE_LANGUAGES.map(l => l.region))];

const LIVE_AGENT = {
  name: "Sara Lim", role: "Customer Support Specialist",
  initials: "SL", phone: "1300-88-5678", color: "#7c3aed",
};

// ── Photo upload constraints ──────────────────────────────────
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE  = 5 * 1024 * 1024;   // 5 MB
const MAX_FILES      = 1;                  // max photos per message

// ─────────────────────────────────────────────────────────────
function getTime() {
  return new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
}
function isHandoffMessage(text = "") {
  return HANDOFF_PHRASES.some(p => text.toLowerCase().includes(p));
}
function formatBytes(b) {
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────
export const FloatingChatbot = ({ isOpen, setIsOpen, initialMessage, clearInitialMessage }) => {

  // ── Chat ──────────────────────────────────────────────────
  const [messages,   setMessages]   = useState([{
    id: 1, from: "bot",
    text: "👋 Hi there! I'm your Fiamma Service customer service assistant. How can I help you today?",
    time: getTime(),
  }]);
  const [input,       setInput]       = useState("");
  const [isTyping,    setIsTyping]    = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [unread,      setUnread]      = useState(0);
  const [minimised,   setMinimised]   = useState(false);
  const [threadId,    setThreadId]    = useState(null);
  const [isEscalated, setIsEscalated] = useState(false);

  // ── Photo upload ──────────────────────────────────────────
  // pendingPhotos: [{ id, file, previewUrl, name, size }]
  const [pendingPhotos,   setPendingPhotos]   = useState([]);
  const [uploadError,     setUploadError]     = useState("");
  const [isDragging,      setIsDragging]      = useState(false);
  const fileInputRef = useRef(null);

  // ── Voice ─────────────────────────────────────────────────
  const [isListening,    setIsListening]    = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError,     setVoiceError]     = useState("");
  const [transcript,     setTranscript]     = useState("");
  const [voiceMode,      setVoiceMode]      = useState(false);

  // ── Language ──────────────────────────────────────────────
  const [selectedLang,   setSelectedLang]   = useState(DEFAULT_LANG);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langSearch,     setLangSearch]     = useState("");

  const endRef         = useRef(null);
  const inputRef       = useRef(null);
  const recognitionRef = useRef(null);
  const langPickerRef  = useRef(null);

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    setVoiceSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    if (isOpen && initialMessage) {
      sendMessage(initialMessage);
      clearInitialMessage?.();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !minimised) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen, minimised]);

  useEffect(() => {
    if (!isOpen || minimised) stopListening();
  }, [isOpen, minimised]);

  useEffect(() => {
    const fn = (e) => {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target)) {
        setShowLangPicker(false); setLangSearch("");
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Revoke object URLs when panel unmounts
  useEffect(() => {
    return () => pendingPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
  }, []);

  // ── Photo handlers ────────────────────────────────────────
  // Upload a single file to blob immediately, return photo_url
  const uploadToBlob = async (file) => {
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/tools/upload-photo`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.photo_urls?.[0] || null;   // returns the blob URL
    } catch (err) {
      console.warn("[BlobUpload] Failed:", err);
      return null;
    }
  };

  // Validate files, add to tray, and immediately upload to blob
  const validateAndAdd = async (files) => {
    setUploadError("");
    const remaining = MAX_FILES - pendingPhotos.length;
    if (remaining <= 0) {
      setUploadError(`Maximum ${MAX_FILES} photos per message.`);
      setTimeout(() => setUploadError(""), 4000);
      return;
    }

    const toProcess = Array.from(files).slice(0, remaining);
    let firstError = "";

    for (const file of toProcess) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        firstError = firstError || `${file.name} is not a supported image type (JPG, PNG, WEBP, GIF).`;
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        firstError = firstError || `${file.name} exceeds the 5 MB limit (${formatBytes(file.size)}).`;
        continue;
      }

      const id         = `${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);

      // Add to tray immediately so user sees it — uploading state
      setPendingPhotos(prev => [...prev, {
        id, file, previewUrl,
        name:     file.name,
        size:     file.size,
        blobUrl:  null,        // null = still uploading
        uploading: true,
      }]);

      // Upload to blob in background
      const blobUrl = await uploadToBlob(file);

      // Update the entry with the real blob URL (or mark as failed)
      setPendingPhotos(prev => prev.map(p =>
        p.id === id
          ? { ...p, blobUrl, uploading: false, failed: !blobUrl }
          : p
      ));

      if (!blobUrl) {
        firstError = firstError || `Failed to upload ${file.name}. Please try again.`;
      }
    }

    if (firstError) {
      setUploadError(firstError);
      setTimeout(() => setUploadError(""), 5000);
    }
  };

  const handleFileInputChange = async (e) => {
    await validateAndAdd(e.target.files);
    e.target.value = ""; // allow re-selecting the same file
  };

  const removePhoto = (id) => {
    setPendingPhotos(prev => {
      const hit = prev.find(p => p.id === id);
      if (hit) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  // Drag-and-drop on the panel
  const handleDragOver  = (e) => { e.preventDefault(); if (!isEscalated) setIsDragging(true); };
  const handleDragLeave = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); };
  const handleDrop      = async (e) => {
    e.preventDefault(); setIsDragging(false);
    if (!isEscalated) await validateAndAdd(e.dataTransfer.files);
  };

  // ── Escalation ────────────────────────────────────────────
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
            `You have my complete attention and I'll personally make sure this gets resolved for you. 😊\n\nHow would you like to proceed?`,
          time: getTime(),
        }]);
      }, 1600);
    }, 800);
  };

  // ── Send message (text + optional photo) ──────────────────────
  const sendMessage = async (text) => {
    if (isEscalated) return;
    const msg    = (text || input).trim();
    const photos = [...pendingPhotos];

    if (!msg && photos.length === 0) return;


    setInput("");
    setTranscript("");
    setShowReplies(false);
    setPendingPhotos([]);

    // Step 1 — Photos already uploaded on attach; collect blob URLs
    const photoData = photos.map(p => ({
      id:      p.id,
      name:    p.name,
      size:    p.size,
      dataUrl: p.blobUrl || p.previewUrl,
    }));
    const blobUrls = photos.map(p => p.blobUrl).filter(Boolean);

    // Step 2 — Build the message text sent to the agent.
    // Append photo URLs inline so the agent can see them directly —
    // same pattern as the reference project.
    let agentText = msg;
    if (blobUrls.length > 0) {
      const photoLines = blobUrls.map(url => `[Photo: ${url}]`).join("\n");
      agentText = msg ? `${msg}\n\n${photoLines}` : photoLines;
    }

    // Step 3 — Show user bubble (display text only, no raw URLs)
    setMessages(m => [...m, {
      id: Date.now(), from: "user",
      text: msg, photos: photoData,
      time: getTime(),
    }]);
    setIsTyping(true);

    // Step 4 — Send to AI agent (agentText includes photo URLs inline)
    try {
      const data = await sendChatMessage(agentText, threadId);
      setThreadId(data.thread_id);
      setIsTyping(false);
      const replyText = data.reply;
      setMessages(m => [...m, { id: Date.now(), from: "bot", text: replyText, time: getTime() }]);
      if (isHandoffMessage(replyText)) triggerEscalation();
    } catch (err) {
      setIsTyping(false);
      console.error("[sendMessage]", err);
      setMessages(m => [...m, {
        id: Date.now(), from: "bot",
        text: "⚠️ Unable to connect to server. Please try again.", time: getTime(),
      }]);
    }
  };

  // ── Voice ─────────────────────────────────────────────────
  const startListening = (lang = selectedLang) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setVoiceError("");
    const r           = new SR();
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
    setSelectedLang(lang); setShowLangPicker(false); setLangSearch("");
    if (isListening) { stopListening(); setTimeout(() => startListening(lang), 300); }
  };

  const filteredLangs = VOICE_LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );
  const groupedLangs = LANG_REGIONS.reduce((acc, region) => {
    const items = filteredLangs.filter(l => l.region === region);
    if (items.length) acc[region] = items;
    return acc;
  }, {});

  // ── Render helpers ────────────────────────────────────────
  const renderText = (t) =>
    t.split("**").map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
  const renderMultiline = (t) =>
    t.split("\n").map((line, i, arr) => (
      <span key={i}>{renderText(line)}{i < arr.length - 1 && <br />}</span>
    ));

  // Must have text. Also block if any photo is still uploading.
  const isUploading = pendingPhotos.some(p => p.uploading);
  const canSend     = input.trim().length > 0 && !isUploading;

  // ─────────────────────────────────────────────────────────
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
        <div
          className={`fcb-panel ${minimised ? "fcb-minimised" : ""} ${isDragging ? "fcb-panel-drag" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag-over overlay */}
          {isDragging && (
            <div className="fcb-drop-overlay">
              <div className="fcb-drop-overlay-inner">
                <ImageIcon size={28} />
                <span>Drop photos here</span>
              </div>
            </div>
          )}

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
                  {/* Language selector */}
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
                        <div className="fcb-lang-dropdown-header">
                          <Globe size={13} /> Voice Input Language
                        </div>
                        <div className="fcb-lang-current">
                          <span className="fcb-lang-current-label">Currently:</span>
                          <span className="fcb-lang-current-val">{selectedLang.flag} {selectedLang.label}</span>
                        </div>
                        <div className="fcb-lang-search-wrap">
                          <input className="fcb-lang-search" placeholder="Search language…"
                            value={langSearch} onChange={e => setLangSearch(e.target.value)} autoFocus />
                        </div>
                        <div className="fcb-lang-list">
                          {Object.keys(groupedLangs).length === 0 ? (
                            <div className="fcb-lang-empty">No results for "{langSearch}"</div>
                          ) : Object.entries(groupedLangs).map(([region, langs]) => (
                            <div key={region}>
                              <div className="fcb-lang-region">{region}</div>
                              {langs.map(lang => (
                                <button key={lang.code}
                                  className={`fcb-lang-option ${selectedLang.code === lang.code ? "fcb-lang-active" : ""}`}
                                  onClick={() => selectLanguage(lang)}>
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

                  {/* Voice mode toggle */}
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
                      Ask anything, or <strong>attach a photo</strong> of your appliance issue.
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

                      {/* ── Photo grid (above text bubble if photos exist) ── */}
                      {msg.photos?.length > 0 && (
                        <div className={`fcb-photo-grid fcb-photo-count-${msg.photos.length}`}>
                          {msg.photos.map(photo => (
                            <a key={photo.id} href={photo.dataUrl} target="_blank" rel="noreferrer"
                              className="fcb-photo-thumb-wrap" title="Click to view full size">
                              <img src={photo.dataUrl} alt={photo.name} className="fcb-photo-thumb" />
                              <div className="fcb-photo-thumb-overlay"><ImageIcon size={14} /></div>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Text bubble — only rendered if there's text */}
                      {msg.text && (
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
                      )}

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

              {/* ── Error toasts (voice + upload share the same bar) ── */}
              {(voiceError || uploadError) && (
                <div className="fcb-voice-error">
                  <AlertCircle size={12} /> {voiceError || uploadError}
                </div>
              )}

              {/* ── Photo preview tray ────────────────────────────── */}
              {pendingPhotos.length > 0 && !isEscalated && (
                <div className="fcb-photo-tray">
                  <div className="fcb-photo-tray-header">
                    <span className="fcb-photo-tray-label">
                      <ImageIcon size={12} /> Photo attached
                    </span>

                  </div>
                  <div className="fcb-photo-tray-items">
                    {pendingPhotos.map(photo => (
                      <div key={photo.id} className={`fcb-tray-item ${photo.failed ? "fcb-tray-item-failed" : ""}`}>
                        <div className="fcb-tray-thumb-wrap">
                          <img src={photo.previewUrl} alt={photo.name} className="fcb-tray-thumb" />
                          {photo.uploading && (
                            <div className="fcb-tray-uploading">
                              <div className="fcb-tray-spinner" />
                            </div>
                          )}
                          {photo.failed && (
                            <div className="fcb-tray-uploading fcb-tray-failed-overlay">
                              <XCircle size={14} />
                            </div>
                          )}
                        </div>
                        <div className="fcb-tray-meta">
                          <span className="fcb-tray-name">{photo.name}</span>
                          <span className="fcb-tray-size">
                            {photo.uploading ? "Uploading…" : photo.failed ? "Upload failed" : formatBytes(photo.size)}
                          </span>
                        </div>
                        <button className="fcb-tray-remove" onClick={() => removePhoto(photo.id)}
                          title="Remove photo">
                          <XCircle size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden file input (shared between text mode + voice mode) */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                multiple
                className="fcb-file-input"
                onChange={handleFileInputChange}
              />

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
                  <div className="fcb-voice-lang-bar">
                    <Globe size={12} />
                    <span className="fcb-voice-lang-label">Speaking in:</span>
                    <button className="fcb-voice-lang-chip"
                      onClick={() => { setShowLangPicker(p => !p); setLangSearch(""); }}>
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
                        <div className="fcb-voice-label">Listening in {selectedLang.flag} {selectedLang.label}…</div>
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
                        <div className="fcb-voice-sublabel">{selectedLang.flag} {selectedLang.label} · change above</div>
                      </div>
                    )}
                  </div>

                  <div className="fcb-voice-type-row">
                    {/* Attach button in voice mode */}
                    <button
                      className={`fcb-attach-btn ${pendingPhotos.length > 0 ? "fcb-attach-active" : ""}`}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={pendingPhotos.length >= MAX_FILES}
                      title={`Attach photo (${pendingPhotos.length}/${MAX_FILES})`}
                    >
                      <Paperclip size={15} />
                      {pendingPhotos.length > 0 && (
                        <span className="fcb-attach-count">{pendingPhotos.length}</span>
                      )}
                    </button>
                    <input
                      className="fcb-input fcb-voice-input"
                      placeholder={pendingPhotos.length ? "Describe the issue in the photo…" : "Or type here…"}
                      value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()} />
                    <button className={`fcb-send ${canSend ? "active" : ""}`}
                      onClick={() => sendMessage()} disabled={!canSend}>
                      <Send size={14} />
                    </button>
                  </div>
                </div>

              ) : (
                /* ── Text mode input ── */
                <div className="fcb-input-area">
                  {/* Attach button */}
                  <button
                    className={`fcb-attach-btn ${pendingPhotos.length > 0 ? "fcb-attach-active" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={pendingPhotos.length >= MAX_FILES}
                    title={`Attach photo (max ${MAX_FILES}, up to 5 MB each). JPG, PNG, WEBP, GIF`}
                  >
                    <Paperclip size={15} />
                    {pendingPhotos.length > 0 && (
                      <span className="fcb-attach-count">{pendingPhotos.length}</span>
                    )}
                  </button>

                  <input ref={inputRef}
                    className="fcb-input"
                    placeholder={
                      pendingPhotos.length
                        ? "Describe the issue in the photo…"
                        : "Type a message or attach a photo…"
                    }
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

                  <button className={`fcb-send ${canSend ? "active" : ""}`}
                    onClick={() => sendMessage()} disabled={!canSend}>
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