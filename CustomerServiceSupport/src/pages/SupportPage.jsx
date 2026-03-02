//src/pages/SupportPage.jsx
import { BookOpen, ChevronDown, CheckCircle, CreditCard, Mail, MessageCircle, Package, Phone, Search, Shield, ThumbsDown, ThumbsUp, Truck, Wrench } from "lucide-react";
import { useState } from "react";
import { ChatInfoForm } from "../components/ChatInfoForm";
import { ChatWindow } from "../components/ChatWindow";

const FAQS = [
  {
    id: 1, category: "warranty",
    question: "What warranty do Fiamma / ELBA products come with?",
    answer: "Warranty coverage varies by product model. Most ELBA appliances come with 12 to 60 months of manufacturer's warranty from the date of purchase. The exact warranty period is stated on your purchase receipt and on the product listing. Air conditioners (e.g. AC-5500) carry up to 60 months warranty, while entry-level models carry 12 months.",
    steps: null
  },
  {
    id: 2, category: "warranty",
    question: "Is my product still under warranty?",
    answer: "Your warranty status can be checked by providing your Order ID or registered email address to our AI agent or support team. Warranty is calculated from your purchase date. If your warranty is still active, all repairs and servicing are carried out at no charge.",
    steps: null
  },
  {
    id: 3, category: "repair",
    question: "How do I raise a support or repair request?",
    answer: "You can raise a support ticket via our AI agent (Fia) on the Fiamma website or app, or by contacting our support hotline. Provide your Order ID and a description of the issue. A ticket will be created and our team will follow up within the stated SLA timeframe.",
    steps: null
  },
  {
    id: 4, category: "repair",
    question: "How long does it take to respond to a support ticket?",
    answer: "Response times depend on ticket priority. High priority tickets (safety-related issues) are responded to within 4 hours. Medium priority tickets receive a response within 1 business day. Low priority tickets are handled within 3 business days.",
    steps: null
  },
  {
    id: 5, category: "purchase",
    question: "Where can I buy Fiamma / ELBA products?",
    answer: "ELBA products are available through authorised Fiamma dealers nationwide, our official website at www.fiamma.com.my, and selected retail partners. Purchase from authorised channels to ensure warranty validity.",
    steps: null
  },
  {
    id: 6, category: "general",
    question: "Are spare parts and accessories available for my product?",
    answer: "Yes, genuine spare parts and accessories are available for most ELBA products. Contact our support team with your product model and the part you require. We recommend using only genuine Fiamma-approved parts to maintain warranty validity.",
    steps: null
  },
  {
    id: 7, category: "general",
    question: "Can I purchase spare parts directly?",
    answer: "Spare parts are available through our authorised service centres and selected dealers. For safety and warranty compliance, we recommend installation by our certified technicians.",
    steps: null
  },
  {
    id: 8, category: "general",
    question: "Do your products come with installation services?",
    answer: "Yes, professional installation services are available for select products such as built-in ovens and air conditioners at an additional fee. Ask our support team or dealer for details at the time of purchase.",
    steps: null
  },
  {
    id: 9, category: "warranty",
    question: "What is covered under the warranty?",
    answer: "The warranty covers manufacturing defects, faulty components, and internal hardware failures under normal use conditions. It does not cover physical damage caused by accidents, misuse, unauthorised repairs, power surges, or cosmetic damage such as scratches and dents.",
    steps: null
  },
  {
    id: 10, category: "warranty",
    question: "My warranty has expired. Can I still get it repaired?",
    answer: "Yes, Fiamma offers out-of-warranty repair services at a service fee. Our support team will assess the issue and provide a cost estimate before any repair work begins. You will need to confirm your acceptance of the fee before we proceed.",
    steps: null
  },
  {
    id: 11, category: "warranty",
    question: "How do I register my product for warranty?",
    answer: "You can register your product by visiting www.fiamma.com.my or by contacting our customer support team with your purchase receipt and product serial number. Registration ensures faster processing for future warranty claims.", 
    steps: null
  },
  {
    id: 12, category: "repair",
    question: "Can I check my support ticket status?",
    answer: "Yes. Provide your ticket ID (e.g. TKT-XXXXXX) or your registered email address to the AI agent and it will retrieve your current ticket status, including whether it is Open, In Progress, or Resolved.",
    steps: null
  },
  {
    id: 13, category: "repair",
    question: "I submitted a ticket but have more information to add. What should I do?",
    answer: "You can update an existing ticket by telling our AI agent your ticket ID and providing the additional information. The agent will append a note to your existing ticket so our support team has the complete picture.",
    steps: null
  },
  {
    id: 14, category: "purchase",
    question: "How long does delivery take?",
    answer:"Standard delivery within Peninsular Malaysia takes 3–5 business days. East Malaysia (Sabah & Sarawak) deliveries may take 7–10 business days. You will receive a tracking number upon dispatch.",
    steps: null
  },
  {
    id: 15, category: "purchase",
    question: "What is your return policy?",
    answer: "Products may be returned or exchanged within 7 days of purchase if they are in their original condition with packaging, receipt, and accessories. For defective products, please raise a support ticket and our team will arrange for inspection and replacement if applicable.",
    steps: null
  }
];

const FAQ_CATEGORIES = [
  { id: "all", label: "All Topics", icon: BookOpen, count: 15 },
  { id: "warranty", label: "Warranty & Repairs", icon: Shield, count: 5 },
  { id: "repair", label: "Support Tickets & Service Requests", icon: Wrench, count: 4 },
  { id: "purchase", label: "Purchase, Delivery & Returns", icon: CreditCard, count: 3 },
  { id: "general", label: "General Product Questions", icon: Truck, count: 3 },
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