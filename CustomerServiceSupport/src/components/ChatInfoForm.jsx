//src/components/ChatInfoForm.jsx
import { AlertCircle, Headphones, Hash, Info, Lock, Mail, MessageCircle, RefreshCw, User } from "lucide-react";
import { useState } from "react";

export const ChatInfoForm = ({ onStartChat }) => {
  const [form, setForm] = useState({ name: "", email: "", serial: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.serial.trim()) e.serial = "Serial / tracking number is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onStartChat(); }, 1200);
  };

  const field = (key) => ({
    value: form[key],
    onChange: e => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: "" }); },
    className: `form-input ${errors[key] ? "error" : ""}`,
  });

  return (
    <div className="chat-form-card">
      {/* Header */}
      <div className="chat-form-header">
        <div className="chat-form-header-icon">
          <Headphones size={18} />
        </div>
        <div className="chat-form-header-text">
          <div className="label">Customer Support</div>
          <div className="title">Start a Live Chat</div>
        </div>
        <div className="chat-status-dot" />
      </div>

      {/* Form Body */}
      <div className="chat-form-body">
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Please fill in your details below. This helps us identify your product and service history instantly.
        </p>

        <div className="form-group">
          <label className="form-label">
            <User size={12} /> Full Name <span className="required">*</span>
          </label>
          <input {...field("name")} placeholder="e.g. Ahmad Razif" />
          {errors.name && <div className="form-error"><AlertCircle size={11} /> {errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            <Mail size={12} /> Email Address <span className="required">*</span>
          </label>
          <input {...field("email")} type="email" placeholder="you@example.com" />
          {errors.email && <div className="form-error"><AlertCircle size={11} /> {errors.email}</div>}
          {!errors.email && <div className="form-hint"><Info size={11} /> We'll send a copy of this chat to your email</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            <Hash size={12} /> Serial / Tracking Number <span className="required">*</span>
          </label>
          <input {...field("serial")} placeholder="e.g. SN-WM2024-001 or TK-2841" />
          {errors.serial && <div className="form-error"><AlertCircle size={11} /> {errors.serial}</div>}
          {!errors.serial && (
            <div className="form-hint">
              <Info size={11} /> Found on the product label (back/bottom) or your service ticket
            </div>
          )}
        </div>

        <div className="form-divider">or describe your issue briefly</div>

        <div className="form-group">
          <label className="form-label">
            <MessageCircle size={12} /> Issue Description <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <textarea
            className="form-input"
            placeholder="e.g. My washing machine shows error E3 and won't spin..."
            rows={3}
            style={{ resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        <button
          className="chat-start-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Connecting...</>
          ) : (
            <><MessageCircle size={16} /> Start Chat Now</>
          )}
        </button>
      </div>

      <div className="chat-form-footer">
        <Lock size={12} />
        Your information is encrypted and kept private. We never share your data.
      </div>
    </div>
  );
}