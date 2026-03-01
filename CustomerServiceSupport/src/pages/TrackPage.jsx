//src/pages/TrackPage.jsx
import { useState } from "react";
import { Search, CheckCircle, RefreshCw } from "lucide-react";

export const TrackPage = () => {
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