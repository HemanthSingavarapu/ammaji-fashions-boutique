import { WhatsAppIcon } from './Icons';

function WhatsAppChat() {
  const phoneNumber = "918341085629"; // Ammaji Fashions official contact
  const message = encodeURIComponent("Hi Ammaji Fashions! I need help with my blouse stitching order.");

  return (
    <a 
      href={`https://wa.me/${phoneNumber}?text=${message}`} 
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
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        zIndex: 9999,
        textDecoration: 'none',
        transition: 'transform 0.3s'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      title="Chat with us on WhatsApp"
    >
      <WhatsAppIcon size={32} color="#ffffff" />
    </a>
  );
}

export default WhatsAppChat;
