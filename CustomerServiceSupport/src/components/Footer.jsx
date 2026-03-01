//src/components/Footer.jsx

export const Footer = ({ setPage }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand-name">ServiceHub</div>
            <p className="footer-desc">Fast, reliable customer service for your home appliances. We're here when you need us.</p>
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
            <div className="footer-col-title">Contact</div>
            <div className="footer-links">
              {["Live Chat", "1300-88-XXXX", "support@hub.com", "Find a Service Centre"].map(l => (
                <div key={l} className="footer-link">{l}</div>
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