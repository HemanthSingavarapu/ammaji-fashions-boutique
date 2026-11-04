import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4 style={{fontFamily: 'var(--font-serif)'}}>Ammaji Fashions</h4>
            <p style={{color: 'rgba(255,255,255,0.7)', marginTop: '0.75rem', lineHeight: 1.6}}>
              Premium bespoke blouse designing, custom hand embroidery, and doorstep stitching services delivered across India.
            </p>
            <div style={{marginTop: '1.25rem'}}>
              <a 
                href="https://wa.me/918341085629?text=Hi%20Ammaji%20Fashions!%20I%20have%20an%20inquiry." 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(37, 211, 102, 0.15)',
                  border: '1px solid rgba(37, 211, 102, 0.4)',
                  borderRadius: '20px',
                  color: '#25D366',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                <span>💬</span> WhatsApp Atelier Concierge
              </a>
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/catalogue">Design Catalogue</Link></li>
              <li><Link to="/studio">Custom Blouse Studio 🧵</Link></li>
              <li><Link to="/guide">Measurement Guide</Link></li>
            </ul>
          </div>
          <div>
            <h4>Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/track">Track Order Status</Link></li>
              <li><a href="https://wa.me/918341085629?text=Hi%20Ammaji%20Fashions!%20I%20need%20assistance%20with%20my%20order." target="_blank" rel="noopener noreferrer">💬 Chat on WhatsApp</a></li>
              <li><a href="https://wa.me/918341085629?text=Hi%20Ammaji%20Fashions,%20I%20would%20like%20to%20request%20a%20call%20regarding%20blouse%20stitching." target="_blank" rel="noopener noreferrer">📞 Request Call Back</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Ammaji Fashions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
