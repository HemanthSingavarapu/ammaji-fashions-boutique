import { useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  // Fabric Calculator State
  const [calcBust, setCalcBust] = useState('34');
  const [calcSleeve, setCalcSleeve] = useState('elbow');
  
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Consultation Modal State
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultData, setConsultData] = useState({ 
    name: '', 
    phone: '', 
    topic: 'Custom Embroidery & Maggam Work',
    urgency: 'Standard (7-10 Days)',
    date: 'Tomorrow', 
    slot: '11:00 AM - 12:00 PM', 
    notes: '' 
  });
  const [consultBooked, setConsultBooked] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const getFabricRecommendation = () => {
    const bustNum = parseFloat(calcBust) || 34;
    if (calcSleeve === 'full') {
      return bustNum > 40 ? '1.25 meters' : '1.0 meter';
    } else if (calcSleeve === 'elbow') {
      return bustNum > 40 ? '1.0 meter' : '0.85 meter';
    } else if (calcSleeve === 'short') {
      return bustNum > 40 ? '0.85 meter' : '0.75 meter';
    } else {
      return '0.70 meter';
    }
  };

  const handleBookConsultation = (e) => {
    e.preventDefault();
    
    // Construct comprehensive WhatsApp message with all customer queries
    const ownerNumber = '918341085629';
    const message = 
`🌸 *AMMAJI FASHIONS - VOICE CALL & DESIGN CONSULTATION* 🌸
-----------------------------------------
👤 *Customer Name:* ${consultData.name}
📱 *Phone / WhatsApp:* ${consultData.phone}

📌 *Inquiry Topic:* ${consultData.topic}
⏱️ *Expected Stitching Time:* ${consultData.urgency}

📅 *Preferred Day:* ${consultData.date}
⏰ *Preferred Time Window:* ${consultData.slot}

💬 *Customer Query / Design Notes:*
"${consultData.notes ? consultData.notes.trim() : 'Customer requested a voice call to discuss designs and stitching time.'}"
-----------------------------------------
_Sent via Ammaji Fashions Customer Portal_`;

    const waUrl = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(message)}`;
    setLastWhatsAppUrl(waUrl);
    setConsultBooked(true);

    // Dispatch directly to boutique owner's WhatsApp
    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Could not auto-open WhatsApp:', err);
    }
  };

  const collections = [
    {
      title: 'Bridal Maggam & Zardosi',
      desc: 'Intricate gold thread, pearl motifs, and heavy bridal sleeve borders.',
      tag: 'Bridal Heritage',
      img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      price: 'From ₹2,800'
    },
    {
      title: 'Traditional Temple Silk',
      desc: 'Classic necklines, elbow sleeves, and contrast piping for silk sarees.',
      tag: 'Festive Classic',
      img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      price: 'From ₹1,800'
    },
    {
      title: 'Modern Deep-Back & Dori',
      desc: 'Contemporary sweetheart cuts, backless strings, and handmade tassels.',
      tag: 'Cocktail & Party',
      img: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800',
      price: 'From ₹1,500'
    }
  ];

  const faqs = [
    {
      q: "How does the doorstep fabric pickup work?",
      a: "When you place an order with 'Pickup & Drop', our logistics valet arrives at your address on your chosen day and time window to collect your unstitched fabric in a tamper-proof package. We log it directly into your Order ID timeline."
    },
    {
      q: "How much fabric do I need to send for my blouse?",
      a: "For standard short sleeves or sleeveless blouses, 0.75 to 0.85 meters is plenty. For elbow-length sleeves or heavy bridal embroidery designs, we recommend sending at least 1.0 meter of unstitched material."
    },
    {
      q: "What if the blouse doesn't fit properly after delivery?",
      a: "We provide a 100% Perfect Fit Guarantee. If any adjustment is needed, simply contact us within 7 days of delivery. We will arrange a free reverse pickup and our master tailor will alter it at zero additional cost."
    },
    {
      q: "Can I customize the neck depth and add padded cups?",
      a: "Yes! Use our Custom Studio to configure front necks, back cuts, and sleeves, or select premium add-ons like Padded Cups, Designer Latkans/Tassels, and Silk Lining during checkout."
    },
    {
      q: "What is your standard turnaround delivery time?",
      a: "Our standard tailoring process takes 4 to 6 business days from the moment your fabric reaches our workshop. You can track every stage in real-time on our Track Order page."
    }
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-content">
          <div style={{display: 'inline-block', background: 'rgba(255,255,255,0.18)', padding: '0.4rem 1.2rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)'}}>
            ✨ India’s Premier Bespoke Blouse Atelier
          </div>
          <h1 className="hero-title">Elegance tailored to your exact measurements.</h1>
          <p className="hero-subtitle">
            Discover exquisite bridal embroidery, traditional silk designs, and seamless doorstep tailoring crafted exclusively for you.
          </p>
          <div className="hero-cta-group" style={{marginTop: '2rem'}}>
            <div style={{display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.5rem'}}>
              <Link 
                to="/catalogue" 
                className="btn btn-primary" 
                style={{
                  padding: '1rem 2.4rem', 
                  fontSize: '1.05rem', 
                  boxShadow: '0 8px 25px rgba(106, 27, 61, 0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600
                }}
              >
                <span>Explore Collection</span>
                <span style={{fontSize: '1.2rem'}}>→</span>
              </Link>

              <Link 
                to="/studio" 
                className="btn btn-secondary" 
                style={{
                  padding: '1rem 2.4rem', 
                  fontSize: '1.05rem', 
                  boxShadow: '0 8px 25px rgba(212, 175, 55, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600
                }}
              >
                <span>🧵 Custom Blouse Studio</span>
              </Link>
            </div>

            {/* Stylist Consultation Quick Action Pill */}
            <div 
              onClick={() => setShowConsultModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.65rem 1.4rem',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#FFFFFF',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{fontSize: '1.05rem'}}>📞</span>
              <span>Questions on designs or stitching time? <strong style={{textDecoration: 'underline'}}>Book a Free Voice Call</strong> →</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{background: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.75rem 0'}}>
        <div className="container" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
            <span style={{fontSize: '2rem'}}>🪡</span>
            <div style={{textAlign: 'left'}}>
              <strong style={{display: 'block', fontSize: '0.95rem'}}>Master Artisans</strong>
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>30+ years crafting blouses</span>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
            <span style={{fontSize: '2rem'}}>✨</span>
            <div style={{textAlign: 'left'}}>
              <strong style={{display: 'block', fontSize: '0.95rem'}}>100% Fit Guarantee</strong>
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Free alterations if needed</span>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
            <span style={{fontSize: '2rem'}}>🛵</span>
            <div style={{textAlign: 'left'}}>
              <strong style={{display: 'block', fontSize: '0.95rem'}}>Doorstep Valet Pickup</strong>
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>We collect your fabric</span>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'}}>
            <span style={{fontSize: '2rem'}}>🔒</span>
            <div style={{textAlign: 'left'}}>
              <strong style={{display: 'block', fontSize: '0.95rem'}}>Secure 50% Advance</strong>
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Balance upon completion</span>
            </div>
          </div>
        </div>
      </section>

      {/* CURATED SIGNATURE COLLECTIONS */}
      <section className="section container">
        <div style={{textAlign: 'center', marginBottom: '3.5rem'}}>
          <span style={{fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '1px'}}>Curated Masterpieces</span>
          <h2 className="section-title" style={{marginTop: '0.25rem', marginBottom: '0.75rem'}}>Bespoke Signature <span>Styles</span></h2>
          <p style={{color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto'}}>
            Designed for weddings, grand celebrations, and festive gatherings.
          </p>
        </div>

        <div className="grid-3" style={{gap: '2rem'}}>
          {collections.map((c, i) => (
            <div key={i} className="card" style={{display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
              <div style={{height: '280px', overflow: 'hidden', position: 'relative'}}>
                <img 
                  src={c.img} 
                  alt={c.title} 
                  style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease'}}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <span style={{position: 'absolute', top: '15px', left: '15px', background: 'rgba(255,255,255,0.92)', color: 'var(--primary-color)', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 700}}>
                  {c.tag}
                </span>
              </div>
              <div style={{padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div>
                  <h3 style={{fontSize: '1.3rem', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-serif)'}}>{c.title}</h3>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0}}>{c.desc}</p>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)'}}>
                  <strong style={{color: 'var(--primary-color)', fontSize: '1.1rem'}}>{c.price}</strong>
                  <Link to="/catalogue" style={{color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'underline'}}>
                    View Styles →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{background: 'var(--bg-surface-elevated)'}}>
        <div className="container" style={{textAlign: 'center'}}>
          <h2 className="section-title">How It <span>Works</span></h2>
          <p style={{color: 'var(--text-muted)', maxWidth: '600px', margin: '-1rem auto 3rem auto'}}>
            Getting a bespoke designer blouse stitched has never been simpler.
          </p>

          <div className="grid-3" style={{gap: '2rem'}}>
            <div className="card" style={{padding: '2.5rem 1.5rem', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>👗</div>
              <h3 style={{fontSize: '1.25rem', marginBottom: '0.75rem'}}>1. Choose or Design</h3>
              <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6}}>
                Browse our curated gallery or customize your own neckline, back strings, and sleeves in our Custom Studio.
              </p>
            </div>
            <div className="card" style={{padding: '2.5rem 1.5rem', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📏</div>
              <h3 style={{fontSize: '1.25rem', marginBottom: '0.75rem'}}>2. Share Measurements</h3>
              <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6}}>
                Enter your measurements with our step-by-step guide or send an existing favorite sample blouse for reference.
              </p>
            </div>
            <div className="card" style={{padding: '2.5rem 1.5rem', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>✨</div>
              <h3 style={{fontSize: '1.25rem', marginBottom: '0.75rem'}}>3. Doorstep Delivery</h3>
              <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6}}>
                Our master tailors handcraft your blouse with premium double lining and deliver the immaculate fit to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FABRIC CALCULATOR SECTION */}
      <section className="section container" style={{maxWidth: '850px'}}>
        <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
          <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '1px'}}>Smart Fitting Assistant</span>
          <h2 className="section-title" style={{marginTop: '0.25rem', marginBottom: '0.5rem'}}>Fabric Requirement <span>Calculator</span></h2>
          <p style={{color: 'var(--text-muted)'}}>Wondering how many meters of saree fabric to cut for your tailor? Select your sizing below.</p>
        </div>

        <div className="card" style={{padding: '2.5rem', background: '#fff', border: '1px solid var(--border-color)'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexWrap: 'wrap'}}>
            <div>
              <label style={{display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem'}}>
                Your Bust Size (Inches)
              </label>
              <select 
                value={calcBust} 
                onChange={e => setCalcBust(e.target.value)}
                style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '1rem'}}
              >
                <option value="32">32 inches (XS)</option>
                <option value="34">34 inches (S)</option>
                <option value="36">36 inches (M)</option>
                <option value="38">38 inches (L)</option>
                <option value="40">40 inches (XL)</option>
                <option value="42">42 inches (XXL)</option>
                <option value="44">44+ inches (Plus)</option>
              </select>
            </div>

            <div>
              <label style={{display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem'}}>
                Desired Sleeve Length
              </label>
              <select 
                value={calcSleeve} 
                onChange={e => setCalcSleeve(e.target.value)}
                style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '1rem'}}
              >
                <option value="sleeveless">Sleeveless</option>
                <option value="short">Short Sleeves (4 - 6 inches)</option>
                <option value="elbow">Elbow Length (10 - 12 inches)</option>
                <option value="full">Full Sleeves (18 - 22 inches)</option>
              </select>
            </div>
          </div>

          <div style={{marginTop: '2rem', padding: '1.5rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'}}>
            <div>
              <div style={{fontSize: '0.85rem', color: '#166534', fontWeight: 600}}>RECOMMENDED UNSTITCHED FABRIC:</div>
              <div style={{fontSize: '1.75rem', fontWeight: 800, color: '#15803D', marginTop: '0.25rem'}}>
                {getFabricRecommendation()}
              </div>
              <div style={{fontSize: '0.8rem', color: '#166534', marginTop: '0.2rem'}}>
                Standard 44" width fabric. Pre-washed pure cotton lining will be supplied by us.
              </div>
            </div>
            <Link to="/studio" className="btn btn-primary" style={{padding: '0.75rem 1.5rem', fontSize: '0.95rem', textDecoration: 'none'}}>
              Customize in Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section" style={{background: 'var(--bg-surface-elevated)'}}>
        <div className="container">
          <h2 className="section-title">Customer <span>Reviews</span></h2>
          <p style={{textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem'}}>
            See what our beautiful brides and clients have to say about our custom tailoring and embroidery services.
          </p>
          
          <div className="grid-3">
            <div className="card" style={{padding: '2rem'}}>
              <div style={{color: '#F59E0B', fontSize: '1.4rem', marginBottom: '1rem'}}>★★★★★</div>
              <p style={{fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.6'}}>
                "The heavy maggam work on my bridal blouse was absolutely breathtaking. The fitting was perfect on the first try. Highly recommend!"
              </p>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}>P</div>
                <div>
                  <h4 style={{margin: '0', fontSize: '1rem'}}>Priya Sharma</h4>
                  <p style={{margin: '0', fontSize: '0.8rem', color: 'var(--text-muted)'}}>Verified Bridal Client</p>
                </div>
              </div>
            </div>
            
            <div className="card" style={{padding: '2rem'}}>
              <div style={{color: '#F59E0B', fontSize: '1.4rem', marginBottom: '1rem'}}>★★★★★</div>
              <p style={{fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.6'}}>
                "I loved the convenience of sending my measurements online and having fabric picked up from my doorstep. The tracking kept me updated at every step!"
              </p>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}>A</div>
                <div>
                  <h4 style={{margin: '0', fontSize: '1rem'}}>Anjali Desai</h4>
                  <p style={{margin: '0', fontSize: '0.8rem', color: 'var(--text-muted)'}}>Verified Client</p>
                </div>
              </div>
            </div>

            <div className="card" style={{padding: '2rem'}}>
              <div style={{color: '#F59E0B', fontSize: '1.4rem', marginBottom: '1rem'}}>★★★★★</div>
              <p style={{fontStyle: 'italic', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.6'}}>
                "The temple silk embroidery design is so neat and elegant. Excellent customer service over WhatsApp when I needed to adjust my sleeve length."
              </p>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold'}}>M</div>
                <div>
                  <h4 style={{margin: '0', fontSize: '1rem'}}>Meera Reddy</h4>
                  <p style={{margin: '0', fontSize: '0.8rem', color: 'var(--text-muted)'}}>Verified Client</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="section container" style={{maxWidth: '850px'}}>
        <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
          <h2 className="section-title">Frequently Asked <span>Questions</span></h2>
          <p style={{color: 'var(--text-muted)'}}>Everything you need to know about our boutique tailoring and delivery.</p>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="card" 
                style={{padding: '1.25rem 1.75rem', margin: 0, cursor: 'pointer', transition: 'all 0.2s'}}
                onClick={() => toggleFaq(index)}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h4 style={{margin: 0, fontSize: '1.05rem', color: isOpen ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: 600}}>
                    {faq.q}
                  </h4>
                  <span style={{fontSize: '1.3rem', color: 'var(--primary-color)', fontWeight: 'bold', marginLeft: '1rem'}}>
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
                {isOpen && (
                  <p style={{marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginBottom: 0}}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={{background: 'var(--primary-color)', color: 'white', padding: '4.5rem 1rem', textAlign: 'center'}}>
        <div className="container" style={{maxWidth: '750px'}}>
          <h2 style={{fontSize: '2.6rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem', color: 'white'}}>
            Ready for your flawless fitting?
          </h2>
          <p style={{fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.25rem', lineHeight: 1.6}}>
            Choose from 100+ designer styles in our collection or build your bespoke blouse from scratch in our Custom Studio.
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/catalogue" className="btn btn-secondary" style={{padding: '1rem 2.5rem', fontSize: '1.1rem'}}>
              Start Custom Order
            </Link>
            <Link to="/studio" className="btn btn-outline" style={{padding: '1rem 2rem', color: 'white', borderColor: 'white', fontSize: '1.1rem'}}>
              Open Custom Studio 🧵
            </Link>
          </div>
        </div>
      </section>

      {/* VOICE CONSULTATION & DESIGN INQUIRY MODAL */}
      {showConsultModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem', overflowY: 'auto'}}>
          <div className="card" style={{width: '560px', maxWidth: '100%', margin: 'auto', padding: '2rem 2.25rem', maxHeight: '90vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem'}}>
              <h3 style={{margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span>📞</span> Book Free Voice Call
              </h3>
              <button onClick={() => setShowConsultModal(false)} style={{background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)'}}>✕</button>
            </div>

            {consultBooked ? (
              <div style={{textAlign: 'center', padding: '1.5rem 0.5rem'}}>
                <div style={{fontSize: '3.5rem', color: '#16A34A', marginBottom: '0.75rem'}}>✓</div>
                <h4 style={{fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-main)'}}>Voice Call Request Sent to Ammaji Fashions!</h4>
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem'}}>
                  Your questions, design requirements, and preferred voice call slot have been prepared and shared directly with the Ammaji Fashions boutique owner on WhatsApp.
                  Our master tailor will call you on <strong>{consultData.date}</strong> during <strong>{consultData.slot}</strong>.
                </p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  <a 
                    href={lastWhatsAppUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-primary"
                    style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#25D366', borderColor: '#25D366', color: '#FFF', padding: '0.85rem'}}
                  >
                    <span>💬</span> Open WhatsApp Chat with Boutique
                  </a>
                  <button 
                    onClick={() => {
                      setConsultBooked(false);
                      setShowConsultModal(false);
                      setConsultData({ 
                        name: '', 
                        phone: '', 
                        topic: 'Custom Embroidery & Maggam Work',
                        urgency: 'Standard (7-10 Days)',
                        date: 'Tomorrow', 
                        slot: '11:00 AM - 12:00 PM', 
                        notes: '' 
                      });
                    }}
                    className="btn btn-outline"
                    style={{padding: '0.65rem'}}
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookConsultation}>
                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5}}>
                  Have questions about custom embroidery, stitching turnaround time, fabric meters, or neck styling? Book a complimentary voice call with our senior master artisan. All details will be shared directly with the boutique owner on WhatsApp!
                </p>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem'}}>Your Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Radhika Iyer"
                      value={consultData.name} 
                      onChange={e => setConsultData({...consultData, name: e.target.value})}
                      style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                    />
                  </div>

                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem'}}>WhatsApp / Phone *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="e.g. 9876543210"
                      value={consultData.phone} 
                      onChange={e => setConsultData({...consultData, phone: e.target.value})}
                      style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                    />
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem'}}>Inquiry Topic</label>
                    <select 
                      value={consultData.topic} 
                      onChange={e => setConsultData({...consultData, topic: e.target.value})}
                      style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                    >
                      <option value="Custom Embroidery & Maggam Work">Custom Embroidery & Maggam Work</option>
                      <option value="Stitching Turnaround Time & Urgent Delivery">Stitching Turnaround & Urgent Delivery</option>
                      <option value="Blouse Neck & Sleeve Styling">Blouse Neck & Sleeve Styling</option>
                      <option value="Fabric & Meter Requirements">Fabric & Meter Requirements</option>
                      <option value="Measurements & Perfect Fit Guidance">Measurements & Perfect Fit Guidance</option>
                      <option value="Pricing & Bridal Packages">Pricing & Bridal Packages</option>
                      <option value="General Tailoring Inquiry">General Tailoring Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem'}}>Expected Stitching Time</label>
                    <select 
                      value={consultData.urgency} 
                      onChange={e => setConsultData({...consultData, urgency: e.target.value})}
                      style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                    >
                      <option value="Standard (7-10 Days)">Standard (7-10 Days)</option>
                      <option value="Express / Urgent (3-5 Days)">Express / Urgent (3-5 Days)</option>
                      <option value="Super Express (Within 48 Hours)">Super Express (Within 48 Hours)</option>
                      <option value="Upcoming Wedding / Event Date">Upcoming Wedding / Event Date</option>
                      <option value="Flexible / Just Inquiring">Flexible / Just Inquiring</option>
                    </select>
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem'}}>Preferred Call Day</label>
                    <select 
                      value={consultData.date} 
                      onChange={e => setConsultData({...consultData, date: e.target.value})}
                      style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                    >
                      <option value="Today (Earliest Available)">Today (Earliest Available)</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="Day After Tomorrow">Day After Tomorrow</option>
                      <option value="This Weekend">This Weekend</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem'}}>Preferred Time Window</label>
                    <select 
                      value={consultData.slot} 
                      onChange={e => setConsultData({...consultData, slot: e.target.value})}
                      style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                    >
                      <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (02:00 PM - 04:00 PM)">Afternoon (02:00 PM - 04:00 PM)</option>
                      <option value="Evening (06:00 PM - 08:00 PM)">Evening (06:00 PM - 08:00 PM)</option>
                      <option value="Anytime Convenient">Anytime Convenient</option>
                    </select>
                  </div>
                </div>

                <div style={{marginBottom: '1.25rem'}}>
                  <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem'}}>
                    Ask Anything! (Designs, Fabric, Urgency, Delivery Date...)
                  </label>
                  <textarea 
                    rows="3"
                    placeholder="e.g. I need custom zardosi embroidery for my sister's wedding next Friday. Can you deliver in 4 days? How many meters of fabric should I buy?..."
                    value={consultData.notes} 
                    onChange={e => setConsultData({...consultData, notes: e.target.value})}
                    style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'vertical'}}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{width: '100%', padding: '0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
                >
                  <span>📞</span> Confirm & Share with Owner on WhatsApp →
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
