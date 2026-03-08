//src/pages/TrackPage.jsx
import { useState } from "react";
import {
  AlertCircle, Bot, CheckCircle, Clock, CreditCard, FileText, Gift,
  Hash, HelpCircle, MessageCircle, Package, RefreshCw, Search, Shield,
  User, Wrench, Zap, Camera, ZoomIn, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import '../assets/track.css';
import { FeedbackPanel } from "../components/FeedbackPanel";
import { ticketService } from "../service/ticket";

const SAMPLE_TICKETS = [
  { ticket_id: "TKT-5679" },
  { ticket_id: "TKT-5680" },
  { ticket_id: "TKT-5681" },
];

const STATUS_PIPELINE = [
  { key: "CREATED",     label: "Ticket Created",      icon: FileText    },
  { key: "ASSIGNED",    label: "Technician Assigned", icon: User        },
  { key: "JOB_STARTED", label: "Job In Progress",     icon: Wrench      },
  { key: "COMPLETED",   label: "Completed",           icon: CheckCircle },
];
const STATUS_ORDER = { CREATED: 0, ASSIGNED: 1, JOB_STARTED: 2, COMPLETED: 3 };

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-MY", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtDateShort(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-MY", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function isSLABreached(ticket) {
  if (!ticket.sla_deadline_at || ticket.status === "COMPLETED") return false;
  return new Date() > new Date(ticket.sla_deadline_at);
}

const STATUS_META = {
  COMPLETED:   { label: "Completed",       color: "#16a34a", bg: "#dcfce7" },
  JOB_STARTED: { label: "Job In Progress", color: "#1d5fb3", bg: "#dbeafe" },
  ASSIGNED:    { label: "Assigned",        color: "#d97706", bg: "#fef3c7" },
  CREATED:     { label: "Ticket Created",  color: "#6b7280", bg: "#f3f4f6" },
};
const WARRANTY_META = {
  UNDER_WARRANTY: { label: "Under Warranty",   color: "#16a34a", bg: "#dcfce7" },
  EXPIRED:        { label: "Warranty Expired", color: "#ef4444", bg: "#fee2e2" },
};
const URGENCY_META = {
  CRITICAL: { label: "Critical", color: "#dc2626", bg: "#fee2e2" },
  HIGH:     { label: "High",     color: "#d97706", bg: "#fef3c7" },
  STANDARD: { label: "Standard", color: "#2563eb", bg: "#dbeafe" },
};

// ── Lightbox component ────────────────────────────────────────
function PhotoLightbox({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = () => setCurrent(i => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent(i => (i + 1) % photos.length);

  // Keyboard navigation
  const handleKey = (e) => {
    if (e.key === "ArrowLeft")  prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape")     onClose();
  };

  return (
    <div className="trk-lightbox-overlay" onClick={onClose} onKeyDown={handleKey} tabIndex={0}
      style={{ outline: "none" }} ref={el => el?.focus()}>
      {/* Close */}
      <button className="trk-lb-close" onClick={onClose}><X size={20} /></button>

      {/* Counter */}
      <div className="trk-lb-counter">{current + 1} / {photos.length}</div>

      {/* Prev / Next arrows (only if multiple) */}
      {photos.length > 1 && (
        <>
          <button className="trk-lb-arrow trk-lb-arrow-left"
            onClick={e => { e.stopPropagation(); prev(); }}>
            <ChevronLeft size={28} />
          </button>
          <button className="trk-lb-arrow trk-lb-arrow-right"
            onClick={e => { e.stopPropagation(); next(); }}>
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Image */}
      <div className="trk-lb-img-wrap" onClick={e => e.stopPropagation()}>
        <img src={photos[current]} alt={`Photo ${current + 1}`} className="trk-lb-img" />
      </div>

      {/* Thumbnails strip (only if multiple) */}
      {photos.length > 1 && (
        <div className="trk-lb-thumbs" onClick={e => e.stopPropagation()}>
          {photos.map((url, i) => (
            <button key={i}
              className={`trk-lb-thumb-btn ${i === current ? "trk-lb-thumb-active" : ""}`}
              onClick={() => setCurrent(i)}>
              <img src={url} alt={`Thumb ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Photo gallery card ────────────────────────────────────────
function PhotoGallery({ photos }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!photos?.length) return null;

  return (
    <>
      <div className="trk-card">
        <div className="trk-card-title">
          <Camera size={14} /> Customer Photos
          <span className="trk-photo-count-badge">{photos.length} photo{photos.length > 1 ? "s" : ""}</span>
        </div>

        <div className={`trk-photo-gallery trk-pg-${Math.min(photos.length, 4)}`}>
          {photos.map((url, i) => {
            // 4th tile shows "+N more" overlay if there are more
            const isOverflow = i === 3 && photos.length > 4;
            return (
              <button key={i}
                className={`trk-pg-tile ${isOverflow ? "trk-pg-tile-overflow" : ""}`}
                onClick={() => setLightboxIndex(i)}
                title={`View photo ${i + 1}`}
              >
                <img src={url} alt={`Attachment ${i + 1}`} className="trk-pg-img" />
                <div className="trk-pg-overlay">
                  <ZoomIn size={16} />
                </div>
                {isOverflow && (
                  <div className="trk-pg-more-overlay">+{photos.length - 3}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

// ── Main TrackPage ────────────────────────────────────────────
export const TrackPage = ({ openChatWithMessage }) => {
  const [trackId,   setTrackId]   = useState("");
  const [result,    setResult]    = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound,  setNotFound]  = useState(false);

  const handleTrack = async () => {
    const q = trackId.trim().toUpperCase();
    if (!q) return;
    setSearching(true); setNotFound(false); setResult(null);
    try {
      const ticket = await ticketService.getTicketById(q);
      setResult(ticket);
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const currentStep = result ? (STATUS_ORDER[result.status] ?? 0) : 0;
  const slaBreached = result ? isSLABreached(result) : false;

  // Normalise photo_urls — handle both string[] and object[] shapes
  const photoUrls = (result?.photo_url ?? [])
    .map(p => (typeof p === "string" ? p : p?.url ?? p?.dataUrl ?? null))
    .filter(Boolean);

  return (
    <>
      {/* Hero */}
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-label">Service Tracker</div>
          <h1 className="page-hero-title">Track your <em>service request</em></h1>
          <p className="page-hero-sub">Enter your Ticket ID or Order ID to get a full real-time status update.</p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container trk-container">

          {/* Search card */}
          <div className="trk-search-card">
            <div className="trk-search-title">
              <Search size={16} color="var(--brand)" /> Find your service ticket
            </div>
            <p className="trk-search-sub">Enter your Ticket ID (e.g. TKT-5679)</p>
            <div className="trk-search-row">
              <input
                className="form-input trk-input"
                placeholder="TKT-XXXX"
                value={trackId}
                onChange={e => setTrackId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleTrack()}
              />
              <button className="btn-primary trk-btn" onClick={handleTrack} disabled={searching}>
                {searching
                  ? <><RefreshCw size={14} style={{ animation: "trk-spin 1s linear infinite" }} /> Searching…</>
                  : <><Search size={14} /> Track</>}
              </button>
            </div>
            <div className="trk-sample-chips">
              <span className="trk-chip-label">Try:</span>
              {SAMPLE_TICKETS.map(t => (
                <button key={t.ticket_id} className="trk-chip"
                  onClick={() => setTrackId(t.ticket_id)}>
                  {t.ticket_id}
                </button>
              ))}
            </div>
          </div>

          {/* Not found */}
          {notFound && (
            <div className="trk-not-found">
              <AlertCircle size={32} color="#ef4444" />
              <div className="trk-nf-title">Ticket not found</div>
              <div className="trk-nf-sub">
                No ticket matched "<strong>{trackId}</strong>". Please check the ID and try again.
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="trk-result">

              {/* ── Header bar ── */}
              <div className="trk-result-header">
                <div className="trk-result-header-left">
                  <div className="trk-ticket-id">{result.ticket_id}</div>
                  <div className="trk-subject">{result.subject}</div>
                  <div className="trk-meta-row">
                    <span className="trk-order-id"><Hash size={11} /> {result.order_id}</span>
                    <span className="trk-dot-sep">·</span>
                    <span className="trk-customer"><User size={11} /> {result.customer_name}</span>
                    <span className="trk-dot-sep">·</span>
                    <span className="trk-created"><Clock size={11} /> {fmtDateShort(result.created_at)}</span>
                  </div>
                </div>
                <div className="trk-badge-stack">
                  <span className="trk-badge" style={{ background: STATUS_META[result.status]?.bg, color: STATUS_META[result.status]?.color }}>
                    {STATUS_META[result.status]?.label}
                  </span>
                  <span className="trk-badge" style={{ background: WARRANTY_META[result.warranty_status]?.bg, color: WARRANTY_META[result.warranty_status]?.color }}>
                    <Shield size={10} /> {WARRANTY_META[result.warranty_status]?.label}
                  </span>
                  <span className="trk-badge" style={{ background: URGENCY_META[result.urgency_level]?.bg, color: URGENCY_META[result.urgency_level]?.color }}>
                    {result.urgency_level === "CRITICAL" && <Zap size={10} />} {URGENCY_META[result.urgency_level]?.label}
                  </span>
                  {slaBreached && (
                    <span className="trk-badge trk-badge-sla"><AlertCircle size={10} /> SLA Breached</span>
                  )}
                </div>
              </div>

              {/* ── Status Pipeline ── */}
              <div className="trk-pipeline-wrap">
                <div className="trk-pipeline">
                  {STATUS_PIPELINE.map((step, i) => {
                    const done   = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.key} className={`trk-step ${done ? "trk-step-done" : ""} ${active ? "trk-step-active" : ""}`}>
                        <div className="trk-step-icon-wrap">
                          <div className="trk-step-icon"><step.icon size={14} /></div>
                          {i < STATUS_PIPELINE.length - 1 && (
                            <div className={`trk-step-line ${done && i < currentStep ? "trk-line-done" : ""}`} />
                          )}
                        </div>
                        <div className="trk-step-label">{step.label}</div>
                        {active && result.status !== "COMPLETED" && (
                          <div className="trk-step-current-tag">Current</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Detail grid ── */}
              <div className="trk-detail-grid">

                {/* ── Left column ── */}
                <div className="trk-detail-left">

                  {/* Issue details */}
                  <div className="trk-card">
                    <div className="trk-card-title"><FileText size={14} /> Issue Details</div>
                    <p className="trk-description">{result.description || "N/A"}</p>
                    {result.fault_type && result.fault_type !== "string" && (
                      <div className="trk-info-row">
                        <span className="trk-info-label">Fault Type</span>
                        <span className="trk-info-val">{result.fault_type}</span>
                      </div>
                    )}
                    {result.fault_notes && result.fault_notes !== "string" && (
                      <div className="trk-info-row trk-info-row-col">
                        <span className="trk-info-label">Technician Notes</span>
                        <span className="trk-info-val">{result.fault_notes}</span>
                      </div>
                    )}
                    {result.work_done_notes && result.work_done_notes !== "string" && (
                      <div className="trk-info-row trk-info-row-col">
                        <span className="trk-info-label">Work Done</span>
                        <span className="trk-info-val trk-work-done">{result.work_done_notes}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Customer Photos ── renders only if photos exist */}
                  <PhotoGallery photos={photoUrls} />

                  {/* Parts */}
                  {(result.predicted_parts?.length > 0 || result.actual_parts_used?.filter(p => p && p !== "string").length > 0) && (
                    <div className="trk-card">
                      <div className="trk-card-title"><Package size={14} /> Parts & Materials</div>
                      <div className="trk-parts-section">
                        <div className="trk-parts-section-label">Predicted Parts</div>
                        {result.predicted_parts?.length > 0 ? (
                          result.predicted_parts.map((p, i) => (
                            <div key={i} className="trk-part-row">
                              <div>
                                <div className="trk-part-name">{p.name || "N/A"}</div>
                                <div className="trk-part-id">{p.part_id || "N/A"}</div>
                              </div>
                              <div className="trk-part-right">
                                <span className={`trk-stock-badge ${
                                  p.stock === "IN_STOCK" ? "in" : p.stock === "OUT_OF_STOCK" ? "out" : "unknown"
                                }`}>
                                  {p.stock === "IN_STOCK" ? "In Stock" : p.stock === "OUT_OF_STOCK" ? "Out of Stock" : "Checking"}
                                </span>
                                {p.cost > 0 && <span className="trk-part-cost">RM {p.cost}</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="trk-part-empty">— No predicted parts —</div>
                        )}
                        {result.predicted_parts?.length > 0 && (
                          <div className="trk-parts-approved">
                            {result.parts_approved
                              ? <><CheckCircle size={12} color="#16a34a" /> Parts approved</>
                              : <><Clock size={12} color="#d97706" /> Pending approval</>}
                          </div>
                        )}
                      </div>
                      {result.actual_parts_used?.filter(p => p && p !== "string").length > 0 && (
                        <div className="trk-parts-section" style={{ marginTop: 12 }}>
                          <div className="trk-parts-section-label">Parts Used</div>
                          {result.actual_parts_used.filter(p => p && p !== "string").map((p, i) => (
                            <div key={i} className="trk-used-part">
                              <CheckCircle size={11} color="#16a34a" /> {p}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Activity Log */}
                  {result.notes?.filter(n => n.note !== "string").length > 0 && (
                    <div className="trk-card">
                      <div className="trk-card-title"><Bot size={14} /> Activity Log</div>
                      <div className="trk-notes">
                        {result.notes.filter(n => n.note !== "string").map((n, i) => (
                          <div key={i} className="trk-note-row">
                            <div className="trk-note-avatar"><Bot size={10} /></div>
                            <div>
                              <div className="trk-note-by">{n.addedBy}</div>
                              <div className="trk-note-text">{n.note}</div>
                              <div className="trk-note-time">{fmtDate(n.addedAt)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Right column ── */}
                <div className="trk-detail-right">

                  {/* Service info */}
                  <div className="trk-card">
                    <div className="trk-card-title"><Wrench size={14} /> Service Info</div>
                    {[
                      { label: "Technician",   value: result.assigned_tech_id },
                      { label: "Priority",     value: result.urgency_level || "—" },
                      { label: "Created",      value: fmtDate(result.created_at) },
                      { label: "SLA Deadline", value: fmtDate(result.sla_deadline_at), alert: slaBreached },
                      { label: "Last Updated", value: fmtDate(result.updated_at) },
                      { label: "Completed",    value: result.completed_at ? fmtDate(result.completed_at) : "—" },
                    ].map((row, i) => (
                      <div key={i} className="trk-info-row">
                        <span className="trk-info-label">{row.label}</span>
                        <span className={`trk-info-val ${row.alert ? "trk-alert-text" : ""}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Charges */}
                  <div className="trk-card">
                    <div className="trk-card-title"><CreditCard size={14} /> Charges</div>
                    <div className={`trk-charge-banner ${result.charge_applicable ? "trk-charge-yes" : "trk-charge-no"}`}>
                      {result.charge_applicable
                        ? <><AlertCircle size={14} /> Service charge applicable (warranty expired)</>
                        : <><CheckCircle size={14} /> No charge — covered under warranty</>}
                    </div>
                  </div>

                  {/* Compensation */}
                  {result.compensation_code && (
                    <div className="trk-card trk-comp-card">
                      <div className="trk-card-title"><Gift size={14} /> Compensation Issued</div>
                      <div className="trk-comp-code">{result.compensation_code}</div>
                      <div className="trk-comp-hint">Present this code at any authorised service centre or use it online for discounts.</div>
                    </div>
                  )}

                  {/* Help CTA */}
                  <div className="trk-card trk-help-card">
                    <div className="trk-card-title"><HelpCircle size={14} /> Need help?</div>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                      Have questions about this ticket? Chat with our support team directly.
                    </p>
                    <button
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => openChatWithMessage(`Hi, I have a question about ticket ${result.ticket_id}`)}
                    >
                      <MessageCircle size={14} /> Chat about {result.ticket_id}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Feedback (COMPLETED only) ── */}
              {result.status === "COMPLETED" && (
                <FeedbackPanel ticketId={result.ticket_id} />
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};