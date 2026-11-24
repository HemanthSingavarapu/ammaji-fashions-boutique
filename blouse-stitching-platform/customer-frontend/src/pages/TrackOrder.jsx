import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  SearchIcon, 
  CopyIcon, 
  RefreshIcon, 
  WhatsAppIcon, 
  AlertCircleIcon, 
  InfoIcon 
} from '../components/Icons';
import api from '../services/api';

function TrackOrder() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialOrderId = location.state?.orderNumber || searchParams.get('orderId') || searchParams.get('orderNumber') || '';
  const [orderId, setOrderId] = useState(initialOrderId);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchTracking = async (idToTrack) => {
    const cleanId = (idToTrack || orderId || '').trim();
    if (!cleanId) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/track/${cleanId}`);
      setTrackingData(res.data);
    } catch (err) {
      setError('Order not found. Please verify your Order ID (e.g. BL202609060001).');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const target = location.state?.orderNumber || new URLSearchParams(location.search).get('orderId') || new URLSearchParams(location.search).get('orderNumber');
    if (target) {
      setOrderId(target);
      fetchTracking(target);
    }
  }, [location]);

  const handleTrack = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    fetchTracking(orderId);
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

  const STATUS_RANKS = {
    'ORDER_PLACED': 0,
    'PAYMENT_CONFIRMED': 0,
    'MATERIAL_AWAITING': 0.5,
    'MATERIAL_RECEIVED': 1,
    'DESIGNING_IN_PROGRESS': 2,
    'STITCHING_IN_PROGRESS': 3,
    'QUALITY_CHECK': 4,
    'READY_FOR_DELIVERY': 5,
    'SHIPPED': 6,
    'OUT_FOR_DELIVERY': 6,
    'DELIVERED': 7
  };

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
          <button type="submit" className="btn btn-primary" style={{padding: '0.8rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'}} disabled={loading}>
            {loading ? 'Locating...' : <><SearchIcon size={16} /> Track Order</>}
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
                  style={{background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px'}}
                >
                  {copied ? '✓ Copied' : <><CopyIcon size={12} /> Copy</>}
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
              <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Fitting Method</span>
              <div style={{fontWeight: 600, fontSize: '0.95rem', marginTop: '0.2rem', color: (trackingData.measurementType === 'SAMPLE_BLOUSE' || trackingData.specialInstructions?.includes('SAMPLE BLOUSE')) ? '#B45309' : 'var(--text-main)'}}>
                {(trackingData.measurementType === 'SAMPLE_BLOUSE' || trackingData.specialInstructions?.includes('SAMPLE BLOUSE')) ? '📦 Sample Blouse (Customer Sent)' : '📏 Custom Tape Measurements'}
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
                  <strong style={{color: '#92400E', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem'}}>
                    <RefreshIcon size={16} color="#92400E" /> Refund Status: {trackingData.refundStatus === 'REFUND_COMPLETED' ? 'Refund Completed' : 'Refund Processing (Expected within 2 days)'}
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
                  <WhatsAppIcon size={14} /> Inquire Refund Status on WhatsApp →
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
                  <AlertCircleIcon size={16} color="#6B7280" />
                  <strong style={{color: '#4B5563', fontSize: '0.9rem'}}>Payment Cancelled</strong>
                </div>
                <p style={{color: '#6B7280', fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem'}}>
                  <InfoIcon size={14} color="#6B7280" /> <span><strong>Note:</strong> Payment was not completed. If any amount was deducted, it will return in 3 days.</span>
                </p>
              </div>
            )
          )}

          {/* Animated Stepper Styles */}
          <style>{`
            @keyframes pulseGlowRing {
              0% {
                box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.85);
              }
              70% {
                box-shadow: 0 0 0 14px rgba(217, 119, 6, 0);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(217, 119, 6, 0);
              }
            }
            @keyframes lineShimmerFlow {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100%); }
            }
            @keyframes activeTagPulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.85; transform: scale(0.97); }
            }
          `}</style>

          {/* Timeline */}
          <div style={{position: 'relative', paddingLeft: '3rem', marginLeft: '0.75rem'}}>
            
            {steps.map((step, index) => {
              const historyItem = getStepData(step.key);
              const isLast = index === steps.length - 1;
              const currentStatus = trackingData?.orderStatus || 'ORDER_PLACED';
              const currentRank = STATUS_RANKS[currentStatus] !== undefined ? STATUS_RANKS[currentStatus] : 0;
              const isCancelled = currentStatus === 'CANCELLED' || step.key === 'CANCELLED';

              // Cumulative completion logic:
              // When admin fast-forwards status (e.g. directly to Out for Delivery / Shipped or Delivered),
              // all previous chronological stages are marked as completed with gold checkmarks.
              const isCompleted = isCancelled ? false : (
                currentStatus === 'DELIVERED' ||
                index < currentRank ||
                !!historyItem
              );

              // Active tailoring stage with pulse ring
              const isActive = !isCancelled && currentStatus !== 'DELIVERED' && (
                index === Math.floor(currentRank)
              );

              // Connector line status to the next stage
              const isLineCompleted = !isCancelled && (
                currentStatus === 'DELIVERED' ||
                index < currentRank
              );
              const isLineToActive = !isCancelled && !isLineCompleted && (index === Math.floor(currentRank) - 1);

              return (
                <div key={step.key} style={{position: 'relative', marginBottom: isLast ? '0' : '2.25rem'}}>
                  
                  {/* Vertical Progress Connector Line */}
                  {!isLast && (
                    <div style={{
                      position: 'absolute',
                      left: '-33px',
                      top: '32px',
                      bottom: '-18px',
                      width: '3px',
                      background: isLineCompleted
                        ? 'linear-gradient(180deg, #10B981, #059669)'
                        : isLineToActive
                          ? 'linear-gradient(180deg, #10B981 0%, #D97706 100%)'
                          : '#E5E7EB',
                      transition: 'background 0.4s ease',
                      overflow: 'hidden',
                      zIndex: 1
                    }}>
                      {isLineCompleted && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.7), transparent)',
                          animation: 'lineShimmerFlow 2s infinite linear'
                        }} />
                      )}
                    </div>
                  )}

                  {/* Step Bullet */}
                  {isCancelled ? (
                    <div style={{
                      position: 'absolute',
                      left: '-48px',
                      top: '0',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--error-color)',
                      border: '2px solid #B91C1C',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      zIndex: 2
                    }}>
                      ✕
                    </div>
                  ) : isCompleted ? (
                    <div style={{
                      position: 'absolute',
                      left: '-48px',
                      top: '0',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      border: '2.5px solid #F59E0B',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)',
                      zIndex: 2
                    }}>
                      <span style={{color: '#FEF08A', fontSize: '15px', fontWeight: 900}}>✓</span>
                    </div>
                  ) : isActive ? (
                    <div style={{
                      position: 'absolute',
                      left: '-48px',
                      top: '0',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                      border: '2.5px solid #FEF3C7',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      animation: 'pulseGlowRing 1.8s infinite ease-out',
                      zIndex: 2
                    }}>
                      <span style={{width: '10px', height: '10px', borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 0 6px #FFFFFF'}}></span>
                    </div>
                  ) : (
                    <div style={{
                      position: 'absolute',
                      left: '-46px',
                      top: '2px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#F3F4F6',
                      border: '2px solid #D1D5DB',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 2
                    }}>
                      <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF'}}></span>
                    </div>
                  )}
                  
                  {/* Step Label & Metadata */}
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap'}}>
                      <h4 style={{
                        margin: 0, 
                        fontFamily: 'var(--font-sans)', 
                        fontSize: '1.05rem', 
                        fontWeight: isActive ? 700 : (isCompleted ? 600 : 500),
                        color: isCompleted ? 'var(--text-main)' : (isActive ? '#92400E' : 'var(--text-muted)')
                      }}>
                        {step.label}
                      </h4>
                      {isActive && (
                        <span style={{
                          fontSize: '0.72rem',
                          background: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FDE68A',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          animation: 'activeTagPulse 2s infinite ease-in-out'
                        }}>
                          <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#D97706', display: 'inline-block'}}></span>
                          IN PROGRESS
                        </span>
                      )}
                    </div>

                    {isCompleted && (
                      <span style={{fontSize: '0.8rem', color: historyItem ? 'var(--text-muted)' : '#059669', fontWeight: historyItem ? 500 : 600}}>
                        {historyItem ? formatDate(historyItem.createdAt) : '✓ Atelier Completed'}
                      </span>
                    )}
                  </div>

                  <p style={{fontSize: '0.85rem', color: isCompleted ? 'var(--text-muted)' : (isActive ? '#78350F' : '#9CA3AF'), margin: '0.25rem 0 0 0'}}>
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
                <WhatsAppIcon size={14} /> WhatsApp Stylist
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
