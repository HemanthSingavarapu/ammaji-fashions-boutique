import { useState, useEffect } from 'react';

const COLOR_SWATCHES = [
  { name: 'Bridal Crimson', hex: '#9B2335', darkHex: '#6E1422', label: 'Crimson' },
  { name: 'Royal Emerald', hex: '#0F5132', darkHex: '#083320', label: 'Emerald' },
  { name: 'Peacock Blue', hex: '#1E3A8A', darkHex: '#122359', label: 'Peacock' },
  { name: 'Rani Magenta', hex: '#BE185D', darkHex: '#7E103E', label: 'Rani Pink' },
  { name: 'Imperial Gold', hex: '#B45309', darkHex: '#78350F', label: 'Mustard' },
  { name: 'Midnight Velvet', hex: '#1F2937', darkHex: '#111827', label: 'Black' },
  { name: 'Temple Rust', hex: '#C2410C', darkHex: '#7C2D12', label: 'Rust' },
  { name: 'Regal Purple', hex: '#6B21A8', darkHex: '#471470', label: 'Purple' }
];

function BlousePreview({
  frontNeck,
  backDesign,
  sleeveStyle,
  fabricType,
  padding,
  piping,
  activeView, // 'front' | 'back'
  onViewChange,
  selectedColor,
  onColorChange
}) {
  const [internalView, setInternalView] = useState('front');
  const [color, setColor] = useState(COLOR_SWATCHES[0]);

  const currentView = activeView || internalView;
  const setView = onViewChange || setInternalView;

  useEffect(() => {
    if (selectedColor) {
      const match = COLOR_SWATCHES.find(c => c.name === selectedColor || c.hex === selectedColor);
      if (match) setColor(match);
    }
  }, [selectedColor]);

  const handleSelectColor = (swatch) => {
    setColor(swatch);
    if (onColorChange) onColorChange(swatch.name);
  };

  const hasGoldPiping = piping === 'Gold Zari Contrast Piping';
  const pipingStroke = hasGoldPiping ? '#F59E0B' : 'rgba(255,255,255,0.4)';
  const pipingWidth = hasGoldPiping ? 3 : 1.5;

  // Render front neckline path
  const renderFrontNeck = () => {
    switch (frontNeck) {
      case 'Sweetheart Neck':
        return (
          <path
            d="M 155 110 C 172 135, 185 160, 200 170 C 215 160, 228 135, 245 110"
            fill="#FFE8D6"
            stroke={pipingStroke}
            strokeWidth={pipingWidth}
          />
        );
      case 'Royal Boat Neck':
        return (
          <path
            d="M 140 112 Q 200 134 260 112"
            fill="#FFE8D6"
            stroke={pipingStroke}
            strokeWidth={pipingWidth}
          />
        );
      case 'Deep V Plunge':
        return (
          <path
            d="M 165 110 L 200 185 L 235 110"
            fill="#FFE8D6"
            stroke={pipingStroke}
            strokeWidth={pipingWidth}
          />
        );
      case 'Queen Anne Cut':
        return (
          <path
            d="M 148 108 L 160 125 C 175 142, 186 160, 200 168 C 214 160, 225 142, 240 125 L 252 108"
            fill="#FFE8D6"
            stroke={pipingStroke}
            strokeWidth={pipingWidth}
          />
        );
      case 'High Mandarin Collar':
        return (
          <g>
            <path
              d="M 172 96 Q 200 102 228 96 L 228 116 Q 200 122 172 116 Z"
              fill={color.darkHex}
              stroke={pipingStroke}
              strokeWidth={pipingWidth}
            />
            {/* Front collar slit */}
            <line x1="200" y1="116" x2="200" y2="148" stroke={pipingStroke} strokeWidth={pipingWidth} />
            <circle cx="200" cy="122" r="3" fill="#F59E0B" />
          </g>
        );
      case 'Classic Deep Round':
      default:
        return (
          <path
            d="M 160 110 Q 200 178 240 110"
            fill="#FFE8D6"
            stroke={pipingStroke}
            strokeWidth={pipingWidth}
          />
        );
    }
  };

  // Render back neckline & artisan pattern
  const renderBackDesign = () => {
    switch (backDesign) {
      case 'Deep Back with Dori & Tassels':
        return (
          <g>
            {/* Deep back opening */}
            <path
              d="M 155 110 Q 200 215 245 110"
              fill="#FFE8D6"
              stroke={pipingStroke}
              strokeWidth={pipingWidth}
            />
            {/* Gold Dori String across shoulder blades */}
            <path
              d="M 158 125 Q 200 138 242 125"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            {/* Center tie knot */}
            <circle cx="200" cy="132" r="4" fill="#D97706" />
            {/* Hanging Tassels / Latkans */}
            <line x1="198" y1="135" x2="194" y2="165" stroke="#F59E0B" strokeWidth="2" />
            <polygon points="190,165 198,165 194,178" fill="#F59E0B" />
            <line x1="202" y1="135" x2="206" y2="170" stroke="#F59E0B" strokeWidth="2" />
            <polygon points="202,170 210,170 206,183" fill="#F59E0B" />
          </g>
        );
      case 'Backless with Multi-Strings':
        return (
          <g>
            {/* Fully open back */}
            <path
              d="M 150 110 Q 200 235 250 110"
              fill="#FFE8D6"
              stroke={pipingStroke}
              strokeWidth={pipingWidth}
            />
            {/* Triple criss-cross dori strings */}
            <line x1="156" y1="130" x2="244" y2="155" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="156" y1="155" x2="244" y2="130" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="165" y1="185" x2="235" y2="185" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="200" cy="185" r="3.5" fill="#D97706" />
          </g>
        );
      case 'Lotus / Drop Cutout':
        return (
          <g>
            {/* Upper clasp */}
            <path
              d="M 160 110 Q 200 125 240 110"
              fill={color.hex}
              stroke={pipingStroke}
              strokeWidth={pipingWidth}
            />
            <circle cx="200" cy="116" r="3" fill="#F59E0B" />
            {/* Central teardrop cutout */}
            <path
              d="M 200 130 C 180 150, 180 180, 200 195 C 220 180, 220 150, 200 130 Z"
              fill="#FFE8D6"
              stroke={pipingStroke}
              strokeWidth={pipingWidth}
            />
          </g>
        );
      case 'Potli Button Row':
        return (
          <g>
            <path
              d="M 165 110 Q 200 145 235 110"
              fill="#FFE8D6"
              stroke={pipingStroke}
              strokeWidth={pipingWidth}
            />
            {/* Center back seam */}
            <line x1="200" y1="135" x2="200" y2="230" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            {/* 7 Handcrafted Potli Buttons */}
            {[142, 155, 168, 181, 194, 207, 220].map((y, i) => (
              <circle key={i} cx="200" cy={y} r="3.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            ))}
          </g>
        );
      case 'Keyhole Window with Button':
        return (
          <g>
            <path
              d="M 165 108 Q 200 118 235 108"
              fill={color.hex}
              stroke={pipingStroke}
              strokeWidth={pipingWidth}
            />
            <circle cx="200" cy="113" r="3.5" fill="#F59E0B" />
            {/* Oval keyhole */}
            <ellipse cx="200" cy="155" rx="18" ry="26" fill="#FFE8D6" stroke={pipingStroke} strokeWidth={pipingWidth} />
          </g>
        );
      case 'Classic Modest U':
      default:
        return (
          <path
            d="M 165 110 Q 200 165 235 110"
            fill="#FFE8D6"
            stroke={pipingStroke}
            strokeWidth={pipingWidth}
          />
        );
    }
  };

  // Render sleeves
  const renderSleeves = () => {
    switch (sleeveStyle) {
      case 'Elbow Length with Border':
        return (
          <g>
            {/* Left sleeve down to elbow */}
            <polygon points="135,115 80,195 115,208 152,140" fill={color.hex} />
            {/* Left zari border band */}
            <polygon points="85,188 80,195 115,208 120,201" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            {/* Right sleeve down to elbow */}
            <polygon points="265,115 320,195 285,208 248,140" fill={color.hex} />
            {/* Right zari border band */}
            <polygon points="315,188 320,195 285,208 280,201" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          </g>
        );
      case 'Classic Short Sleeves (5")':
        return (
          <g>
            {/* Left short sleeve */}
            <polygon points="135,115 105,155 135,165 152,140" fill={color.hex} stroke={pipingStroke} strokeWidth={hasGoldPiping ? 2 : 0} />
            {/* Right short sleeve */}
            <polygon points="265,115 295,155 265,165 248,140" fill={color.hex} stroke={pipingStroke} strokeWidth={hasGoldPiping ? 2 : 0} />
          </g>
        );
      case 'Puff / Princess Balloon Sleeves':
        return (
          <g>
            {/* Left puffed shoulder */}
            <ellipse cx="120" cy="130" rx="22" ry="18" fill={color.darkHex} />
            <polygon points="105,145 125,160 145,140" fill={color.hex} />
            {/* Left snug cuff */}
            <line x1="105" y1="145" x2="125" y2="160" stroke="#F59E0B" strokeWidth="3" />
            {/* Right puffed shoulder */}
            <ellipse cx="280" cy="130" rx="22" ry="18" fill={color.darkHex} />
            <polygon points="295,145 275,160 255,140" fill={color.hex} />
            {/* Right snug cuff */}
            <line x1="295" y1="145" x2="275" y2="160" stroke="#F59E0B" strokeWidth="3" />
          </g>
        );
      case 'Full Length Sheer Sleeves':
        return (
          <g opacity="0.85">
            {/* Left long sleeve to wrist */}
            <polygon points="135,115 65,255 85,260 152,140" fill={color.darkHex} />
            <line x1="65" y1="255" x2="85" y2="260" stroke="#F59E0B" strokeWidth="3" />
            {/* Right long sleeve to wrist */}
            <polygon points="265,115 335,255 315,260 248,140" fill={color.darkHex} />
            <line x1="335" y1="255" x2="315" y2="260" stroke="#F59E0B" strokeWidth="3" />
          </g>
        );
      case 'Sleeveless / Wide Straps':
      default:
        // No outer sleeve extension; neat shoulder strap border
        return (
          <g>
            <path d="M 135 115 Q 148 135 152 145" stroke={pipingStroke} strokeWidth={pipingWidth} fill="none" />
            <path d="M 265 115 Q 252 135 248 145" stroke={pipingStroke} strokeWidth={pipingWidth} fill="none" />
          </g>
        );
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
      borderRadius: '16px',
      border: '1px solid #E5E7EB',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      marginBottom: '1.75rem'
    }}>
      {/* Header with View Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 8px #10B981'
          }}></span>
          <span style={{fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
            Interactive Visualizer
          </span>
        </div>

        {/* View Switcher Pills */}
        <div style={{
          display: 'inline-flex',
          background: '#F3F4F6',
          borderRadius: '24px',
          padding: '3px',
          border: '1px solid #E5E7EB'
        }}>
          <button
            type="button"
            onClick={() => setView('front')}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: currentView === 'front' ? '#9B2335' : 'transparent',
              color: currentView === 'front' ? '#fff' : '#4B5563',
              boxShadow: currentView === 'front' ? '0 2px 6px rgba(155, 35, 53, 0.3)' : 'none'
            }}
          >
            👗 Front View
          </button>
          <button
            type="button"
            onClick={() => setView('back')}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: '20px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: currentView === 'back' ? '#9B2335' : 'transparent',
              color: currentView === 'back' ? '#fff' : '#4B5563',
              boxShadow: currentView === 'back' ? '0 2px 6px rgba(155, 35, 53, 0.3)' : 'none'
            }}
          >
            🎀 Back View
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div style={{
        background: '#FAF5F0',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        minHeight: '280px',
        border: '1px solid #F3E8DF',
        overflow: 'hidden'
      }}>
        {/* Subtle Watermark Atelier Seal */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '12px',
          fontSize: '0.72rem',
          color: '#9CA3AF',
          fontWeight: 600,
          letterSpacing: '0.05em'
        }}>
          AMMAJI ATELIER • {currentView === 'front' ? 'FRONT' : 'BACK'}
        </div>

        {/* Feature Pill Tags */}
        <div style={{position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
          <span style={{
            fontSize: '0.72rem',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid #E5E7EB',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 600,
            color: '#374151'
          }}>
            {currentView === 'front' ? frontNeck : backDesign}
          </span>
          <span style={{
            fontSize: '0.7rem',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid #E5E7EB',
            padding: '2px 8px',
            borderRadius: '10px',
            color: '#6B7280'
          }}>
            {sleeveStyle}
          </span>
          {hasGoldPiping && (
            <span style={{
              fontSize: '0.68rem',
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              padding: '2px 8px',
              borderRadius: '10px',
              color: '#92400E',
              fontWeight: 600
            }}>
              ✨ Gold Zari Piping
            </span>
          )}
          {padding && currentView === 'front' && (
            <span style={{
              fontSize: '0.68rem',
              background: '#F3E8FF',
              border: '1px solid #E9D5FF',
              padding: '2px 8px',
              borderRadius: '10px',
              color: '#6B21A8',
              fontWeight: 600
            }}>
              Sewn-in Cups
            </span>
          )}
        </div>

        {/* Scalable Vector Artwork */}
        <svg
          viewBox="0 0 400 320"
          style={{width: '100%', maxWidth: '340px', height: 'auto', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.08))'}}
        >
          <defs>
            {/* Fabric gradient lighting */}
            <linearGradient id="fabricShading" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color.hex} />
              <stop offset="50%" stopColor={color.hex} />
              <stop offset="100%" stopColor={color.darkHex} />
            </linearGradient>

            {/* Mannequin neck gradient */}
            <linearGradient id="skinShade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE2D2" />
              <stop offset="100%" stopColor="#F5CAB2" />
            </linearGradient>
          </defs>

          {/* Mannequin neck and upper torso base */}
          <path
            d="M 175 40 Q 200 48 225 40 L 225 105 Q 200 115 175 105 Z"
            fill="url(#skinShade)"
            stroke="#ECC5B0"
            strokeWidth="1"
          />
          {/* Collarbones curve */}
          <path
            d="M 170 102 Q 200 112 230 102"
            fill="none"
            stroke="#E3B39B"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* Sleeves layer (rendered behind or with torso) */}
          {renderSleeves()}

          {/* Main Blouse Torso Body */}
          <path
            d="M 135 115 L 152 140 L 158 230 Q 200 238 242 230 L 248 140 L 265 115 Z"
            fill="url(#fabricShading)"
            stroke={color.darkHex}
            strokeWidth="1.5"
          />

          {/* Gold Bottom Hem Border */}
          <path
            d="M 158 230 Q 200 238 242 230"
            fill="none"
            stroke={pipingStroke}
            strokeWidth={pipingWidth}
          />

          {/* Front or Back Neck Cutout */}
          {currentView === 'front' ? renderFrontNeck() : renderBackDesign()}

          {/* Waist seam shaping lines */}
          <line x1="172" y1="185" x2="175" y2="230" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="228" y1="185" x2="225" y2="230" stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* Fabric Color Swatches Picker */}
      <div style={{marginTop: '1.25rem'}}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.6rem'
        }}>
          <span style={{fontSize: '0.8rem', fontWeight: 600, color: '#4B5563'}}>
            Fabric Color Preview:
          </span>
          <span style={{fontSize: '0.8rem', fontWeight: 700, color: color.hex}}>
            {color.name}
          </span>
        </div>

        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center'}}>
          {COLOR_SWATCHES.map((swatch) => {
            const isChosen = color.hex === swatch.hex;
            return (
              <button
                key={swatch.name}
                type="button"
                onClick={() => handleSelectColor(swatch)}
                title={swatch.name}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: swatch.hex,
                  border: isChosen ? '3px solid #FFFFFF' : '2px solid #E5E7EB',
                  outline: isChosen ? `2px solid ${swatch.hex}` : 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  transform: isChosen ? 'scale(1.15)' : 'scale(1)',
                  padding: 0
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BlousePreview;
