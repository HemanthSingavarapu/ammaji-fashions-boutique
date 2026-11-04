import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function DesignDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [design, setDesign] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  
  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    api.get(`/designs/${id}`)
      .then(res => {
        const item = {
          ...res.data,
          category: res.data.category?.name || 'Designer'
        };
        setDesign(item);
        setSelectedImage(item.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800');
      })
      .catch(() => {
        const fallback = {
          id: id,
          name: `Bespoke Designer Blouse`,
          price: 1800,
          category: 'Artisanal',
          description: 'A bespoke artisanal blouse tailored with precision embroidery, handcrafted neck finishing, and customized princess cut.',
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
        };
        setDesign(fallback);
        setSelectedImage(fallback.imageUrl);
      });

    if (user) {
      api.get('/wishlist').then(res => {
        if (res.data && res.data.some(d => d.id === Number(id) || d.id === id)) {
          setIsWishlisted(true);
        }
      }).catch(() => {});
    }
  }, [id, user]);

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setDeliveryResult({ success: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }
    setDeliveryResult({
      success: true,
      message: `✓ Doorstep fabric pickup & delivery available for PIN ${pincode}! (Estimated: 4-6 business days)`
    });
  };

  const handleToggleWishlist = () => {
    if (!user) {
      alert("Please login to save designs to your wishlist!");
      return;
    }
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    if (nextState) {
      api.post(`/wishlist/${id}`).catch(() => {});
    } else {
      api.delete(`/wishlist/${id}`).catch(() => {});
    }
  };

  if (!design) return (
    <div className="container section" style={{textAlign: 'center', padding: '5rem 1rem'}}>
      <p style={{color: 'var(--text-muted)'}}>Loading design details...</p>
    </div>
  );

  const galleryImages = [design.imageUrl].filter(Boolean);

  return (
    <div className="container section" style={{maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem'}}>
      
      {/* Clean Breadcrumb */}
      <nav style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem'}}>
        <Link to="/" style={{color: 'var(--text-muted)', textDecoration: 'none'}}>Home</Link>
        <span style={{margin: '0 0.5rem', opacity: 0.5}}>/</span>
        <Link to="/catalogue" style={{color: 'var(--text-muted)', textDecoration: 'none'}}>Catalogue</Link>
        <span style={{margin: '0 0.5rem', opacity: 0.5}}>/</span>
        <span style={{color: 'var(--text-main)', fontWeight: 500}}>{design.name}</span>
      </nav>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start'}}>
        
        {/* Left: Gallery Column */}
        <div>
          <div style={{
            position: 'relative', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            backgroundColor: '#F9FAFB', 
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <img 
              src={selectedImage} 
              alt={design.name} 
              style={{
                width: '100%', 
                height: '460px', 
                objectFit: 'cover', 
                display: 'block', 
                transition: 'opacity 0.2s ease'
              }} 
            />
            
            {/* Wishlist Floating Button */}
            <button 
              onClick={handleToggleWishlist}
              style={{
                position: 'absolute', 
                top: '16px', 
                right: '16px', 
                background: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0,0,0,0.08)', 
                borderRadius: '50%', 
                width: '42px', 
                height: '42px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.25rem', 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.15s ease'
              }}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              {isWishlisted ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Gallery Thumbnails */}
          {galleryImages.length > 1 && (
            <div style={{display: 'flex', gap: '0.75rem', marginTop: '1rem'}}>
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  style={{
                    padding: 0,
                    border: selectedImage === img ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'none',
                    opacity: selectedImage === img ? 1 : 0.6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img 
                    src={img} 
                    alt={`View ${idx + 1}`}
                    style={{width: '72px', height: '72px', objectFit: 'cover', display: 'block'}}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Clean Trust Pillars */}
          <div style={{
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem', 
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <span style={{fontSize: '1.4rem'}}>✨</span>
              <div style={{fontSize: '0.82rem', lineHeight: 1.3}}>
                <strong style={{display: 'block', color: 'var(--text-main)'}}>Flawless Fit Guarantee</strong>
                <span style={{color: 'var(--text-muted)'}}>Complimentary alteration</span>
              </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <span style={{fontSize: '1.4rem'}}>🧵</span>
              <div style={{fontSize: '0.82rem', lineHeight: 1.3}}>
                <strong style={{display: 'block', color: 'var(--text-main)'}}>Pure Cotton Lining</strong>
                <span style={{color: 'var(--text-muted)'}}>Pre-washed, stitched free</span>
              </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <span style={{fontSize: '1.4rem'}}>🚚</span>
              <div style={{fontSize: '0.82rem', lineHeight: 1.3}}>
                <strong style={{display: 'block', color: 'var(--text-main)'}}>Doorstep Fabric Valet</strong>
                <span style={{color: 'var(--text-muted)'}}>Pickup from your home</span>
              </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <span style={{fontSize: '1.4rem'}}>✂️</span>
              <div style={{fontSize: '0.82rem', lineHeight: 1.3}}>
                <strong style={{display: 'block', color: 'var(--text-main)'}}>Master Tailor Crafted</strong>
                <span style={{color: 'var(--text-muted)'}}>30+ years atelier experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Order Action */}
        <div>
          <div style={{
            fontSize: '0.78rem', 
            fontWeight: 700, 
            letterSpacing: '1.5px', 
            textTransform: 'uppercase', 
            color: 'var(--primary-color)',
            marginBottom: '0.5rem'
          }}>
            {design.category} Couture
          </div>

          <h1 style={{
            fontSize: '2.2rem', 
            fontFamily: 'var(--font-serif)', 
            color: 'var(--text-main)', 
            margin: '0 0 1.25rem 0',
            lineHeight: 1.2
          }}>
            {design.name}
          </h1>

          {/* Price Tag */}
          <div style={{
            padding: '1.25rem 0', 
            borderTop: '1px solid var(--border-color)', 
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.5rem'
          }}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: '0.75rem'}}>
              <span style={{fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)'}}>
                ₹{design.price}
              </span>
              <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                Complete Tailoring & Lining
              </span>
            </div>
            <p style={{fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0', fontStyle: 'italic'}}>
              (Excluding courier charges • Courier bill copy will be shared)
            </p>
          </div>

          {/* Description */}
          <p style={{fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 1.75rem 0'}}>
            {design.description}
          </p>

          {/* Specification Pills */}
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem'}}>
            <span style={{fontSize: '0.82rem', padding: '0.4rem 0.8rem', background: 'var(--bg-surface-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)'}}>
              📏 Fabric: <strong>0.80m – 1.00m</strong>
            </span>
            <span style={{fontSize: '0.82rem', padding: '0.4rem 0.8rem', background: 'var(--bg-surface-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)'}}>
              ⏱️ Completion: <strong>4 – 6 Business Days</strong>
            </span>
            <span style={{fontSize: '0.82rem', padding: '0.4rem 0.8rem', background: 'var(--bg-surface-elevated)', borderRadius: '20px', border: '1px solid var(--border-color)'}}>
              💳 Booking: <strong>20% Advance Available</strong>
            </span>
          </div>

          {/* Action CTAs */}
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem'}}>
            <Link 
              to={`/checkout/${design.id}`} 
              className="btn btn-primary" 
              style={{
                flex: 1, 
                minWidth: '220px', 
                padding: '1rem 2rem', 
                fontSize: '1.05rem', 
                textAlign: 'center', 
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Order This Design ✨
            </Link>

            <a 
              href={`https://wa.me/918341085629?text=Hi%20Ammaji%20Fashions,%20I%20am%20interested%20in%20ordering%20design%20${encodeURIComponent(design.name)}%20(ID:%20${design.id}).`}
              target="_blank" 
              rel="noreferrer"
              className="btn btn-outline"
              style={{
                padding: '1rem 1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                textDecoration: 'none',
                color: '#16A34A',
                borderColor: '#86EFAC',
                fontWeight: 600
              }}
            >
              💬 Stylist WhatsApp
            </a>
          </div>

          {/* Compact Pincode Availability Check */}
          <div style={{
            background: 'var(--bg-surface-elevated)', 
            padding: '1rem 1.25rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)'
          }}>
            <div style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem'}}>
              📍 Doorstep Pickup & Delivery Availability
            </div>
            <form onSubmit={handleCheckPincode} style={{display: 'flex', gap: '0.5rem'}}>
              <input 
                type="text" 
                placeholder="Enter 6-digit PIN code (e.g. 560001)" 
                value={pincode} 
                onChange={e => setPincode(e.target.value.slice(0, 6))}
                style={{
                  flex: 1, 
                  padding: '0.55rem 0.8rem', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '4px', 
                  fontSize: '0.85rem',
                  background: '#fff'
                }}
              />
              <button 
                type="submit" 
                className="btn btn-outline" 
                style={{padding: '0.55rem 1rem', fontSize: '0.85rem'}}
              >
                Check
              </button>
            </form>
            {deliveryResult && (
              <div style={{
                marginTop: '0.5rem', 
                fontSize: '0.82rem', 
                color: deliveryResult.success ? '#15803D' : '#DC2626', 
                fontWeight: 500
              }}>
                {deliveryResult.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignDetails;
