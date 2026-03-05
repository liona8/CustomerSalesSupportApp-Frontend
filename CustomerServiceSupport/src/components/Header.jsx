//src/components/Header.jsx
import { Headphones, MessageCircle } from "lucide-react";

const PAGES = {
  HOME: "home",
  SUPPORT: "support",
  TRACK: "track"
};

export const Header = ({ activePage, setPage }) => {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="nav-logo" onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
            <div className="nav-logo-icon">
              <Headphones size={18} />
            </div>
            <span className="nav-logo-text">Fiamma <span>Customer Guardian</span></span>
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
