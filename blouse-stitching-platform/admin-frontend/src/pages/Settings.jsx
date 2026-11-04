import { useState, useEffect } from 'react';

function Settings() {
  const [config, setConfig] = useState({
    storeName: 'Ammaji Fashions',
    contactEmail: 'contact@ammajifashions.com',
    supportPhone: '+91 8341085629',
    studioAddress: 'Studio #402, Fashion District, MG Road, Bangalore, Karnataka - 560001',
    standardCourierFee: 150,
    expressStitchingFee: 500,
    gstPercentage: 5,
    autoEmailUpdates: true,
    autoWhatsAppUpdates: true,
    pickupAvailable: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('boutique_admin_settings');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('boutique_admin_settings', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-content">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="page-title" style={{margin: 0}}>Ammaji Fashions Settings & Configuration</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem'}}>
            Configure studio credentials, delivery charges, tailoring rules, and automated notifications.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div style={{background: '#DCFCE7', color: '#166534', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #86EFAC'}}>
          ✓ Configuration successfully updated and saved!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        {/* Studio Profile */}
        <div className="card">
          <h3 style={{fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem'}}>
            🏬 Studio Profile & Contact
          </h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem'}}>
            <div>
              <label style={{display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem'}}>Store / Brand Name</label>
              <input 
                type="text" 
                value={config.storeName} 
                onChange={e => setConfig({...config, storeName: e.target.value})}
                style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px'}}
                required
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem'}}>Support Email</label>
              <input 
                type="email" 
                value={config.contactEmail} 
                onChange={e => setConfig({...config, contactEmail: e.target.value})}
                style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px'}}
                required
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem'}}>Customer Helpline / WhatsApp Phone</label>
              <input 
                type="text" 
                value={config.supportPhone} 
                onChange={e => setConfig({...config, supportPhone: e.target.value})}
                style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px'}}
                required
              />
            </div>
            <div style={{gridColumn: '1 / -1'}}>
              <label style={{display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem'}}>Studio Workshop & Dispatch Address (Printed on Labels)</label>
              <textarea 
                rows="2"
                value={config.studioAddress} 
                onChange={e => setConfig({...config, studioAddress: e.target.value})}
                style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px'}}
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing & Fees */}
        <div className="card">
          <h3 style={{fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem'}}>
            💰 Tailoring & Logistics Pricing
          </h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem'}}>
            <div>
              <label style={{display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem'}}>Standard Delivery Courier Fee (₹)</label>
              <input 
                type="number" 
                value={config.standardCourierFee} 
                onChange={e => setConfig({...config, standardCourierFee: Number(e.target.value)})}
                style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px'}}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem'}}>Express 48h Stitching Surcharge (₹)</label>
              <input 
                type="number" 
                value={config.expressStitchingFee} 
                onChange={e => setConfig({...config, expressStitchingFee: Number(e.target.value)})}
                style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px'}}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem'}}>GST Rate (%)</label>
              <input 
                type="number" 
                value={config.gstPercentage} 
                onChange={e => setConfig({...config, gstPercentage: Number(e.target.value)})}
                style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px'}}
              />
            </div>
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="card">
          <h3 style={{fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem'}}>
            🔔 Notification & Customer Services
          </h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer'}}>
              <input 
                type="checkbox" 
                checked={config.autoWhatsAppUpdates} 
                onChange={e => setConfig({...config, autoWhatsAppUpdates: e.target.checked})}
                style={{width: '18px', height: '18px'}}
              />
              <div>
                <strong style={{fontSize: '0.9rem'}}>Automatic WhatsApp Progress Triggers</strong>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0}}>Generate automated WhatsApp message templates when order status changes to MATERIAL_RECEIVED, SHIPPED, etc.</p>
              </div>
            </label>

            <label style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer'}}>
              <input 
                type="checkbox" 
                checked={config.autoEmailUpdates} 
                onChange={e => setConfig({...config, autoEmailUpdates: e.target.checked})}
                style={{width: '18px', height: '18px'}}
              />
              <div>
                <strong style={{fontSize: '0.9rem'}}>Transactional Email Notifications</strong>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0}}>Send order confirmation receipts and tracking links to customer emails.</p>
              </div>
            </label>

            <label style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer'}}>
              <input 
                type="checkbox" 
                checked={config.pickupAvailable} 
                onChange={e => setConfig({...config, pickupAvailable: e.target.checked})}
                style={{width: '18px', height: '18px'}}
              />
              <div>
                <strong style={{fontSize: '0.9rem'}}>Doorstep Fabric Pickup Service</strong>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0}}>Enable option for customers to request valet pickup of raw unstitched fabric from their home.</p>
              </div>
            </label>
          </div>
        </div>

        <div>
          <button type="submit" className="btn btn-primary" style={{padding: '0.75rem 2rem', fontSize: '1rem'}}>
            💾 Save Boutique Settings
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
