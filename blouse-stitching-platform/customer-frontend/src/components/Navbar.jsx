import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWishlistAuthModal, setShowWishlistAuthModal] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      setIsMobileMenuOpen(false);
      navigate('/');
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleWishlistClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowWishlistAuthModal(true);
      closeMobileMenu();
    } else {
      closeMobileMenu();
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* Column 1: Brand Name Anchored Top Left */}
          <Link to="/" className="navbar-brand-name" onClick={closeMobileMenu}>
            Ammaji Fashions<span className="brand-dot">.</span>
          </Link>

          {/* Column 2: Center Navigation Links (Exact Center) */}
          <nav className={`nav-center-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <ul className="nav-menu">
              <li>
                <NavLink to="/" className="nav-link" onClick={closeMobileMenu}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/catalogue" className="nav-link" onClick={closeMobileMenu}>
                  Catalogue
                </NavLink>
              </li>
              <li>
                <NavLink to="/track" className="nav-link" onClick={closeMobileMenu}>
                  Track Order
                </NavLink>
              </li>
            </ul>

            {/* Mobile-Only Drawer Actions */}
            <div className="mobile-drawer-footer">
              <NavLink 
                to="/wishlist" 
                className="navbar-wishlist-btn" 
                onClick={handleWishlistClick}
              >
                <span className="heart-icon">♡</span>
                <span>My Wishlist</span>
              </NavLink>
              {user ? (
                <div style={{display: 'flex', gap: '0.5rem', width: '100%'}}>
                  <NavLink to="/profile" className="navbar-user-pill" onClick={closeMobileMenu} style={{flex: 1, justifyContent: 'center'}}>
                    👤 {user.name ? user.name.split(' ')[0] : 'Account'}
                  </NavLink>
                  <button onClick={handleLogout} className="navbar-logout-btn">
                    Logout
                  </button>
                </div>
              ) : (
                <div style={{display: 'flex', gap: '0.75rem', width: '100%'}}>
                  <NavLink to="/login" className="nav-link login-link" onClick={closeMobileMenu} style={{flex: 1, textAlign: 'center'}}>
                    Sign In
                  </NavLink>
                  <Link to="/register" className="navbar-register-btn" onClick={closeMobileMenu} style={{flex: 1, textAlign: 'center'}}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Column 3: Right Action Utilities Cluster (Desktop) */}
          <div className="nav-right-cluster">
            {/* Wishlist Link with unauthenticated prompt */}
            <NavLink 
              to="/wishlist" 
              className="navbar-wishlist-btn" 
              onClick={handleWishlistClick} 
              title="Saved Designs"
            >
              <span className="heart-icon">♡</span>
              <span className="wishlist-text">Wishlist</span>
            </NavLink>

            {/* User Account Controls */}
            {user ? (
              <div className="navbar-auth-group">
                <NavLink to="/profile" className="navbar-user-pill" onClick={closeMobileMenu}>
                  <span className="user-avatar-icon">👤</span>
                  <span className="user-name">{user.name ? user.name.split(' ')[0] : 'Account'}</span>
                </NavLink>
                <button onClick={handleLogout} className="navbar-logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <div className="navbar-auth-group">
                <NavLink to="/login" className="nav-link login-link" onClick={closeMobileMenu}>
                  Sign In
                </NavLink>
                <Link to="/register" className="navbar-register-btn" onClick={closeMobileMenu}>
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle Icon */}
          <div className="mobile-menu-icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle navigation">
            {isMobileMenuOpen ? <span>✕</span> : <span>☰</span>}
          </div>
        </div>
      </header>

      {/* WISHLIST AUTHENTICATION PROMPT MODAL */}
      {showWishlistAuthModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1rem',
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setShowWishlistAuthModal(false)}
        >
          <div 
            className="card" 
            style={{
              width: '460px',
              maxWidth: '100%',
              margin: 'auto',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              position: 'relative',
              backgroundColor: '#FFFFFF'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowWishlistAuthModal(false)} 
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: '#FFE4E6',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.4rem',
              margin: '0 auto 1.25rem auto'
            }}>
              ♡
            </div>

            <h3 style={{fontFamily: 'var(--font-serif)', fontSize: '1.65rem', marginBottom: '0.65rem', color: '#1F2937'}}>
              Sign In to View Wishlist
            </h3>

            <p style={{color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem'}}>
              You haven't logged in or registered yet! Please login or create a free account to access your saved blouse designs and personal wishlist.
            </p>

            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              <Link 
                to="/login" 
                className="btn btn-primary" 
                style={{
                  padding: '0.85rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderRadius: '10px'
                }}
                onClick={() => setShowWishlistAuthModal(false)}
              >
                Login to Check Wishlist →
              </Link>

              <Link 
                to="/register" 
                className="btn btn-outline" 
                style={{
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  borderRadius: '10px'
                }}
                onClick={() => setShowWishlistAuthModal(false)}
              >
                Create a Free Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
