import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';

function TrackOrder() {
  const location = useLocation();
  const [orderId, setOrderId] = useState(location.state?.orderNumber || '');
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location.state?.orderNumber) {
      handleTrack({ preventDefault: () => {} });
    }
  }, [location.state]);

  const handleTrack = async (e) => {
    e.preventDefault();
    if(!orderId.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/track/${orderId.trim()}`);
      setTrackingData(res.data);
    } catch (err) {
      setError('Order not found. Please verify your Order ID (e.g. BL202609060001).');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderId = () => {
    if (!trackingData?.orderNumber) return;
    navigator.clipboard.writeText(trackingData.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  const formatEstimatedDelivery = (createdAt) => {
    if (!createdAt) return '4-6 business days';
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Full detailed stages in sequence
  let steps = [
    { key: 'PAYMENT_CONFIRMED', label: 'Order Confirmed & Payment Verified', desc: 'Order details recorded in system' },
    { key: 'MATERIAL_RECEIVED', label: 'Fabric Received at Workshop', desc: 'Saree fabric inspected & measured' },
    { key: 'DESIGNING_IN_PROGRESS', label: 'Pattern Cutting & Neck Tracing', desc: 'Precision cut according to measurements' },
    { key: 'STITCHING_IN_PROGRESS', label: 'Stitching & Maggam Embroidery', desc: 'Master artisans crafting your blouse' },
    { key: 'QUALITY_CHECK', label: 'Quality & Fit Inspection', desc: 'Margin, lining & double seam inspection' },
    { key: 'READY_FOR_DELIVERY', label: 'Ready for Courier Dispatch', desc: 'Packed in bespoke boutique box' },
    { key: 'SHIPPED', label: 'Out for Delivery / In Transit', desc: 'Dispatched with tracking AWB' },
    { key: 'DELIVERED', label: 'Delivered to Doorstep', desc: 'Delivered to customer' }
  ];

  if (trackingData && trackingData.orderStatus === 'CANCELLED') {
    steps = [
      { key: 'CANCELLED', label: 'Payment Cancelled / Order Void', desc: 'This order was cancelled by user' }
    ];
  }

  const getStepData = (stepKey) => {
    if (!trackingData || !trackingData.statusHistory) return null;
    return trackingData.statusHistory.find(h => h.status === stepKey);
  };

  const getStatusDisplay = (statusEnum) => {
    if (!statusEnum) return '';
    return statusEnum.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container section" style={{maxWidth: '850px'}}>
      <h2 className="section-title">Track Stitching <span>Progress</span></h2>
      <p style={{textAlign: 'center', color: 'var(--text-muted)', marginTop: '-1.5rem', marginBottom: '2.5rem'}}>
        Enter your order reference code to watch your bespoke blouse journey through our atelier.
      </p>
      
      {/* Search Order Card */}
      <div className="card" style={{padding: '2rem', marginBottom: '2.5rem'}}>
        <form onSubmit={handleTrack} style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Enter Order ID (e.g. BL202609060001)" 
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            required
            style={{flex: 1, minWidth: '240px'}}
          />
          <button type="submit" className="btn btn-primary" style={{padding: '0.8rem 2rem'}} disabled={loading}>
            {loading ? 'Locating...' : 'Track Order 🔍'}
          </button>
        </form>
        {error && <p style={{color: 'var(--error-color)', marginTop: '1rem', fontWeight: 500}}>{error}</p>}
      </div>

      {trackingData && (
        <div className="card" style={{padding: '3rem', margin: '0 auto', position: 'relative'}}>
          
          {/* Header Banner */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'}}>
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                <h3 style={{fontSize: '1.8rem', margin: 0, fontFamily: 'var(--font-serif)'}}>
                  Order <span style={{color: 'var(--primary-color)'}}>{trackingData.orderNumber}</span>
                </h3>
                <button 
                  onClick={handleCopyOrderId}
                  style={{background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)'}}
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem', margin: 0}}>
                Placed on: {new Date(trackingData.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {trackingData.transactionNumber && (
                  <span style={{marginLeft: '0.75rem'}}>• Txn: <code style={{color: 'var(--primary-color)'}}>{trackingData.transactionNumber}</code></span>
                )}
              </p>
            </div>

            <div style={{textAlign: 'right'}}>
              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'}}>Current Stage</div>
              <div style={{color: trackingData.orderStatus === 'CANCELLED' ? '#DC2626' : 'var(--primary-color)', fontWeight: 700, fontSize: '1.25rem', marginTop: '0.2rem'}}>
                {getStatusDisplay(trackingData.orderStatus)}
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: '8px', marginBottom: '2.5rem'}}>
            <div>
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Design Style</span>
              <div style={{fontWeight: 600, fontSize: '1rem', marginTop: '0.2rem'}}>
                {trackingData.design?.name || trackingData.customDesignName || 'Custom Bespoke Blouse'}
              </div>
            </div>
            <div>
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Payment Status</span>
              <div style={{fontWeight: 600, fontSize: '1rem', marginTop: '0.2rem'}}>
                ₹{trackingData.paidAmount != null ? trackingData.paidAmount : (trackingData.paymentType === 'ADVANCE_20' ? Math.round(trackingData.amount * 0.20) : trackingData.amount)} ({trackingData.paymentType === 'ADVANCE_20' ? '20% Advance' : 'Full Payment'})
              </div>
            </div>
            <div>
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Estimated Ready Date</span>
              <div style={{fontWeight: 600, fontSize: '1rem', color: '#15803D', marginTop: '0.2rem'}}>
                {formatEstimatedDelivery(trackingData.createdAt)}
              </div>
            </div>
            <div>
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Assigned Atelier</span>
              <div style={{fontWeight: 600, fontSize: '1rem', marginTop: '0.2rem'}}>
                Master Tailor Unit #2
              </div>
            </div>
          </div>
          
          {/* Cancellation Notice */}
          {trackingData.orderStatus === 'CANCELLED' && (
            trackingData.paymentStatus === 'SUCCESS' ? (
              <div style={{
                marginBottom: '2rem',
                padding: '1.25rem',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px'
              }}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem'}}>
                  <strong style={{color: '#92400E', fontSize: '0.95rem'}}>
                    🔄 Refund Status: {trackingData.refundStatus === 'REFUND_COMPLETED' ? 'Refund Completed' : 'Refund Processing (Expected within 2 days)'}
                  </strong>
                  <span style={{fontSize: '0.8rem', background: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600}}>
                    Refund: ₹{trackingData.paidAmount != null ? trackingData.paidAmount : (trackingData.paymentType === 'ADVANCE_20' ? Math.round(trackingData.amount * 0.20) : trackingData.amount)}
                  </span>
                </div>
                <p style={{color: '#78350F', fontSize: '0.85rem', margin: '0 0 0.75rem 0'}}>
                  We observe that this order was cancelled. Your refund will be credited back to your original payment source within 2 business days.
                </p>
                <a 
                  href={`https://wa.me/918341085629?text=Hello%20Ammaji%20Fashions,%20I%20would%20like%20to%20check%20the%20refund%20status%20for%20cancelled%20order%20%23${trackingData.orderNumber}%20(Txn%20Ref:%20${trackingData.transactionNumber || 'N/A'})`}
                  target="_blank"
                  rel="noreferrer"
                  style={{color: '#15803D', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'}}
                >
                  💬 Inquire Refund Status on WhatsApp →
                </a>
              </div>
            ) : (
              <div style={{
                marginBottom: '2rem',
                padding: '1rem 1.25rem',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                  <span>🚫</span>
                  <strong style={{color: '#4B5563', fontSize: '0.9rem'}}>Payment Cancelled</strong>
                </div>
                <p style={{color: '#6B7280', fontSize: '0.85rem', margin: 0}}>
                  📌 <strong>Note:</strong> Payment was not completed. If any amount was deducted, it will return in 3 days.
                </p>
              </div>
            )
          )}

          {/* Timeline */}
          <div style={{position: 'relative', paddingLeft: '2.5rem', borderLeft: '3px solid var(--border-color)', marginLeft: '1rem'}}>
            
            {steps.map((step, index) => {
              const historyItem = getStepData(step.key);
              const isCompleted = !!historyItem;
              const isLast = index === steps.length - 1;
              
              let iconContent = '';
              let bgColor = '#E5E7EB';
              let borderColor = '#D1D5DB';
              
              if (isCompleted) {
                if (step.key === 'CANCELLED') {
                   bgColor = 'var(--error-color)';
                   iconContent = '✕';
                } else {
                   bgColor = 'var(--success-color)';
                   borderColor = '#059669';
                   iconContent = '✓';
                }
              }

              return (
                <div key={step.key} style={{position: 'relative', marginBottom: isLast ? '0' : '2rem'}}>
                  {/* Step Bullet */}
                  <div style={{
                    position: 'absolute', 
                    left: '-49px', 
                    top: '0', 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    backgroundColor: bgColor, 
                    border: `2px solid ${borderColor}`,
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    color: 'white', 
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: isCompleted ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none'
                  }}>
                    {iconContent}
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem'}}>
                    <h4 style={{margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.05rem', color: isCompleted ? 'var(--text-main)' : 'var(--text-muted)'}}>
                      {step.label}
                    </h4>
                    {isCompleted && historyItem && (
                      <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                        {formatDate(historyItem.createdAt)}
                      </span>
                    )}
                  </div>

                  <p style={{fontSize: '0.85rem', color: isCompleted ? 'var(--text-muted)' : '#9CA3AF', margin: '0.2rem 0 0 0'}}>
                    {step.desc}
                  </p>
                  
                  {isCompleted && historyItem?.comment && historyItem.comment !== "Payment successful. Order confirmed." && (
                    <div style={{marginTop: '0.6rem', backgroundColor: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#1E293B', borderLeft: '3px solid var(--primary-color)'}}>
                      <strong>Tailor Note:</strong> {historyItem.comment}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
          
          {/* Bottom Actions & Help */}
          <div style={{marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
            <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
              Have questions regarding alterations or pickup timing?
            </div>
            <div style={{display: 'flex', gap: '0.75rem'}}>
              <a 
                href={`https://wa.me/918341085629?text=Hello%20Ammaji%20Fashions,%20I%20need%20assistance%20with%20tracking%20order%20#${trackingData.orderNumber}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', textDecoration: 'none'}}
              >
                💬 WhatsApp Stylist
              </a>
              <Link to="/catalogue" className="btn btn-primary" style={{fontSize: '0.85rem', textDecoration: 'none'}}>
                Browse More Styles
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackOrder;
