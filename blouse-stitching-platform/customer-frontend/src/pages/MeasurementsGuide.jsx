import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  TapeMeasureIcon, 
  SewingIcon, 
  SparklesIcon, 
  PhoneIcon, 
  ScissorsIcon, 
  DressIcon, 
  PackageIcon, 
  ShieldCheckIcon 
} from '../components/Icons';

export default function MeasurementsGuide() {
  const [activeTab, setActiveTab] = useState('measure');
  const navigate = useNavigate();

  return (
    <div className="container section" style={{maxWidth: '880px'}}>
      <div style={{marginBottom: '1rem'}}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline" 
          style={{padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'}}
        >
          <ArrowLeftIcon size={16} /> Back
        </button>
      </div>

      <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
        <span style={{fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '1px'}}>
          Boutique Knowledge Hub
        </span>
        <h2 className="section-title" style={{marginTop: '0.25rem', marginBottom: '0.5rem'}}>
          Tailoring & Fitting <span>Guide</span>
        </h2>
        <p style={{color: 'var(--text-muted)'}}>
          Everything you need for a flawless fit, accurate fabric estimation, and bridal blouse care.
        </p>
      </div>

      {/* Tab Navigation Buttons */}
      <div style={{display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap'}}>
        {[
          { key: 'measure', label: 'How to Measure', icon: <TapeMeasureIcon size={16} /> },
          { key: 'fabric', label: 'Fabric Requirements', icon: <SewingIcon size={16} /> },
          { key: 'care', label: 'Embroidery & Silk Care', icon: <SparklesIcon size={16} /> }
        ].map(tab => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '30px',
              border: activeTab === tab.key ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
              background: activeTab === tab.key ? 'var(--primary-color)' : '#fff',
              color: activeTab === tab.key ? '#fff' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.key ? '0 4px 12px rgba(106, 27, 61, 0.25)' : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: MEASUREMENTS */}
      {activeTab === 'measure' && (
        <div className="card" style={{padding: '3rem', border: '1px solid var(--border-color)'}}>
          <div style={{background: '#FEF3C7', border: '1px solid #FDE68A', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
            <SparklesIcon size={16} color="#B45309" /> <span><strong>Pro Tip:</strong> For best results, wear a well-fitting, non-padded bra while measuring, and keep the tape parallel to the floor without pulling it too tight.</span>
          </div>

          {[
            {
              num: 1,
              title: 'Bust / Chest',
              desc: 'Measure around the fullest part of your bust over your apex. Keep the tape parallel to the ground and relax your shoulders.',
              sample: 'Typical range: 32" to 46"'
            },
            {
              num: 2,
              title: 'Upper Waist / Underbust',
              desc: 'Measure around your rib cage directly below your bust, exactly where the blouse bottom hem band will sit.',
              sample: 'Typical range: 26" to 40"'
            },
            {
              num: 3,
              title: 'Across Shoulder',
              desc: 'Measure horizontally across your upper back from the tip of your left shoulder bone to the tip of your right shoulder bone.',
              sample: 'Typical range: 13.5" to 16.5"'
            },
            {
              num: 4,
              title: 'Blouse Length',
              desc: 'Measure vertically from the highest point of your shoulder near the neck seam down to the desired bottom hem.',
              sample: 'Standard: 13.5" (crop), 15" (modest)'
            },
            {
              num: 5,
              title: 'Armhole & Sleeve Length',
              desc: 'Wrap the tape around your armpit comfortably without restricting movement. For sleeve length, measure from shoulder tip down to desired end.',
              sample: 'Short: 5-6" | Elbow: 10-11" | Full: 20-22"'
            },
            {
              num: 6,
              title: 'Neck Depths (Front & Back)',
              desc: 'Measure diagonally from shoulder-neck intersection down to where you want the front or back neckline to drop.',
              sample: 'Modest: 6-7" | Deep Bridal: 8.5-10"'
            }
          ].map((item, idx) => (
            <div key={idx} style={{display: 'flex', gap: '1.75rem', alignItems: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: idx < 5 ? '1px solid var(--border-color)' : 'none'}}>
              <div style={{fontSize: '1.5rem', fontWeight: 800, backgroundColor: 'var(--bg-surface-elevated)', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'var(--primary-color)', flexShrink: 0}}>
                {item.num}
              </div>
              <div style={{flex: 1}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap'}}>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '0.35rem', color: 'var(--text-main)'}}>{item.title}</h3>
                  <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic'}}>{item.sample}</span>
                </div>
                <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0}}>{item.desc}</p>
              </div>
            </div>
          ))}

          <div style={{textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)'}}>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem'}}>
              Prefer having a master tailor assist you over a free voice call or WhatsApp?
            </p>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
              <a 
                href="https://wa.me/918341085629?text=Hi%20Ammaji%20Fashions!%20I%20would%20like%20to%20consult%20with%20the%20master%20tailor%20regarding%20blouse%20measurements%20and%20designs." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline" 
                style={{padding: '0.85rem 1.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}
              >
                <PhoneIcon size={16} /> Request Voice Call Consultation
              </a>
              <Link to="/studio" className="btn btn-primary" style={{padding: '0.85rem 2.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
                <ScissorsIcon size={16} /> Configure in Custom Studio
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FABRIC REQUIREMENTS */}
      {activeTab === 'fabric' && (
        <div className="card" style={{padding: '3rem', border: '1px solid var(--border-color)'}}>
          <h3 style={{fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1rem'}}>
            Saree Fabric Meter Guidelines
          </h3>
          <p style={{color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem'}}>
            Standard saree unstitched blouse pieces usually measure between 0.80 to 1.00 meter with a 44-inch fabric width. Use this chart to verify if your cloth is sufficient:
          </p>

          <table className="table" style={{width: '100%', marginBottom: '2rem'}}>
            <thead>
              <tr style={{borderBottom: '2px solid var(--border-color)'}}>
                <th style={{padding: '0.75rem', textAlign: 'left'}}>Sleeve Style</th>
                <th style={{padding: '0.75rem', textAlign: 'left'}}>Bust Size ≤ 38"</th>
                <th style={{padding: '0.75rem', textAlign: 'left'}}>Bust Size 40" - 44"</th>
                <th style={{padding: '0.75rem', textAlign: 'left'}}>Bust Size 44"+</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding: '0.75rem'}}><strong>Sleeveless / Cut-away</strong></td>
                <td style={{padding: '0.75rem'}}>0.70 Meter</td>
                <td style={{padding: '0.75rem'}}>0.80 Meter</td>
                <td style={{padding: '0.75rem'}}>0.85 Meter</td>
              </tr>
              <tr>
                <td style={{padding: '0.75rem'}}><strong>Short Sleeves (4" - 6")</strong></td>
                <td style={{padding: '0.75rem'}}>0.75 Meter</td>
                <td style={{padding: '0.75rem'}}>0.85 Meter</td>
                <td style={{padding: '0.75rem'}}>0.95 Meter</td>
              </tr>
              <tr>
                <td style={{padding: '0.75rem'}}><strong>Elbow Length (10" - 12")</strong></td>
                <td style={{padding: '0.75rem'}}>0.85 Meter</td>
                <td style={{padding: '0.75rem'}}>1.00 Meter</td>
                <td style={{padding: '0.75rem'}}>1.10 Meters</td>
              </tr>
              <tr>
                <td style={{padding: '0.75rem'}}><strong>Full Sleeves / Churi Sleeves</strong></td>
                <td style={{padding: '0.75rem'}}>1.10 Meters</td>
                <td style={{padding: '0.75rem'}}>1.25 Meters</td>
                <td style={{padding: '0.75rem'}}>1.40 Meters</td>
              </tr>
            </tbody>
          </table>

          <div style={{background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: '8px', fontSize: '0.9rem'}}>
            <strong>✨ Good to know:</strong> All boutique stitching orders automatically include 100% pre-washed pure cotton lining and interlining free of charge. You only need to send the outer shell saree material.
          </div>
        </div>
      )}

      {/* TAB 3: EMBROIDERY & SILK CARE */}
      {activeTab === 'care' && (
        <div className="card" style={{padding: '3rem', border: '1px solid var(--border-color)'}}>
          <h3 style={{fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1rem'}}>
            Preserving Maggam & Pure Silk Blouses
          </h3>
          <p style={{color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem'}}>
            Handcrafted blouses adorned with metallic zari, zardosi, stones, and beads require delicate handling to maintain their sparkle for years:
          </p>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
              <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(155, 35, 53, 0.08)', color: 'var(--primary-color)', flexShrink: 0}}>
                <DressIcon size={24} color="var(--primary-color)" />
              </div>
              <div>
                <strong style={{fontSize: '1.05rem'}}>Always Dry Clean Only</strong>
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0', lineHeight: 1.5}}>
                  Never machine wash or soak embroidered silk blouses in water. Water dissolves delicate sizing adhesives and tarnishes gold copper zari.
                </p>
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
              <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(155, 35, 53, 0.08)', color: 'var(--primary-color)', flexShrink: 0}}>
                <PackageIcon size={24} color="var(--primary-color)" />
              </div>
              <div>
                <strong style={{fontSize: '1.05rem'}}>Store in Breathable Muslin / Cotton Bags</strong>
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0', lineHeight: 1.5}}>
                  Avoid storing in plastic zip covers. Plastic traps moisture and causes real zari to blacken due to oxidation. Use breathable cotton or muslin wrapping.
                </p>
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
              <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(155, 35, 53, 0.08)', color: 'var(--primary-color)', flexShrink: 0}}>
                <ShieldCheckIcon size={24} color="var(--primary-color)" />
              </div>
              <div>
                <strong style={{fontSize: '1.05rem'}}>Iron on Reverse with a Cloth Barrier</strong>
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0', lineHeight: 1.5}}>
                  Never run a hot iron directly over beads, stones, or zardosi work. Always iron from the inside lining side with a cotton towel placed between the iron and the fabric.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
