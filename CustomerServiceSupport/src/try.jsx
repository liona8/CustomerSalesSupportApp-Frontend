import { useState, useRef, useEffect } from "react";
import {
  Headphones, Search, ChevronDown, MessageCircle, Phone, Mail,
  Globe, Zap, CheckCircle, Package, Wrench, Star, Shield,
  ArrowRight, ThumbsUp, ThumbsDown, Bot, User, Send, X,
  Clock, Info, AlertCircle, Hash, ChevronRight, Wifi,
  RefreshCw, FileText, Settings, HelpCircle, LifeBuoy,
  Truck, CreditCard, Lock, BookOpen, SlidersHorizontal,
  Wind, Thermometer, Droplets, ChevronLeft, ShoppingCart,
  Heart, Eye, Award, Layers, Tag, BarChart2, Minus, Plus as PlusIcon
} from "lucide-react";

// ─── FAQ DATA ────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  { id: "all", label: "All Topics", icon: BookOpen, count: 16 },
  { id: "warranty", label: "Warranty", icon: Shield, count: 4 },
  { id: "repair", label: "Repair & Service", icon: Wrench, count: 5 },
  { id: "parts", label: "Spare Parts", icon: Package, count: 3 },
  { id: "tracking", label: "Track Request", icon: Truck, count: 2 },
  { id: "billing", label: "Billing", icon: CreditCard, count: 2 },
];

const FAQS = [
  {
    id: 1, category: "warranty",
    question: "How do I check if my product is still under warranty?",
    answer: "You can check your warranty status by entering your serial number on our warranty portal. Alternatively, refer to your original purchase receipt — standard warranty covers 1 year for parts and 2 years for the compressor (applicable to AC units).",
    steps: ["Locate your serial number on the product label (usually at the back or bottom)", "Visit the warranty checker on our website", "Enter your serial number and purchase date", "Your warranty status and expiry will be displayed instantly"]
  },
  {
    id: 2, category: "warranty",
    question: "What is covered under the standard warranty?",
    answer: "Our standard warranty covers manufacturing defects and component failures under normal usage conditions. It does not cover physical damage, water damage, improper installation, or consumable parts.",
    steps: null
  },
  {
    id: 3, category: "repair",
    question: "My washing machine shows Error Code E3 — what does it mean?",
    answer: "Error E3 typically indicates a motor or drum bearing issue. This requires a technician inspection. Do not attempt to force-start the machine as it may worsen the damage.",
    steps: ["Power off the machine and unplug it", "Wait 10 minutes, then restart", "If E3 persists, do NOT restart again", "Submit a service request through this portal", "A technician will be scheduled within 24–48 hours"]
  },
  {
    id: 4, category: "repair",
    question: "My air conditioner is not cooling. What should I check?",
    answer: "Before requesting a technician, try these basic checks to resolve the issue without a service call.",
    steps: ["Check that the set temperature is lower than room temperature", "Clean or replace the air filter (dusty filters reduce cooling by 30%)", "Ensure all room doors and windows are closed", "Check if the outdoor unit fan is spinning", "If none of these help, submit a repair request"]
  },
  {
    id: 5, category: "repair",
    question: "How do I request a home repair service?",
    answer: "You can request a home service visit by submitting a support ticket on this portal. You'll need your product serial number and a description of the issue. A technician will be assigned within 1–2 working days.",
    steps: null
  },
  {
    id: 6, category: "parts",
    question: "How long does it take for spare parts to arrive?",
    answer: "Spare part availability varies by model. Common parts are usually in stock and delivered to the technician within 2–3 working days. Rare parts may take 7–14 working days. You'll receive real-time status updates via SMS and email.",
    steps: null
  },
  {
    id: 7, category: "parts",
    question: "Can I purchase spare parts directly?",
    answer: "Spare parts are available through our authorised service centres and selected dealers. For safety and warranty compliance, we recommend installation by our certified technicians.",
    steps: null
  },
  {
    id: 8, category: "tracking",
    question: "How do I track my service request status?",
    answer: "You can track your service ticket status by entering your ticket number or serial number in the tracking section. You'll see real-time updates from submission to job completion.",
    steps: ["Go to 'Track My Request' on the menu", "Enter your Ticket ID (e.g. TK-2841) or Serial Number", "View current status, assigned technician, and expected date"]
  },
  {
    id: 9, category: "billing",
    question: "Will there be any charges for a warranty repair?",
    answer: "No — if your product is within the warranty period and the issue is covered under warranty terms, there are no charges for parts or labour. You may be charged for services outside warranty scope.",
    steps: null
  },
  {
    id: 10, category: "billing",
    question: "What payment methods are accepted for out-of-warranty repairs?",
    answer: "We accept cash, credit/debit card, online banking (FPX), and e-wallets (Touch 'n Go, GrabPay, Boost) at the time of service completion.",
    steps: null
  },
];

