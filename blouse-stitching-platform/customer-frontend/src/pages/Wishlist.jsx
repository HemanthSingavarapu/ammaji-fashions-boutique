import { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function Wishlist() {
  const [wishlistDesigns, setWishlistDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      api.get('/wishlist')
        .then(res => {
          setWishlistDesigns(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching wishlist", err);
          setLoading(false);
        });
    }
  }, [user]);

  const removeFromWishlist = (id) => {
    setWishlistDesigns(prev => prev.filter(item => item.id !== id));
    api.delete(`/wishlist/${id}`).catch(err => console.error(err));
  };

  if (!user) {
    return (
      <div className="section container" style={{textAlign: 'center', padding: '5rem 1.5rem'}}>
        <div style={{maxWidth: '540px', margin: '0 auto', backgroundColor: 'var(--bg-surface-elevated)', padding: '3.5rem 2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)'}}>
          <div style={{fontSize: '3.8rem', marginBottom: '1.25rem', color: '#E11D48'}}>♡</div>
          <h2 style={{fontFamily: 'var(--font-serif)', fontSize: '1.9rem', marginBottom: '0.75rem', color: 'var(--text-main)'}}>
            You Haven't Logged In or Registered Yet
          </h2>
          <p style={{color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem'}}>
            Please log in or create an account to view, save, and manage your favorite blouse designs in your wishlist.
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/login" className="btn btn-primary" style={{padding: '0.85rem 2rem', fontSize: '0.95rem'}}>
              Login to Check Wishlist →
            </Link>
            <Link to="/register" className="btn btn-outline" style={{padding: '0.85rem 2rem', fontSize: '0.95rem'}}>
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section container">
      <h2 className="section-title">My <span>Wishlist</span> ❤️</h2>
      
      {loading ? (
        <div style={{textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
          <div className="spinner" style={{width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{fontSize: '1.2rem', color: 'var(--text-muted)'}}>Loading your favorites...</div>
        </div>
      ) : wishlistDesigns.length === 0 ? (
        <div style={{textAlign: 'center', padding: '6rem 2rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', marginTop: '2rem'}}>
          <div style={{fontSize: '4.5rem', marginBottom: '1.5rem', opacity: 0.9}}>🤍</div>
          <h3 style={{fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)'}}>Your wishlist is empty</h3>
          <p style={{color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem'}}>Looks like you haven't saved any designs yet. Explore our collection to find your next favorite blouse.</p>
          <Link to="/catalogue" className="btn btn-primary" style={{padding: '1rem 2.5rem'}}>Explore Catalogue</Link>
        </div>
      ) : (
        <div className="grid-3">
          {wishlistDesigns.map(design => (
            <div key={design.id} className="card" style={{display: 'block', textDecoration: 'none', position: 'relative'}}>
              {/* Remove from Wishlist Icon */}
              <button 
                onClick={() => removeFromWishlist(design.id)}
                className="wishlist-btn"
                style={{
                  position: 'absolute', top: '15px', right: '15px', background: 'white', border: 'none', 
                  borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  color: 'var(--error-color)',
                  fontSize: '1.3rem', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Remove from Wishlist"
              >
                ❤️
              </button>
              
              <Link to={`/design/${design.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="design-img-wrapper">
                  <img src={design.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'} alt={design.name} style={{width: '100%', height: '320px', objectFit: 'cover'}} />
                </div>
                <div style={{padding: '2rem'}}>
                  <span style={{color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase'}}>{design.category?.name || 'Category'}</span>
                  <h3 style={{margin: '0.8rem 0', fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--text-main)'}}>{design.name}</h3>
                  <p style={{fontSize: '1.2rem', color: 'var(--text-muted)'}}>₹{design.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Wishlist;
