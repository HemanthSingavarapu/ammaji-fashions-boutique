import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const customSummary = `${frontNeck} front, ${backDesign} back, ${sleeveStyle}. Fabric: ${fabricType}. Lining: ${lining}${padding ? ', with padded cups' : ''}${piping ? ', with ' + piping : ''}.`;
    
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
                    onClick={() => setFrontNeck(opt.name)}
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
                    onClick={() => setBackDesign(opt.name)}
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

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem'}}>
                Your Unstitched Fabric Type
              </label>
              <select 
                value={fabricType} 
                onChange={e => setFabricType(e.target.value)}
                style={{width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.95rem'}}
              >
                {fabricOptions.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
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

        {/* Right: Live Quote & Order Sticky Summary */}
        <div style={{flex: '1', minWidth: '320px', position: 'sticky', top: '100px'}}>
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