// ─── APP ──────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div>
      <link rel="stylesheet" href="style.css" />
      <Header activePage={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} openChat={() => setChatOpen(true)} />}
      {page === "products" && <ProductsPage setPage={setPage} />}
      {page === "support" && <SupportPage openChat={() => setChatOpen(true)} />}
      {page === "track" && <TrackPage />}
      <Footer setPage={setPage} />
      <FloatingChatbot isOpen={chatOpen} setIsOpen={setChatOpen} />
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────
function Header({ activePage, setPage }) {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="nav-logo" onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
            <div className="nav-logo-icon">
              <Headphones size={18} />
            </div>
            <span className="nav-logo-text">Service<span>Hub</span></span>
          </div>

          <div className="nav-links">
            {[
              { id: "home", label: "Home" },
              { id: "products", label: "Products" },
              { id: "support", label: "Support & FAQ" },
              { id: "track", label: "Track Request" },
            ].map(item => (
              <button
                key={item.id}
                className={`nav-link ${activePage === item.id ? "active" : ""}`}
                onClick={() => setPage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="nav-actions">
            <button className="btn-outline">Sign In</button>
            <button className="btn-primary" onClick={() => setPage("support")}>
              <MessageCircle size={14} /> Get Support
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────
function HomePage({ setPage, openChat }) {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow animate-in">
                <Zap size={12} /> Fast. Reliable. Human-first.
              </div>
              <h1 className="hero-title animate-in animate-in-delay-1">
                Your appliance,<br />
                <em>always taken care of</em>
              </h1>
              <p className="hero-subtitle animate-in animate-in-delay-2">
                Get instant support, track your service request, and chat with our team — all in one place. No hold music, no runaround.
              </p>
              <div className="hero-ctas animate-in animate-in-delay-3">
                <button className="btn-primary large" onClick={openChat}>
                  <LifeBuoy size={18} /> Get Help Now
                </button>
                <button className="btn-outline large" onClick={() => setPage("track")} style={{ padding: "13px 24px", fontSize: 16, borderRadius: 12 }}>
                  Track My Request
                </button>
              </div>
              <div className="hero-stats animate-in">
                {[
                  { value: "< 2h", label: "Avg Response" },
                  { value: "98%", label: "Issue Resolved" },
                  { value: "4.8★", label: "Satisfaction" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="hero-stat-value">{s.value}</div>
                    <div className="hero-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-card-stack">
                {/* Back card */}
                <div className="hero-card hero-card-back">
                  <div className="hero-card-tag tag-orange"><Package size={9} /> Spare Part Update</div>
                  <div className="hero-card-title">Drum Motor Shipped</div>
                  <div className="hero-card-sub">Expected: Tomorrow, 9 AM</div>
                </div>
                {/* Main card */}
                <div className="hero-card hero-card-main">
                  <div className="hero-card-tag tag-blue"><Wrench size={9} /> TK-2841 · In Progress</div>
                  <div className="hero-card-title">WM-7800 Washing Machine</div>
                  <div className="hero-card-sub">Ahmad Razif · SN-WM2024-001</div>
                  {[
                    { label: "Diagnosis", pct: "fill-green" },
                    { label: "Parts Ordered", pct: "fill-orange" },
                    { label: "SLA", pct: "fill-blue" },
                  ].map((b, i) => (
                    <div key={i}>
                      <div className="hero-card-bar-label">
                        <span>{b.label}</span>
                        <span>{b.pct === "fill-green" ? "Done" : b.pct === "fill-orange" ? "45%" : "90%"}</span>
                      </div>
                      <div className="hero-card-bar">
                        <div className={`hero-card-bar-fill ${b.pct}`} />
                      </div>
                    </div>
                  ))}
                  <div className="hero-card-footer">
                    <div className="avatar-stack">
                      {["#3b82f6", "#10b981", "#f59e0b"].map((c, i) => (
                        <div key={i} className="avatar-xs" style={{ background: c }}>{["SL","RK","AI"][i]}</div>
                      ))}
                    </div>
                    <span>Sara + 2 assigned</span>
                    <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: "#22c55e" }}>
                      <CheckCircle size={11} /> On track
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="text-center">
            <div className="section-label"><Star size={12} /> What We Offer</div>
            <h2 className="section-title">Everything you need, all in one place</h2>
            <p className="section-subtitle" style={{ margin: "0 auto" }}>
              From quick troubleshooting to full repair management — we've got every step covered.
            </p>
          </div>
          <div className="services-grid">
            {[
              { icon: HelpCircle, color: "icon-blue", title: "Smart FAQ", desc: "Search hundreds of solved issues. Get step-by-step fixes before calling us.", action: () => {} },
              { icon: MessageCircle, color: "icon-orange", title: "Live Chat Support", desc: "Connect with a real agent or AI assistant instantly, 7 days a week.", action: () => {} },
              { icon: Truck, color: "icon-teal", title: "Track Your Service", desc: "Real-time updates from ticket creation to job completion.", action: () => {} },
              { icon: Shield, color: "icon-green", title: "Warranty Check", desc: "Instantly verify your product warranty status with your serial number.", action: () => {} },
              { icon: Package, color: "icon-purple", title: "Spare Parts Status", desc: "Know exactly when your part will arrive. No more guessing.", action: () => {} },
              { icon: Star, color: "icon-rose", title: "Compensation Centre", desc: "Long waits or unresolved issues? Apply for vouchers or exchanges.", action: () => {} },
            ].map((s, i) => (
              <div key={i} className="service-card" onClick={s.action}>
                <div className={`service-icon ${s.color}`}><s.icon size={22} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="arrow">Learn more <ArrowRight size={12} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── SUPPORT / FAQ PAGE ───────────────────────────────────────
function SupportPage({ openChat }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);
  const [votes, setVotes] = useState({});

  const filtered = FAQS.filter(faq => {
    const matchCat = activeCategory === "all" || faq.category === activeCategory;
    const matchSearch = !searchQuery || faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const highlight = (text) => {
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase()
        ? <mark key={i} className="faq-highlight">{part}</mark>
        : part
    );
  };

  return (
    <>
      {/* Page Hero */}
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-label">Support Centre</div>
          <h1 className="page-hero-title">How can we <em>help you today?</em></h1>
          <p className="page-hero-sub">Search our knowledge base or browse by category. If you still need help, our team is ready to chat.</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="faq-search-wrapper">
        <div className="faq-search-box">
          <Search size={18} className="faq-search-icon" />
          <input
            className="faq-search-input"
            placeholder="Describe your issue, e.g. 'washing machine not spinning' or 'error E3'..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); }}
            onKeyDown={e => e.key === "Enter" && setSearchQuery(e.target.value)}
          />
          <button className="faq-search-btn" onClick={() => setHasSearched(true)}>
            <Search size={14} /> Search
          </button>
        </div>
      </div>

      {/* FAQ Body */}
      <section className="section-sm">
        <div className="container">
          <div className="faq-layout">
            {/* Categories */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10, padding: "0 4px" }}>
                Browse Topics
              </div>
              <div className="faq-categories">
                {FAQ_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`faq-cat-btn ${activeCategory === cat.id ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <div className="faq-cat-icon"><cat.icon size={13} /></div>
                    {cat.label}
                    <span className="faq-cat-count">{cat.count}</span>
                  </button>
                ))}
              </div>

              {/* Contact Quick Links */}
              <div style={{ marginTop: 28, padding: "16px", background: "var(--brand-light)", borderRadius: 12, border: "1px solid rgba(29,95,179,0.15)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", marginBottom: 10 }}>Still need help?</div>
                {[
                  { icon: MessageCircle, label: "Chat with us", sub: "Available now", action: openChat },
                  { icon: Phone, label: "1300-88-XXXX", sub: "Mon–Sat, 9am–6pm", action: null },
                  { icon: Mail, label: "support@hub.com", sub: "Reply in 4 hours", action: null },
                ].map((c, i) => (
                  <div key={i} onClick={c.action || undefined}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(29,95,179,0.1)" : "none", cursor: c.action ? "pointer" : "default" }}>
                    <c.icon size={14} color="var(--brand)" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{c.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div>
              <div className="faq-results-header">
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Fraunces', serif", marginBottom: 2 }}>
                    {searchQuery ? `Results for "${searchQuery}"` : FAQ_CATEGORIES.find(c => c.id === activeCategory)?.label}
                  </div>
                  <div className="faq-results-count">{filtered.length} article{filtered.length !== 1 ? "s" : ""} found</div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="faq-no-result">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <h3>No results found for "{searchQuery}"</h3>
                  <p>We couldn't find an article matching your search. Our support team can help you directly — just start a chat below.</p>
                  <div className="faq-cta-options">
                    <div className="faq-cta-card" onClick={openChat}>
                      <div className="faq-cta-card-icon icon-blue"><MessageCircle size={18} /></div>
                      <div>
                        <div className="faq-cta-card-label">Live Chat</div>
                        <div className="faq-cta-card-sub">Chat with an agent now</div>
                      </div>
                    </div>
                    <div className="faq-cta-card">
                      <div className="faq-cta-card-icon icon-teal"><Phone size={18} /></div>
                      <div>
                        <div className="faq-cta-card-label">Call Us</div>
                        <div className="faq-cta-card-sub">1300-88-XXXX</div>
                      </div>
                    </div>
                    <div className="faq-cta-card">
                      <div className="faq-cta-card-icon icon-orange"><Mail size={18} /></div>
                      <div>
                        <div className="faq-cta-card-label">Email Support</div>
                        <div className="faq-cta-card-sub">Reply in 4 hours</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {filtered.map(faq => (
                    <div key={faq.id} className={`faq-item ${openFaq === faq.id ? "open" : ""}`}>
                      <div className="faq-question" onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}>
                        <span className="faq-question-text">{highlight(faq.question)}</span>
                        <ChevronDown size={16} className="faq-chevron" />
                      </div>
                      <div className="faq-answer">
                        <p>{highlight(faq.answer)}</p>
                        {faq.steps && (
                          <ul className="faq-answer-steps">
                            {faq.steps.map((step, i) => (
                              <li key={i}>
                                <span className="step-num">{i + 1}</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="faq-feedback">
                          <span>Was this helpful?</span>
                          <button className="faq-vote-btn" onClick={() => setVotes(v => ({ ...v, [faq.id]: "up" }))}
                            style={votes[faq.id] === "up" ? { background: "var(--brand-light)", color: "var(--brand)", borderColor: "var(--brand)" } : {}}>
                            <ThumbsUp size={11} /> Yes
                          </button>
                          <button className="faq-vote-btn" onClick={() => setVotes(v => ({ ...v, [faq.id]: "down" }))}
                            style={votes[faq.id] === "down" ? { background: "#fff5f5", color: "#ef4444", borderColor: "#ef4444" } : {}}>
                            <ThumbsDown size={11} /> No
                          </button>
                          {votes[faq.id] === "down" && (
                            <button
                              className="faq-vote-btn"
                              style={{ marginLeft: "auto", borderColor: "var(--accent)", color: "var(--accent)", fontWeight: 600 }}
                              onClick={openChat}
                            >
                              <MessageCircle size={11} /> Start a Chat
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Bottom CTA */}
                  <div className="faq-bottom-cta mt-24">
                    <div style={{ fontSize: 22, marginBottom: 8 }}>💬</div>
                    <h3 style={{ fontSize: 18, fontFamily: "'Fraunces', serif", marginBottom: 8 }}>
                      Didn't find what you were looking for?
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
                      Our support team is online and ready to help. Chat with us or raise a ticket.
                    </p>
                    <div className="faq-cta-options">
                      <div className="faq-cta-card" onClick={openChat}>
                        <div className="faq-cta-card-icon icon-blue"><MessageCircle size={18} /></div>
                        <div>
                          <div className="faq-cta-card-label">Chat with Support</div>
                          <div className="faq-cta-card-sub">Usually replies in minutes</div>
                        </div>
                      </div>
                      <div className="faq-cta-card">
                        <div className="faq-cta-card-icon icon-orange"><Phone size={18} /></div>
                        <div>
                          <div className="faq-cta-card-label">1300-88-XXXX</div>
                          <div className="faq-cta-card-sub">Mon–Sat, 9am–6pm</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── FLOATING CHATBOT ─────────────────────────────────────────
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

function FloatingChatbot({ isOpen, setIsOpen }) {
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

// ─── PRODUCT DATA ─────────────────────────────────────────────
const PRODUCTS = [
  {
    id: "WM-7800", name: "FrontLoad Pro 7800", category: "washing-machine",
    tagline: "Intelligent wash, gentle on every fabric",
    price: "RM 2,499", oldPrice: "RM 2,899", badge: "Best Seller",
    rating: 4.8, reviews: 324, inStock: true,
    color: "icon-blue",
    specs: { capacity: "8 kg", energy: "5-Star", noise: "42 dB", programs: "16", spin: "1400 RPM" },
    features: ["AI Fabric Sensor", "Steam Wash", "Self-Clean Drum", "Wi-Fi Control", "Child Lock"],
    warranty: "2 Years (Parts & Labour)",
    image: "🫧",
  },
  {
    id: "WM-5500", name: "TopLoad Eco 5500", category: "washing-machine",
    tagline: "Economical, reliable, everyday performance",
    price: "RM 1,299", oldPrice: null, badge: "New",
    rating: 4.5, reviews: 187, inStock: true,
    color: "icon-teal",
    specs: { capacity: "7 kg", energy: "4-Star", noise: "48 dB", programs: "10", spin: "1200 RPM" },
    features: ["Fuzzy Logic", "Soak Mode", "Gentle Drum", "Auto-Balance"],
    warranty: "1 Year (Parts & Labour)",
    image: "🌀",
  },
  {
    id: "AC-5500", name: "CoolMax Inverter 5500", category: "air-conditioner",
    tagline: "Whisper-quiet cooling, all day comfort",
    price: "RM 1,799", oldPrice: "RM 2,100", badge: "Hot Deal",
    rating: 4.7, reviews: 512, inStock: true,
    color: "icon-purple",
    specs: { btu: "12,000 BTU", energy: "5-Star", noise: "19 dB", coverage: "450 sq ft", compressor: "Inverter" },
    features: ["Auto-Cleaning", "4D Airflow", "Sleep Mode", "PM 2.5 Filter", "Wi-Fi Smart"],
    warranty: "5 Years Compressor, 2 Years Parts",
    image: "❄️",
  },
  {
    id: "AC-3300", name: "AirLite Standard 3300", category: "air-conditioner",
    tagline: "Affordable cooling for small spaces",
    price: "RM 999", oldPrice: null, badge: null,
    rating: 4.3, reviews: 98, inStock: true,
    color: "icon-teal",
    specs: { btu: "9,000 BTU", energy: "3-Star", noise: "26 dB", coverage: "280 sq ft", compressor: "Non-Inverter" },
    features: ["Timer Function", "Auto Restart", "Dehumidify Mode", "Sleep Mode"],
    warranty: "1 Year (Parts & Labour)",
    image: "🌬️",
  },
  {
    id: "RF-3300", name: "FreshKeep 2-Door 3300", category: "refrigerator",
    tagline: "Keep everything fresher, longer",
    price: "RM 1,599", oldPrice: "RM 1,850", badge: "Popular",
    rating: 4.6, reviews: 276, inStock: true,
    color: "icon-green",
    specs: { capacity: "340L", energy: "3-Star", noise: "38 dB", freezer: "80L", defrost: "Auto" },
    features: ["No-Frost Technology", "Humidity Control", "Odour Filter", "Turbo Cool", "Tempered Glass Shelves"],
    warranty: "2 Years (Parts), 5 Years Compressor",
    image: "🧊",
  },
  {
    id: "RF-4500", name: "FrenchDoor Elite 4500", category: "refrigerator",
    tagline: "Stylish, spacious, and smart",
    price: "RM 3,299", oldPrice: null, badge: "Premium",
    rating: 4.9, reviews: 64, inStock: false,
    color: "icon-rose",
    specs: { capacity: "520L", energy: "5-Star", noise: "34 dB", freezer: "140L", defrost: "Auto" },
    features: ["Twin Cooling System", "Water Dispenser", "Smart Diagnosis", "Door Alarm", "Sabbath Mode"],
    warranty: "2 Years (Parts), 10 Years Compressor",
    image: "🏠",
  },
  {
    id: "DW-2200", name: "CleanSweep Dishwasher 2200", category: "dishwasher",
    tagline: "Spotless results, zero effort",
    price: "RM 2,199", oldPrice: "RM 2,499", badge: null,
    rating: 4.4, reviews: 143, inStock: true,
    color: "icon-orange",
    specs: { capacity: "13 sets", energy: "4-Star", noise: "44 dB", programs: "8", drying: "Heat Dry" },
    features: ["Half-Load Option", "Intensive Zone", "Delay Start", "Auto Door Open", "Stainless Interior"],
    warranty: "2 Years (Parts & Labour)",
    image: "✨",
  },
  {
    id: "MW-1100", name: "QuickHeat Microwave 1100", category: "microwave",
    tagline: "Fast, even, and perfectly heated every time",
    price: "RM 399", oldPrice: "RM 499", badge: "Value Pick",
    rating: 4.2, reviews: 389, inStock: true,
    color: "icon-blue",
    specs: { power: "1100W", capacity: "28L", noise: "50 dB", programs: "12", display: "LED" },
    features: ["Auto Cook Menus", "Defrost by Weight", "Child Lock", "Keep Warm", "Easy Clean Interior"],
    warranty: "1 Year (Parts & Labour)",
    image: "📡",
  },
];

const PRODUCT_CATEGORIES = [
  { id: "all", label: "All Products" },
  { id: "washing-machine", label: "Washing Machines" },
  { id: "air-conditioner", label: "Air Conditioners" },
  { id: "refrigerator", label: "Refrigerators" },
  { id: "dishwasher", label: "Dishwashers" },
  { id: "microwave", label: "Microwaves" },
];

// ─── PRODUCTS PAGE ─────────────────────────────────────────────
function ProductsPage({ setPage }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [selected, setSelected] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const filtered = PRODUCTS
    .filter(p => (category === "all" || p.category === category) &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === "price-asc") return parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, ""));
      if (sortBy === "price-desc") return parseInt(b.price.replace(/\D/g, "")) - parseInt(a.price.replace(/\D/g, ""));
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const toggleWishlist = (id) => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  if (selected) return <ProductDetail product={selected} onBack={() => setSelected(null)} setPage={setPage} onWishlist={toggleWishlist} wishlisted={wishlist.includes(selected.id)} />;

  return (
    <>
      {/* Page Hero */}
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-label">Our Products</div>
          <h1 className="page-hero-title">Find your perfect <em>home appliance</em></h1>
          <p className="page-hero-sub">Browse our full range of quality appliances — each backed by our service guarantee and nationwide support network.</p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          {/* Toolbar */}
          <div className="prod-toolbar">
            <div className="prod-search-box">
              <Search size={15} color="var(--text-muted)" />
              <input className="prod-search-input" placeholder="Search products or model..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="prod-cats">
              {PRODUCT_CATEGORIES.map(cat => (
                <button key={cat.id} className={`prod-cat-btn ${category === cat.id ? "active" : ""}`} onClick={() => setCategory(cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="prod-sort">
              <SlidersHorizontal size={14} color="var(--text-muted)" />
              <select className="prod-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="prod-results-meta">
            <span>{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</span>
            {wishlist.length > 0 && <span className="prod-wishlist-count"><Heart size={12} /> {wishlist.length} saved</span>}
          </div>

          {/* Grid */}
          <div className="prod-grid">
            {filtered.map(product => (
              <div key={product.id} className="prod-card" onClick={() => setSelected(product)}>
                {/* Badge */}
                {product.badge && <div className="prod-badge">{product.badge}</div>}
                {!product.inStock && <div className="prod-badge prod-badge-oos">Out of Stock</div>}

                {/* Wishlist */}
                <button className={`prod-wishlist-btn ${wishlist.includes(product.id) ? "active" : ""}`}
                  onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}>
                  <Heart size={14} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                </button>

                {/* Image / Emoji placeholder */}
                <div className="prod-image">
                  <div className={`prod-image-inner ${product.color}`}>
                    <span className="prod-emoji">{product.image}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="prod-card-body">
                  <div className="prod-model-id">{product.id}</div>
                  <h3 className="prod-name">{product.name}</h3>
                  <div className="prod-tagline">{product.tagline}</div>

                  {/* Stars */}
                  <div className="prod-rating">
                    <div className="prod-stars">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} fill={s <= Math.round(product.rating) ? "#f59e0b" : "none"} color={s <= Math.round(product.rating) ? "#f59e0b" : "#d1d5db"} />
                      ))}
                    </div>
                    <span className="prod-rating-val">{product.rating}</span>
                    <span className="prod-review-count">({product.reviews})</span>
                  </div>

                  {/* Key specs */}
                  <div className="prod-spec-pills">
                    {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
                      <span key={k} className="prod-spec-pill">{v}</span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="prod-price-row">
                    <div>
                      <div className="prod-price">{product.price}</div>
                      {product.oldPrice && <div className="prod-old-price">{product.oldPrice}</div>}
                    </div>
                    <button className="prod-view-btn" onClick={e => { e.stopPropagation(); setSelected(product); }}>
                      <Eye size={13} /> View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <Package size={40} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No products found</div>
              <div style={{ fontSize: 14 }}>Try a different category or search term</div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ─── PRODUCT DETAIL ────────────────────────────────────────────
function ProductDetail({ product, onBack, setPage, onWishlist, wishlisted }) {
  const [activeTab, setActiveTab] = useState("specs");
  const [qty, setQty] = useState(1);

  const specLabels = {
    capacity: "Capacity", energy: "Energy Rating", noise: "Noise Level",
    programs: "Programs", spin: "Spin Speed", btu: "Cooling Power",
    coverage: "Room Coverage", compressor: "Compressor Type",
    freezer: "Freezer Capacity", defrost: "Defrost",
    power: "Power Output", display: "Display", drying: "Drying Method",
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="prod-breadcrumb">
        <div className="container">
          <button className="prod-back-btn" onClick={onBack}><ChevronLeft size={14} /> All Products</button>
          <span className="prod-breadcrumb-sep">/</span>
          <span className="prod-breadcrumb-current">{product.name}</span>
        </div>
      </div>

      <section className="section-sm">
        <div className="container">
          <div className="prod-detail-grid">
            {/* Left: Image */}
            <div className="prod-detail-left">
              <div className={`prod-detail-image ${product.color}`}>
                <span className="prod-detail-emoji">{product.image}</span>
              </div>
              <div className="prod-detail-badges">
                {product.features.map((f, i) => (
                  <span key={i} className="prod-feature-tag"><CheckCircle size={11} /> {f}</span>
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="prod-detail-right">
              <div className="prod-detail-top">
                <div className="prod-model-id" style={{ fontSize: 13 }}>{product.id}</div>
                {product.badge && <span className="prod-badge prod-badge-inline">{product.badge}</span>}
              </div>
              <h1 className="prod-detail-name">{product.name}</h1>
              <p className="prod-detail-tagline">{product.tagline}</p>

              <div className="prod-rating" style={{ marginBottom: 20 }}>
                <div className="prod-stars">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} fill={s <= Math.round(product.rating) ? "#f59e0b" : "none"} color={s <= Math.round(product.rating) ? "#f59e0b" : "#d1d5db"} />
                  ))}
                </div>
                <span className="prod-rating-val" style={{ fontSize: 15 }}>{product.rating}</span>
                <span className="prod-review-count">({product.reviews} reviews)</span>
              </div>

              <div className="prod-detail-price-row">
                <div>
                  <div className="prod-detail-price">{product.price}</div>
                  {product.oldPrice && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="prod-old-price" style={{ fontSize: 14 }}>{product.oldPrice}</div>
                      <span className="prod-savings">
                        Save {Math.round(((parseInt(product.oldPrice.replace(/\D/g, "")) - parseInt(product.price.replace(/\D/g, ""))) / parseInt(product.oldPrice.replace(/\D/g, ""))) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`prod-stock-badge ${product.inStock ? "in-stock" : "oos"}`}>
                  {product.inStock ? <><CheckCircle size={12} /> In Stock</> : <><X size={12} /> Out of Stock</>}
                </div>
              </div>

              <div className="prod-detail-warranty">
                <Shield size={14} color="var(--brand)" />
                <span><strong>Warranty:</strong> {product.warranty}</span>
              </div>

              {/* Qty + Actions */}
              <div className="prod-qty-row">
                <div className="prod-qty">
                  <button className="prod-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={14} /></button>
                  <span className="prod-qty-val">{qty}</span>
                  <button className="prod-qty-btn" onClick={() => setQty(q => q + 1)}><PlusIcon size={14} /></button>
                </div>
                <button className="btn-primary" style={{ flex: 1 }} disabled={!product.inStock}>
                  <ShoppingCart size={15} /> {product.inStock ? "Add to Cart" : "Notify Me"}
                </button>
                <button className={`prod-wish-btn ${wishlisted ? "active" : ""}`} onClick={() => onWishlist(product.id)}>
                  <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Tabs */}
              <div className="prod-tabs">
                {["specs", "features", "support"].map(tab => (
                  <button key={tab} className={`prod-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                    {tab === "specs" ? "Specifications" : tab === "features" ? "Features" : "Support Info"}
                  </button>
                ))}
              </div>

              {activeTab === "specs" && (
                <div className="prod-specs-grid">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="prod-spec-row">
                      <span className="prod-spec-label">{specLabels[k] || k}</span>
                      <span className="prod-spec-value">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "features" && (
                <div className="prod-features-list">
                  {product.features.map((f, i) => (
                    <div key={i} className="prod-feature-row">
                      <CheckCircle size={15} color="var(--brand)" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "support" && (
                <div className="prod-support-panel">
                  <div className="prod-support-item">
                    <Shield size={16} color="var(--brand)" />
                    <div>
                      <div className="prod-support-label">Warranty Coverage</div>
                      <div className="prod-support-val">{product.warranty}</div>
                    </div>
                  </div>
                  <div className="prod-support-item">
                    <Wrench size={16} color="#16a34a" />
                    <div>
                      <div className="prod-support-label">Service Available</div>
                      <div className="prod-support-val">Nationwide — 48h response</div>
                    </div>
                  </div>
                  <div className="prod-support-item">
                    <Package size={16} color="#f59e0b" />
                    <div>
                      <div className="prod-support-label">Spare Parts</div>
                      <div className="prod-support-val">In stock · 2–3 day delivery</div>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ marginTop: 12, width: "100%" }} onClick={() => setPage("support")}>
                    <MessageCircle size={14} /> Get Support for This Product
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Related products */}
          <div style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, marginBottom: 20 }}>You might also like</h2>
            <div className="prod-related-grid">
              {PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3).map(p => (
                <div key={p.id} className="prod-related-card" onClick={() => { window.scrollTo(0, 0); }}>
                  <div className={`prod-related-img ${p.color}`}><span>{p.image}</span></div>
                  <div className="prod-related-info">
                    <div className="prod-model-id" style={{ fontSize: 11 }}>{p.id}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 14, color: "var(--brand)", fontWeight: 700 }}>{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── TRACK PAGE ───────────────────────────────────────────────
function TrackPage() {
  const [trackId, setTrackId] = useState("");
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);

  const mockTrack = () => {
    if (!trackId.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setResult({
        id: trackId.toUpperCase(),
        customer: "Ahmad Razif",
        product: "WM-7800 Washing Machine",
        status: "in-progress",
        steps: [
          { label: "Ticket Created", done: true, time: "1 Mar 2025, 9:12 AM" },
          { label: "Assigned to Technician", done: true, time: "1 Mar 2025, 10:00 AM" },
          { label: "Diagnosis Completed", done: true, time: "1 Mar 2025, 2:30 PM" },
          { label: "Spare Part Ordered", done: true, time: "2 Mar 2025, 9:00 AM" },
          { label: "Part Arrived", done: false, time: "Expected: 4 Mar 2025" },
          { label: "Repair Completed", done: false, time: "Expected: 4–5 Mar 2025" },
        ],
      });
    }, 800);
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-label">Service Tracker</div>
          <h1 className="page-hero-title">Track your <em>service request</em></h1>
          <p className="page-hero-sub">Enter your ticket ID or serial number to see real-time status updates.</p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container" style={{ maxWidth: 640 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 32, boxShadow: "var(--shadow-md)" }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, marginBottom: 8 }}>Enter your ticket or serial number</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>e.g. TK-2841 or SN-WM2024-001</p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                className="form-input"
                placeholder="TK-XXXX or SN-XXXXXXXX"
                value={trackId}
                onChange={e => setTrackId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && mockTrack()}
                style={{ flex: 1 }}
              />
              <button className="btn-primary" onClick={mockTrack} style={{ whiteSpace: "nowrap" }}>
                {searching ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
                Track
              </button>
            </div>

            {result && (
              <div style={{ marginTop: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>Tracking: <strong style={{ color: "var(--brand)" }}>{result.id}</strong></div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{result.product}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{result.customer}</div>
                  </div>
                  <span style={{ background: "rgba(245,158,11,0.12)", color: "#b45309", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>In Progress</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {result.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: step.done ? "var(--brand)" : "var(--bg-subtle)", border: step.done ? "none" : "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          {step.done ? <CheckCircle size={13} color="#fff" /> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border)" }} />}
                        </div>
                        {i < result.steps.length - 1 && <div style={{ width: 2, height: 28, background: step.done ? "var(--brand)" : "var(--border)", margin: "2px 0" }} />}
                      </div>
                      <div style={{ paddingBottom: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: step.done ? "var(--text-primary)" : "var(--text-muted)" }}>{step.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{step.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand-name">ServiceHub</div>
            <p className="footer-desc">Fast, reliable customer service for your home appliances. We're here when you need us.</p>
          </div>
          <div>
            <div className="footer-col-title">Products</div>
            <div className="footer-links">
              {["Washing Machines", "Air Conditioners", "Refrigerators", "Dishwashers"].map(l => (
                <button key={l} className="footer-link" onClick={() => setPage("products")}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <div className="footer-links">
              {["FAQ", "Track Request", "Warranty Check", "Spare Parts"].map(l => (
                <button key={l} className="footer-link" onClick={() => setPage("support")}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <div className="footer-links">
              {["About Us", "Careers", "Privacy Policy", "Terms of Service"].map(l => (
                <div key={l} className="footer-link">{l}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 ServiceHub. All rights reserved.</span>
          <span>Built for better customer experiences.</span>
        </div>
      </div>
    </footer>
  );
}