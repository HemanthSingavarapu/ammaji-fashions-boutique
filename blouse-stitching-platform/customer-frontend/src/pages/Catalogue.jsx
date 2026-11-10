import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SearchIcon, HeartIcon } from '../components/Icons';
import api from '../services/api';

function Catalogue() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      api.get('/wishlist').then(res => {
        setWishlist(res.data.map(d => d.id));
      }).catch(err => console.error(err));
    }
  }, [user]);

  const toggleWishlist = (id) => {
    if (!user) {
      alert("Please login to save designs to your wishlist!");
      return;
    }
    const isLiked = wishlist.includes(id);
    setWishlist(prev => isLiked ? prev.filter(item => item !== id) : [...prev, id]);
    
    if (isLiked) {
      api.delete(`/wishlist/${id}`).catch(err => console.error(err));
    } else {
      api.post(`/wishlist/${id}`).catch(err => console.error(err));
    }
  };

  useEffect(() => {
    setLoading(true);
    api.get('/designs')
      .then(res => {
        setDesigns(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching designs", err);
        setLoading(false);
      });
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'low', 'high'
  const [selectedCategory, setSelectedCategory] = useState('All');

  let filteredDesigns = designs.filter(design => 
    (selectedCategory === 'All' || design.category?.name === selectedCategory) &&
    (design.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (design.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (sortOrder === 'low') {
    filteredDesigns.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'high') {
    filteredDesigns.sort((a, b) => b.price - a.price);
  }

  const categories = ['All', ...Array.from(new Set(designs.map(d => d.category?.name).filter(Boolean)))];

  return (
    <div className="section container">
      <div style={{marginBottom: '2.5rem'}}>
        <h2 className="section-title" style={{textAlign: 'center', margin: '0 0 2rem 0'}}>The <span>Collection</span></h2>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem'}}>
          <div className="categories-filter" style={{maxWidth: '100%', flex: '1 1 350px', minWidth: '0', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem', scrollbarWidth: 'none'}}>
            {categories.map(cat => (
              <button 
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.5rem 1.2rem', 
                  borderRadius: '30px', 
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#222' : 'var(--border-color)',
                  backgroundColor: selectedCategory === cat ? '#f9f9f9' : 'transparent',
                  color: selectedCategory === cat ? '#111' : 'var(--text-muted)',
                  fontWeight: selectedCategory === cat ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'nowrap', flex: '1 1 280px'}}>
            <select 
              className="form-control" 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              style={{padding: '0.8rem 1rem', borderRadius: '30px', backgroundColor: 'var(--bg-surface-elevated)', width: 'auto'}}
            >
              <option value="newest">Newest</option>
              <option value="low">Price: Low</option>
              <option value="high">Price: High</option>
            </select>
            
            <div style={{position: 'relative', flex: 1, minWidth: '150px'}}>
              <span style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, display: 'flex', alignItems: 'center'}}>
                <SearchIcon size={16} />
              </span>
              <input 
                type="text" 
                className="form-control search-input" 
                placeholder="Search styles..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '30px', backgroundColor: 'var(--bg-surface-elevated)', width: '100%'}}
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
          <div className="spinner" style={{width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div style={{fontSize: '1.2rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', letterSpacing: '1px'}}>Loading atelier collection...</div>
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div style={{textAlign: 'center', padding: '6rem 2rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', marginTop: '2rem'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', marginBottom: '1.25rem'}}>
            <SearchIcon size={36} />
          </div>
          <h3 style={{fontSize: '1.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)'}}>No designs found</h3>
          <p style={{fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto'}}>Try adjusting your filters or clearing search terms.</p>
          <button onClick={() => {setSearchTerm(''); setSelectedCategory('All');}} className="btn btn-primary" style={{marginTop: '2rem'}}>Clear All Filters</button>
        </div>
      ) : (
        <div className="grid-3">
          {filteredDesigns.map(design => (
            <div key={design.id} className="card" style={{display: 'block', textDecoration: 'none', position: 'relative'}}>
              {/* Wishlist Icon Overlay */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(design.id);
                }}
                className="wishlist-btn"
                style={{
                  position: 'absolute', top: '15px', right: '15px', background: 'white', border: 'none', 
                  borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  color: wishlist.includes(design.id) ? 'var(--error-color)' : '#bbb',
                  transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title={wishlist.includes(design.id) ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <HeartIcon size={18} fill={wishlist.includes(design.id) ? 'var(--primary-color)' : 'none'} color="var(--primary-color)" />
              </button>
              
              <Link to={`/design/${design.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="design-img-wrapper" style={{height: '320px', overflow: 'hidden'}}>
                  <img 
                    src={design.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'} 
                    alt={design.name} 
                    style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease'}} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{padding: '1.75rem'}}>
                  <span style={{color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase'}}>
                    {design.category?.name || 'Designer'}
                  </span>
                  <h3 style={{margin: '0.6rem 0', fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--text-main)'}}>
                    {design.name}
                  </h3>
                  <p style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0}}>
                    ₹{design.price}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Catalogue;
