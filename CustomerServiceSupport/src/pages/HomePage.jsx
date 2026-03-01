//src/pages/HomePage.jsx
import { ArrowRight, CheckCircle, HelpCircle, LifeBuoy, MessageCircle, Package, Shield, Star, Truck, Zap, Wrench } from "lucide-react";

export const HomePage = ({ setPage }) => {
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
                <button className="btn-primary large" onClick={() => setPage("support")}>
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