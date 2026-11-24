import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlousePreview from '../components/BlousePreview';
import { 
  ArrowLeftIcon, 
  HeartIcon, 
  CrownIcon, 
  SewingIcon, 
  ZapIcon, 
  DiamondIcon, 
  DressIcon, 
  RibbonIcon, 
  SparklesIcon, 
  KeyIcon, 
  MoonIcon, 
  RulerIcon, 
  ScissorsIcon 
} from '../components/Icons';

function CustomStudio() {
  const navigate = useNavigate();

  // Selection states
  const [frontNeck, setFrontNeck] = useState('Sweetheart Neck');
  const [backDesign, setBackDesign] = useState('Deep Back with Dori & Tassels');
  const [sleeveStyle, setSleeveStyle] = useState('Elbow Length with Border');
  const [fabricType, setFabricType] = useState('Kanjeevaram / Banarasi Silk');
  const [padding, setPadding] = useState(true);
  const [lining, setLining] = useState('Double Pre-Washed Cotton');
  const [piping, setPiping] = useState('Gold Zari Contrast Piping');

  // Interactive Visualizer state
  const [previewView, setPreviewView] = useState('front');
  const [previewColor, setPreviewColor] = useState('Bridal Crimson');

  const basePrice = 1200;

  const frontNeckOptions = [
    { name: 'Sweetheart Neck', price: 150, desc: 'Flattering heart-shaped curve, ideal for bridal & party wear', icon: <HeartIcon size={20} /> },
    { name: 'Royal Boat Neck', price: 120, desc: 'High elegant horizontal neck drop, perfect for silk sarees', icon: <CrownIcon size={20} /> },
    { name: 'Classic Deep Round', price: 0, desc: 'Timeless traditional round cut with comfortable fit', icon: <SewingIcon size={20} /> },
    { name: 'Deep V Plunge', price: 100, desc: 'Modern sleek neckline, lengthens neckline appearance', icon: <ZapIcon size={20} /> },
    { name: 'Queen Anne Cut', price: 220, desc: 'Regal vintage neckline with scalloped shoulders', icon: <DiamondIcon size={20} /> },
    { name: 'High Mandarin Collar', price: 250, desc: 'Contemporary bandhgala neck with front hook closure', icon: <DressIcon size={20} /> }
  ];

  const backDesignOptions = [
    { name: 'Deep Back with Dori & Tassels', price: 200, desc: 'Dramatic deep U back tied with custom handmade tassels', icon: <RibbonIcon size={20} /> },
    { name: 'Backless with Multi-Strings', price: 350, desc: 'Bold crisscross string closure with secure side boning', icon: <SparklesIcon size={20} /> },
    { name: 'Lotus / Drop Cutout', price: 300, desc: 'Artistic teardrop or temple cutout in center of back', icon: <DiamondIcon size={20} /> },
    { name: 'Potli Button Row', price: 250, desc: 'Hand-sewn fabric potli buttons running down center back', icon: <SewingIcon size={20} /> },
    { name: 'Keyhole Window with Button', price: 180, desc: 'Chic oval keyhole opening with upper loop closure', icon: <KeyIcon size={20} /> },
    { name: 'Classic Modest U', price: 0, desc: 'Standard 7-8 inch modest back drop for everyday elegance', icon: <MoonIcon size={20} /> }
  ];

  const sleeveOptions = [
    { name: 'Elbow Length with Border', price: 200, desc: 'Trending 10-11 inch sleeve highlighting saree zari border', icon: <RulerIcon size={20} /> },
    { name: 'Classic Short Sleeves (5")', price: 80, desc: 'Traditional short sleeve with neat hem stitching', icon: <ScissorsIcon size={20} /> },
    { name: 'Sleeveless / Wide Straps', price: 0, desc: 'Clean modern sleeveless finish with concealed piping', icon: <DressIcon size={20} /> },
    { name: 'Puff / Princess Balloon Sleeves', price: 320, desc: 'Vintage pleated gathered shoulder with snug cuff', icon: <SparklesIcon size={20} /> },
    { name: 'Full Length Sheer Sleeves', price: 400, desc: 'Elegant translucent net/organza sleeve with wrist cuff', icon: <RulerIcon size={20} /> }
  ];

  const fabricOptions = [
    'Kanjeevaram / Banarasi Silk',
    'Raw Silk / Chanderi',
    'Pure Organza / Tissue Silk',
    'Velvet with Zari Borders',
    'Handloom Cotton / Linen'
  ];

  const fabricSwatchList = [
    {
      id: 'Kanjeevaram / Banarasi Silk',
      name: 'Banarasi & Kanjeevaram Silk',
      tag: 'Bridal Brocade',
      feel: 'Opulent woven gold zari buttas with metallic luster',
      bestFor: 'Grand Weddings & Heavy Silk Sarees',
      sheen: 'High Gold Sheen',
      textureType: 'brocade',
      baseHex: '#78350F',
      accentHex: '#F59E0B'
    },
    {
      id: 'Raw Silk / Chanderi',
      name: 'Raw Silk & Chanderi',
      tag: 'Crisp Slub Sheen',
      feel: 'Natural organic slub grain with rich dual-tone satin sheen',
      bestFor: 'Festive Ceremonies & Temple Drapes',
      sheen: 'Textured Luster',
      textureType: 'rawSilk',
      baseHex: '#831843',
      accentHex: '#F472B6'
    },
    {
      id: 'Pure Organza / Tissue Silk',
      name: 'Pure Organza & Tissue Silk',
      tag: 'Airy Translucency',
      feel: 'Gossamer translucent sheer weave with crystal shimmer',
      bestFor: 'Modern Cocktails & Pastel Floral Sarees',
      sheen: 'Prismatic Shimmer',
      textureType: 'organza',
      baseHex: '#312E81',
      accentHex: '#818CF8'
    },
    {
      id: 'Velvet with Zari Borders',
      name: 'Royal Velvet with Zari',
      tag: 'Plush Matte Depth',
      feel: 'Ultra-soft deep light-absorbing pile with royal warmth',
      bestFor: 'Winter Receptions & Grand Lehengas',
      sheen: 'Deep Matte Pile',
      textureType: 'velvet',
      baseHex: '#18181B',
      accentHex: '#FBBF24'
    },
    {
      id: 'Handloom Cotton / Linen',
      name: 'Handloom Cotton & Linen',
      tag: 'Artisanal Weave',
      feel: 'Pure breathable cross-woven yarns with structured crisp fall',
      bestFor: 'Daily Office Elegance & Summer Comfort',
      sheen: 'Natural Matte',
      textureType: 'cotton',
      baseHex: '#064E3B',
      accentHex: '#34D399'
    }
  ];

  // Pricing calculation
  const getSelectedPrice = (list, selectedName) => {
    const item = list.find(o => o.name === selectedName);
    return item ? item.price : 0;
  };

  const frontPrice = getSelectedPrice(frontNeckOptions, frontNeck);
  const backPrice = getSelectedPrice(backDesignOptions, backDesign);
  const sleevePrice = getSelectedPrice(sleeveOptions, sleeveStyle);
  const paddingPrice = padding ? 250 : 0;
  const pipingPrice = piping === 'Gold Zari Contrast Piping' ? 150 : 0;

  const totalCalculated = basePrice + frontPrice + backPrice + sleevePrice + paddingPrice + pipingPrice;

  const handleProceedToOrder = () => {
    const customSummary = `${frontNeck} front, ${backDesign} back, ${sleeveStyle}. Fabric: ${fabricType} (Color: ${previewColor}). Lining: ${lining}${padding ? ', with padded cups' : ''}${piping ? ', with ' + piping : ''}.`;
    
    navigate('/checkout/custom', {
      state: {
        customDesignName: `Bespoke Blouse: ${frontNeck} & ${backDesign}`,
        price: totalCalculated,
        customDesignDetails: customSummary
      }
    });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="section container" style={{maxWidth: '1100px'}}>
      <div style={{marginBottom: '1.5rem'}}>
        <button 
          onClick={handleBack} 
          className="btn btn-outline" 
          style={{padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'}}
        >
          <ArrowLeftIcon size={16} /> Back
        </button>
      </div>

      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <span style={{fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '1.5px'}}>
          Bespoke Atelier Configurator
        </span>
        <h1 style={{fontSize: '3rem', margin: '0.5rem 0 1rem 0', fontFamily: 'var(--font-serif)'}}>
          Design Your <span>Dream Blouse</span>
        </h1>
        <p style={{color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem'}}>
          Configure your neckline, back pattern, sleeves, and artisan details. Our master tailors will handcraft your design to perfection.
        </p>
      </div>

      <div style={{display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start'}}>
        {/* Left: Customization Options Column */}
        <div style={{flex: '1.5', minWidth: '340px', display: 'flex', flexDirection: 'column', gap: '2.5rem'}}>
          
          {/* Step 1: Front Neck */}
          <div className="card" style={{padding: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem'}}>
              <h3 style={{fontSize: '1.25rem', margin: 0}}>1. Choose Front Neckline</h3>
              <span style={{fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600}}>
                {frontPrice > 0 ? `+ ₹${frontPrice}` : 'Included'}
              </span>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem'}}>
              {frontNeckOptions.map(opt => {
                const isSelected = frontNeck === opt.name;
                return (
                  <div 
                    key={opt.name}
                    onClick={() => {
                      setFrontNeck(opt.name);
                      setPreviewView('front');
                    }}
                    style={{
                      border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      cursor: 'pointer',
                      background: isSelected ? '#FDF4F6' : '#fff',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(155, 35, 53, 0.12)' : 'rgba(0,0,0,0.04)',
                      color: isSelected ? 'var(--primary-color)' : 'var(--text-muted)',
                      flexShrink: 0
                    }}>
                      {opt.icon}
                    </span>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                        <strong style={{fontSize: '0.95rem', color: isSelected ? 'var(--primary-color)' : 'var(--text-main)'}}>{opt.name}</strong>
                        {opt.price > 0 && <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>+₹{opt.price}</span>}
                      </div>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', lineHeight: 1.4}}>{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Back Pattern */}
          <div className="card" style={{padding: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem'}}>
              <h3 style={{fontSize: '1.25rem', margin: 0}}>2. Choose Back Cut & Strings</h3>
              <span style={{fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600}}>
                {backPrice > 0 ? `+ ₹${backPrice}` : 'Included'}
              </span>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem'}}>
              {backDesignOptions.map(opt => {
                const isSelected = backDesign === opt.name;
                return (
                  <div 
                    key={opt.name}
                    onClick={() => {
                      setBackDesign(opt.name);
                      setPreviewView('back');
                    }}
                    style={{
                      border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      cursor: 'pointer',
                      background: isSelected ? '#FDF4F6' : '#fff',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(155, 35, 53, 0.12)' : 'rgba(0,0,0,0.04)',
                      color: isSelected ? 'var(--primary-color)' : 'var(--text-muted)',
                      flexShrink: 0
                    }}>
                      {opt.icon}
                    </span>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                        <strong style={{fontSize: '0.95rem', color: isSelected ? 'var(--primary-color)' : 'var(--text-main)'}}>{opt.name}</strong>
                        {opt.price > 0 && <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>+₹{opt.price}</span>}
                      </div>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', lineHeight: 1.4}}>{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Sleeves Style */}
          <div className="card" style={{padding: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem'}}>
              <h3 style={{fontSize: '1.25rem', margin: 0}}>3. Choose Sleeves Pattern</h3>
              <span style={{fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600}}>
                {sleevePrice > 0 ? `+ ₹${sleevePrice}` : 'Included'}
              </span>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.9rem'}}>
              {sleeveOptions.map(opt => {
                const isSelected = sleeveStyle === opt.name;
                return (
                  <div 
                    key={opt.name}
                    onClick={() => setSleeveStyle(opt.name)}
                    style={{
                      border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      cursor: 'pointer',
                      background: isSelected ? '#FDF4F6' : '#fff',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}
                  >
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(155, 35, 53, 0.12)' : 'rgba(0,0,0,0.04)',
                      color: isSelected ? 'var(--primary-color)' : 'var(--text-muted)',
                      flexShrink: 0
                    }}>
                      {opt.icon}
                    </span>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                        <strong style={{fontSize: '0.95rem', color: isSelected ? 'var(--primary-color)' : 'var(--text-main)'}}>{opt.name}</strong>
                        {opt.price > 0 && <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>+₹{opt.price}</span>}
                      </div>
                      <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', lineHeight: 1.4}}>{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Saree Fabric & Extra Finishes */}
          <div className="card" style={{padding: '2rem'}}>
            <h3 style={{fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem'}}>
              4. Saree Fabric Type & Finishing
            </h3>

            {/* Feature 2: Interactive Luxury Fabric Swatch Cards */}
            <style>{`
              @keyframes fabricCardShimmerSweep {
                0% { transform: translateX(-150%) skewX(-20deg); }
                100% { transform: translateX(250%) skewX(-20deg); }
              }
              .fabric-swatch-card {
                transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
                cursor: pointer;
              }
              .fabric-swatch-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.08);
              }
              .fabric-swatch-card:hover .fabric-shimmer-sweep {
                animation: fabricCardShimmerSweep 1.2s infinite ease-in-out;
              }
            `}</style>

            <div style={{marginBottom: '2rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem'}}>
                <label style={{display: 'block', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)'}}>
                  ✨ Luxury Fabric Swatch Selector (Touch & Tactile Preview)
                </label>
                <span style={{fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600}}>
                  Selected: {fabricType}
                </span>
              </div>
              <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-0.3rem', marginBottom: '1rem'}}>
                Select the fabric of your unstitched saree or tailored material. High-res micro-texture and sheen are reflected live in the 2D visualizer.
              </p>

              <div style={{
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '1rem'
              }}>
                {fabricSwatchList.map((swatch) => {
                  const isSelected = fabricType === swatch.id;

                  return (
                    <div 
                      key={swatch.id}
                      onClick={() => setFabricType(swatch.id)}
                      className="fabric-swatch-card"
                      style={{
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: isSelected ? '#FFFDF8' : '#FFFFFF',
                        boxShadow: isSelected ? '0 4px 16px rgba(155, 35, 53, 0.15)' : 'none',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Micro-Texture Visual Swatch Box */}
                      <div style={{
                        height: '84px',
                        position: 'relative',
                        background: swatch.baseHex,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        
                        {/* High-Res Micro-Texture SVG Pattern */}
                        {swatch.textureType === 'brocade' && (
                          <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
                            <defs>
                              <pattern id={`brocade-${swatch.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 10 2 Q 14 10 18 10 Q 14 10 10 18 Q 6 10 2 10 Q 6 10 10 2 Z" fill="none" stroke="#F59E0B" strokeWidth="0.8" />
                                <circle cx="10" cy="10" r="1.5" fill="#FDE047" />
                                <line x1="0" y1="0" x2="20" y2="20" stroke="rgba(245,158,11,0.2)" strokeWidth="0.5" />
                                <line x1="20" y1="0" x2="0" y2="20" stroke="rgba(245,158,11,0.2)" strokeWidth="0.5" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill={`url(#brocade-${swatch.id})`} />
                          </svg>
                        )}

                        {swatch.textureType === 'rawSilk' && (
                          <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
                            <defs>
                              <pattern id={`rawsilk-${swatch.id}`} width="28" height="10" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="2" x2="16" y2="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="3 3" />
                                <line x1="10" y1="6" x2="28" y2="6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="4 2" />
                                <line x1="0" y1="9" x2="28" y2="9" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill={`url(#rawsilk-${swatch.id})`} />
                          </svg>
                        )}

                        {swatch.textureType === 'organza' && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, rgba(199,210,254,0.2) 60%, transparent 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
                              <defs>
                                <pattern id={`organza-${swatch.id}`} width="7" height="7" patternUnits="userSpaceOnUse">
                                  <rect width="7" height="7" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
                                  <circle cx="3.5" cy="3.5" r="0.6" fill="rgba(255,255,255,0.7)" />
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill={`url(#organza-${swatch.id})`} />
                            </svg>
                          </div>
                        )}

                        {swatch.textureType === 'velvet' && (
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(circle at 45% 40%, rgba(63,63,70,0.9) 0%, rgba(24,24,27,1) 75%)',
                            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                          }}>
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: 'linear-gradient(90deg, #D97706, #FBBF24, #D97706)'
                            }} />
                          </div>
                        )}

                        {swatch.textureType === 'cotton' && (
                          <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
                            <defs>
                              <pattern id={`cotton-${swatch.id}`} width="6" height="6" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                                <line x1="3" y1="0" x2="3" y2="6" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill={`url(#cotton-${swatch.id})`} />
                          </svg>
                        )}

                        {/* Animated Fabric Shimmer Sweep */}
                        <div 
                          className="fabric-shimmer-sweep"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '50%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            pointerEvents: 'none',
                            transform: 'translateX(-150%) skewX(-20deg)',
                            animation: isSelected ? 'fabricCardShimmerSweep 2.8s infinite ease-in-out' : 'none'
                          }}
                        />

                        {/* Top Overlay Badges */}
                        <div style={{position: 'absolute', top: '8px', left: '8px'}}>
                          <span style={{
                            background: 'rgba(0,0,0,0.65)',
                            backdropFilter: 'blur(4px)',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.3px'
                          }}>
                            {swatch.tag}
                          </span>
                        </div>

                        <div style={{position: 'absolute', top: '8px', right: '8px'}}>
                          <span style={{
                            background: swatch.accentHex,
                            color: swatch.textureType === 'organza' ? '#1E1B4B' : '#FFFFFF',
                            fontSize: '0.65rem',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontWeight: 700
                          }}>
                            {swatch.sheen}
                          </span>
                        </div>
                      </div>

                      {/* Card Content & Tactile Description */}
                      <div style={{padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between'}}>
                        <div>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem'}}>
                            <h4 style={{margin: 0, fontSize: '0.98rem', fontFamily: 'var(--font-serif)', color: 'var(--text-main)'}}>
                              {swatch.name}
                            </h4>
                            {isSelected && (
                              <span style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'var(--primary-color)',
                                color: '#FFFFFF',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 800
                              }}>
                                ✓
                              </span>
                            )}
                          </div>

                          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', lineHeight: 1.4}}>
                            {swatch.feel}
                          </p>
                        </div>

                        <div>
                          <div style={{fontSize: '0.72rem', color: '#B45309', fontWeight: 600, background: '#FEF3C7', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '0.6rem'}}>
                            Ideal for: {swatch.bestFor}
                          </div>

                          <div style={{
                            paddingTop: '0.5rem', 
                            borderTop: isSelected ? '1px solid #FDE68A' : '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.78rem'
                          }}>
                            {isSelected ? (
                              <span style={{color: 'var(--primary-color)', fontWeight: 700}}>
                                ✓ Active in Visualizer
                              </span>
                            ) : (
                              <span style={{color: 'var(--text-muted)'}}>
                                Click to preview texture →
                              </span>
                            )}
                            <span style={{fontSize: '0.72rem', color: '#9CA3AF'}}>Included</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: padding ? '#FDF4F6' : '#fff'}}>
                <input type="checkbox" checked={padding} onChange={e => setPadding(e.target.checked)} style={{width: '18px', height: '18px'}} />
                <div>
                  <strong style={{fontSize: '0.9rem'}}>Sewn-in Padded Cups</strong>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Smooth seamless shaping (+ ₹250)</div>
                </div>
              </label>

              <label style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: piping ? '#FDF4F6' : '#fff'}}>
                <input type="checkbox" checked={piping === 'Gold Zari Contrast Piping'} onChange={e => setPiping(e.target.checked ? 'Gold Zari Contrast Piping' : 'Self Fabric Piping')} style={{width: '18px', height: '18px'}} />
                <div>
                  <strong style={{fontSize: '0.9rem'}}>Gold Zari Contrast Piping</strong>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Highlights neck & edges (+ ₹150)</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Visual Preview & Order Sticky Summary */}
        <div style={{flex: '1', minWidth: '320px', position: 'sticky', top: '90px'}}>
          
          {/* Feature 4: Interactive 2D Blouse Visualizer */}
          <BlousePreview
            frontNeck={frontNeck}
            backDesign={backDesign}
            sleeveStyle={sleeveStyle}
            fabricType={fabricType}
            padding={padding}
            piping={piping}
            activeView={previewView}
            onViewChange={setPreviewView}
            selectedColor={previewColor}
            onColorChange={setPreviewColor}
          />

          <div className="card" style={{padding: '2.5rem', background: '#fff', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)'}}>
            <div style={{display: 'inline-block', background: 'var(--bg-surface-elevated)', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px', marginBottom: '1rem'}}>
              BESPOKE QUOTE SUMMARY
            </div>

            <h3 style={{fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1.5rem'}}>
              Your Tailored Creation
            </h3>

            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: 'var(--text-muted)'}}>Base Tailoring & French Seams:</span>
                <strong>₹{basePrice}</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: 'var(--text-muted)'}}>Front: {frontNeck}:</span>
                <strong>+ ₹{frontPrice}</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: 'var(--text-muted)'}}>Back: {backDesign}:</span>
                <strong>+ ₹{backPrice}</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: 'var(--text-muted)'}}>Sleeves: {sleeveStyle}:</span>
                <strong>+ ₹{sleevePrice}</strong>
              </div>
              {padding && (
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: 'var(--text-muted)'}}>Padded Cups:</span>
                  <strong>+ ₹{paddingPrice}</strong>
                </div>
              )}
              {piping === 'Gold Zari Contrast Piping' && (
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span style={{color: 'var(--text-muted)'}}>Zari Contrast Piping:</span>
                  <strong>+ ₹{pipingPrice}</strong>
                </div>
              )}
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem'}}>
              <span style={{fontSize: '1.1rem', fontWeight: 600}}>Total Stitching Fee:</span>
              <span style={{fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)'}}>₹{totalCalculated}</span>
            </div>

            <div style={{background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem'}}>
              ✓ Includes doorstep fabric pickup valet<br />
              ✓ 100% Perfect Fit Guarantee with free alterations<br />
              ✓ 50% advance on checkout, balance after completion
            </div>

            <button 
              onClick={handleProceedToOrder}
              className="btn btn-primary" 
              style={{width: '100%', padding: '1rem', fontSize: '1.1rem', letterSpacing: '0.5px'}}
            >
              Order This Custom Blouse →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomStudio;
