import React from 'react';

export default function WhatsAppWidget() {
  return (
    <a 
      href="https://wa.me/918341085629?text=Hi%20Ammaji%20Fashions!%20I%20have%20a%20question%20about%20a%20blouse%20design." 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: '#25D366',
        color: 'white',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '35px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        zIndex: 1000,
        textDecoration: 'none',
        transition: 'transform 0.3s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <i className="fab fa-whatsapp" style={{lineHeight: '60px'}}></i>
      {/* Fallback text icon if font-awesome isn't loaded */}
      <span style={{position: 'absolute', fontSize: '1.8rem'}}>💬</span>
    </a>
  );
}
