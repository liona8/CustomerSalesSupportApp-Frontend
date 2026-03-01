//src/pages/SupportPage.jsx
import { BookOpen, ChevronDown, CheckCircle, CreditCard, Mail, MessageCircle, Package, Phone, Search, Shield, ThumbsDown, ThumbsUp, Truck, Wrench } from "lucide-react";
import { useState } from "react";
import { ChatInfoForm } from "../components/ChatInfoForm";
import { ChatWindow } from "../components/ChatWindow";

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

const FAQ_CATEGORIES = [
  { id: "all", label: "All Topics", icon: BookOpen, count: 16 },
  { id: "warranty", label: "Warranty", icon: Shield, count: 4 },
  { id: "repair", label: "Repair & Service", icon: Wrench, count: 5 },
  { id: "parts", label: "Spare Parts", icon: Package, count: 3 },
  { id: "tracking", label: "Track Request", icon: Truck, count: 2 },
  { id: "billing", label: "Billing", icon: CreditCard, count: 2 },
];

export const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [votes, setVotes] = useState({});
  const [hasSearched, setHasSearched] = useState(false);

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
            onChange={e => { setSearchQuery(e.target.value); setHasSearched(true); }}
            onKeyDown={e => e.key === "Enter" && setHasSearched(true)}
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
                  { icon: MessageCircle, label: "Chat with us", sub: "Available now" },
                  { icon: Phone, label: "1300-88-XXXX", sub: "Mon–Sat, 9am–6pm" },
                  { icon: Mail, label: "support@hub.com", sub: "Reply in 4 hours" },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(29,95,179,0.1)" : "none" }}>
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
                    <div className="faq-cta-card" onClick={() => setShowChat(true)}>
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
                              onClick={() => setShowChat(true)}
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
                      <div className="faq-cta-card" onClick={() => setShowChat(true)}>
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

      {/* Chat Flow */}
      {showChat && (
        <section className="chat-section" id="chat-section">
          <div className="container">
            <div className="chat-section-inner">
              {/* Left Info */}
              <div className="chat-info">
                <div className="section-label"><MessageCircle size={12} /> Live Support Chat</div>
                <h2>Let's get your issue sorted, <em style={{ fontStyle: "italic", color: "var(--brand)" }}>fast</em></h2>
                <p>Fill in your details so our agent can immediately pull up your product history and start helping. No need to repeat yourself.</p>
                <div className="chat-steps">
                  {[
                    { title: "Enter your details", desc: "Name, email, and serial number so we can find your product" },
                    { title: "Start the chat", desc: "Connect instantly with AI or a live agent" },
                    { title: "Get it resolved", desc: "We'll escalate, schedule, or fix it right in the chat" },
                  ].map((step, i) => (
                    <div className="chat-step" key={i}>
                      <div className="chat-step-num">{i + 1}</div>
                      <div className="chat-step-text">
                        <strong>{step.title}</strong>
                        <span>{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 32, padding: "16px 20px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, display: "flex", gap: 10, alignItems: "center" }}>
                  <CheckCircle size={16} color="#16a34a" />
                  <div style={{ fontSize: 13, color: "#166534" }}>
                    <strong>Agents online now.</strong> Average wait time is under 2 minutes.
                  </div>
                </div>
              </div>

              {/* Right: Form or Chat Window */}
              {!chatStarted ? (
                <ChatInfoForm onStartChat={() => setChatStarted(true)} />
              ) : (
                <ChatWindow onClose={() => { setChatStarted(false); setShowChat(false); }} />
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}