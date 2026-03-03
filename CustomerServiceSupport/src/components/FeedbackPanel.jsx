// src/components/FeedbackPanel.jsx
import { useState } from "react";
import { Star, CheckCircle, Lock, RefreshCw, Send } from "lucide-react";
import "../assets/feedback.css";

// ─── FEEDBACK PANEL ───────────────────────────────────────────
const SATISFACTION_TAGS = [
  { id: "fast",      emoji: "⚡", label: "Fast service" },
  { id: "friendly",  emoji: "😊", label: "Friendly technician" },
  { id: "thorough",  emoji: "🔍", label: "Thorough diagnosis" },
  { id: "clean",     emoji: "✨", label: "Left area clean" },
  { id: "explained", emoji: "💬", label: "Well explained" },
  { id: "ontime",    emoji: "🕐", label: "Arrived on time" },
];
const ISSUE_TAGS = [
  { id: "slow",      emoji: "🐌", label: "Took too long" },
  { id: "rude",      emoji: "😤", label: "Unfriendly staff" },
  { id: "incomplete",emoji: "🔧", label: "Issue not fully fixed" },
  { id: "messy",     emoji: "🗑️", label: "Left a mess" },
  { id: "late",      emoji: "⏰", label: "Arrived late" },
  { id: "unclear",   emoji: "❓", label: "Poor explanation" },
];

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export const FeedbackPanel = ({ ticketId }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const MAX_CHARS = 300;
  const activeStar = hovered || rating;
  const tags = rating >= 4 ? SATISFACTION_TAGS : rating > 0 ? ISSUE_TAGS : [];

  const toggleTag = (id) =>
    setSelectedTags(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id]);

  const handleComment = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setComment(e.target.value);
      setCharCount(e.target.value.length);
    }
  };

  const handleSubmit = () => {
    if (!rating) return;
    setSubmitting(true);
    // Simulate API submission
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1000);
  };

  if (submitted) {
    return (
      <div className="fb-wrap">
        <div className="fb-submitted">
          <div className="fb-submitted-icon">
            <CheckCircle size={36} color="#16a34a" />
          </div>
          <h3 className="fb-submitted-title">Thank you for your feedback!</h3>
          <p className="fb-submitted-sub">
            Your response has been recorded for ticket <strong>{ticketId}</strong>.
            It helps us improve our service quality.
          </p>
          <div className="fb-submitted-stars">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={22}
                fill={s <= rating ? "#f59e0b" : "none"}
                color={s <= rating ? "#f59e0b" : "#d1d5db"} />
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="fb-submitted-tags">
              {selectedTags.map(id => {
                const tag = [...SATISFACTION_TAGS, ...ISSUE_TAGS].find(t => t.id === id);
                return tag ? <span key={id} className="fb-tag fb-tag-done">{tag.emoji} {tag.label}</span> : null;
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fb-wrap">
      <div className="fb-header">
        <div className="fb-header-icon"><Star size={18} /></div>
        <div>
          <div className="fb-header-title">How was your service experience?</div>
          <div className="fb-header-sub">Your ticket <strong>{ticketId}</strong> is resolved — we'd love your feedback</div>
        </div>
      </div>

      <div className="fb-body">
        {/* Star rating */}
        <div className="fb-stars-section">
          <div className="fb-section-label">Overall satisfaction</div>
          <div className="fb-stars-row"
            onMouseLeave={() => setHovered(0)}>
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                className={`fb-star ${s <= activeStar ? "fb-star-active" : ""}`}
                onClick={() => { setRating(s); setSelectedTags([]); }}
                onMouseEnter={() => setHovered(s)}
                aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
              >
                <Star size={28} fill={s <= activeStar ? "#f59e0b" : "none"} color={s <= activeStar ? "#f59e0b" : "#d1d5db"} />
              </button>
            ))}
          </div>
          {activeStar > 0 && (
            <div className="fb-star-label">
              <span className="fb-star-emoji">
                {["","😞","😐","🙂","😊","🤩"][activeStar]}
              </span>
              {STAR_LABELS[activeStar]}
            </div>
          )}
        </div>

        {/* Sentiment tags — appear after rating */}
        {tags.length > 0 && (
          <div className="fb-tags-section">
            <div className="fb-section-label">
              {rating >= 4 ? "What did we do well?" : "What could we improve?"}
            </div>
            <div className="fb-tags-grid">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  className={`fb-tag ${selectedTags.includes(tag.id) ? "fb-tag-selected" : ""} ${rating >= 4 ? "fb-tag-pos" : "fb-tag-neg"}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  <span className="fb-tag-emoji">{tag.emoji}</span>
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment box — appears after star rating */}
        {rating > 0 && (
          <div className="fb-comment-section">
            <div className="fb-section-label">
              Additional comments <span className="fb-optional">(optional)</span>
            </div>
            <div className="fb-textarea-wrap">
              <textarea
                className="fb-textarea"
                placeholder={rating >= 4
                  ? "Tell us what made your experience great…"
                  : "Tell us how we can do better…"}
                value={comment}
                onChange={handleComment}
                rows={3}
              />
              <div className={`fb-char-count ${charCount > MAX_CHARS * 0.85 ? "fb-char-warn" : ""}`}>
                {charCount}/{MAX_CHARS}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="fb-footer">
          <div className="fb-footer-note">
            <Lock size={11} /> Your feedback is private and used only for quality improvement.
          </div>
          <button
            className={`fb-submit-btn ${rating > 0 ? "fb-submit-active" : ""}`}
            onClick={handleSubmit}
            disabled={!rating || submitting}
          >
            {submitting
              ? <><RefreshCw size={14} style={{ animation: "trk-spin 0.8s linear infinite" }} /> Submitting…</>
              : <><Send size={14} /> Submit Feedback</>}
          </button>
        </div>
      </div>
    </div>
  );
}