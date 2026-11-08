import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../services/api';

function Profile() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [confirmCancelOrder, setConfirmCancelOrder] = useState(null);
  const [cancellationNotice, setCancellationNotice] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [measurements, setMeasurements] = useState({
    bust: '', waist: '', shoulder: '', blouseLength: '', sleeveLength: '', armhole: '', frontNeck: '', backNeck: '', otherMeasurements: ''
  });
  const [measSaved, setMeasSaved] = useState(false);

  const fetchOrders = () => {
    if(user) {
      api.get('/orders/my-orders').then(res => setOrders(res.data)).catch(err => console.error(err));
      api.get('/users/me/measurements').then(res => {
        if(res.data) setMeasurements(prev => ({ ...prev, ...res.data }));
      }).catch(() => {});
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const saveMeasurements = (e) => {
    e.preventDefault();
    api.post('/users/me/measurements', measurements)
       .then(res => {
         setMeasurements(res.data);
         setMeasSaved(true);
         setTimeout(() => setMeasSaved(false), 3000);
       })
       .catch(err => console.error(err));
  };

  const handleConfirmCancel = async () => {
    if (!confirmCancelOrder) return;
    setCancelling(true);
    try {
      const res = await api.post(`/orders/${confirmCancelOrder.id}/cancel`);
      fetchOrders();
      const updatedOrder = res.data;
      const hadPayment = updatedOrder.paymentStatus === 'SUCCESS';
      
      const paidAmt = updatedOrder.paidAmount != null 
        ? updatedOrder.paidAmount 
        : (updatedOrder.paymentType === 'ADVANCE_20' ? Math.round(updatedOrder.amount * 0.20) : updatedOrder.amount);
      
      const cancelledData = {
        orderNumber: updatedOrder.orderNumber,
        transactionNumber: updatedOrder.transactionNumber,
        paidAmount: hadPayment ? paidAmt : 0,
        hasRefund: hadPayment
      };
      setConfirmCancelOrder(null);
      setCancellationNotice(cancelledData);
    } catch (err) {
      setError(err.response?.data || "Failed to cancel order.");
      setConfirmCancelOrder(null);
    }
    setCancelling(false);
  };

  if (!user) return <Navigate to="/login" />;

  const getStatusDisplay = (statusEnum) => {
    if (!statusEnum) return '';
    return statusEnum.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalSpent = orders
    .filter(o => o.paymentStatus === 'SUCCESS')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const activeOrdersCount = orders.filter(o => !['DELIVERED', 'CANCELLED'].includes(o.orderStatus)).length;

  return (
    <div className="container section">
      {/* Top Banner */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1.25rem'}}>
          <div style={{width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-serif)'}}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{margin: 0, fontFamily: 'var(--font-serif)', fontSize: '2rem'}}>Namaste, {user.name}!</h2>
            <p style={{margin: '0.2rem 0 0 0', color: 'var(--text-muted)'}}>{user.email} • Client Member</p>
          </div>
        </div>

        <div style={{display: 'flex', gap: '1.5rem'}}>
          <div style={{background: 'var(--bg-surface-elevated)', padding: '0.75rem 1.25rem', borderRadius: '8px', textAlign: 'center'}}>
            <span style={{fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Total Orders</span>
            <strong style={{display: 'block', fontSize: '1.3rem'}}>{orders.length}</strong>
          </div>
          <div style={{background: 'var(--bg-surface-elevated)', padding: '0.75rem 1.25rem', borderRadius: '8px', textAlign: 'center'}}>
            <span style={{fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Active in Atelier</span>
            <strong style={{display: 'block', fontSize: '1.3rem', color: 'var(--primary-color)'}}>{activeOrdersCount}</strong>
          </div>
          <div style={{background: 'var(--bg-surface-elevated)', padding: '0.75rem 1.25rem', borderRadius: '8px', textAlign: 'center'}}>
            <span style={{fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Total Spend</span>
            <strong style={{display: 'block', fontSize: '1.3rem', color: '#16A34A'}}>₹{totalSpent.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>
      
      {error && <div style={{backgroundColor: 'var(--error-color)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem'}}>{error}</div>}

      <div style={{display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start'}}>
        {/* Left Column: Details & Measurements */}
        <div style={{flex: '1', minWidth: '280px', width: '100%'}}>
          <div className="card" style={{padding: '2.5rem', marginBottom: '2rem', border: '1px solid var(--border-color)'}}>
            <h3 style={{fontFamily: 'var(--font-sans)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', fontSize: '1.25rem'}}>Profile Details</h3>
            <p style={{margin: '0.75rem 0', color: 'var(--text-muted)'}}><strong style={{color: 'var(--text-main)'}}>Name:</strong> {user.name}</p>
            <p style={{margin: '0.75rem 0', color: 'var(--text-muted)'}}><strong style={{color: 'var(--text-main)'}}>Email:</strong> {user.email}</p>
            <p style={{margin: '0.75rem 0', color: 'var(--text-muted)'}}><strong style={{color: 'var(--text-main)'}}>Phone:</strong> {user.mobile || 'Not set'}</p>
            <p style={{margin: '0.75rem 0', color: 'var(--text-muted)'}}><strong style={{color: 'var(--text-main)'}}>Address:</strong> {user.address ? `${user.address}, ${user.city || ''}` : 'No address set'}</p>
          </div>

          <div className="card" style={{padding: '2.5rem', border: '1px solid var(--border-color)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem'}}>
              <h3 style={{fontFamily: 'var(--font-sans)', margin: 0, fontSize: '1.25rem'}}>Saved Measurements (Inches)</h3>
              <Link to="/guide" style={{fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'underline'}}>Guide</Link>
            </div>
            
            <form onSubmit={saveMeasurements} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div><label style={{fontSize:'0.8rem', fontWeight: 600}}>Bust</label><input type="number" step="0.5" className="form-control" value={measurements.bust || ''} onChange={e=>setMeasurements({...measurements, bust: e.target.value})} placeholder="34" /></div>
              <div><label style={{fontSize:'0.8rem', fontWeight: 600}}>Waist</label><input type="number" step="0.5" className="form-control" value={measurements.waist || ''} onChange={e=>setMeasurements({...measurements, waist: e.target.value})} placeholder="28" /></div>
              <div><label style={{fontSize:'0.8rem', fontWeight: 600}}>Shoulder</label><input type="number" step="0.5" className="form-control" value={measurements.shoulder || ''} onChange={e=>setMeasurements({...measurements, shoulder: e.target.value})} placeholder="14.5" /></div>
              <div><label style={{fontSize:'0.8rem', fontWeight: 600}}>Blouse Len</label><input type="number" step="0.5" className="form-control" value={measurements.blouseLength || ''} onChange={e=>setMeasurements({...measurements, blouseLength: e.target.value})} placeholder="14" /></div>
              <div><label style={{fontSize:'0.8rem', fontWeight: 600}}>Sleeve Len</label><input type="number" step="0.5" className="form-control" value={measurements.sleeveLength || ''} onChange={e=>setMeasurements({...measurements, sleeveLength: e.target.value})} placeholder="10.5" /></div>
              <div><label style={{fontSize:'0.8rem', fontWeight: 600}}>Armhole</label><input type="number" step="0.5" className="form-control" value={measurements.armhole || ''} onChange={e=>setMeasurements({...measurements, armhole: e.target.value})} placeholder="16" /></div>
              
              <div style={{gridColumn: '1 / span 2'}}>
                <label style={{fontSize:'0.8rem', fontWeight: 600}}>Special Fit Notes</label>
                <textarea className="form-control" rows="2" placeholder="e.g. Broad shoulders, prefer 2-inch inner margin..." value={measurements.otherMeasurements || ''} onChange={e=>setMeasurements({...measurements, otherMeasurements: e.target.value})}></textarea>
              </div>

              <div style={{gridColumn: '1 / span 2'}}>
                <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '0.75rem'}}>
                  Save My Fitting Profile
                </button>
                {measSaved && <span style={{color:'var(--success-color)', fontSize:'0.85rem', display:'block', marginTop:'0.5rem', textAlign:'center', fontWeight: 600}}>✓ Measurements saved successfully!</span>}
              </div>
            </form>
          </div>
        </div>
        
        {/* Right Column: Order History */}
        <div style={{flex: '2', minWidth: '280px', width: '100%'}}>
          <div className="card" style={{padding: '2.5rem', border: '1px solid var(--border-color)'}}>
            <h3 style={{fontFamily: 'var(--font-sans)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '2rem', fontSize: '1.25rem'}}>
              My Stitching Orders
            </h3>
            
            {orders.length === 0 ? (
              <div style={{textAlign: 'center', padding: '3rem 1rem'}}>
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🛍️</div>
                <h4 style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>No orders placed yet</h4>
                <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem'}}>Choose a design from our collection or build a custom blouse in our studio.</p>
                <Link to="/catalogue" className="btn btn-primary">Browse Catalogue</Link>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
                {orders.map(order => {
                  const canCancel = order.orderStatus === 'ORDER_PLACED' || order.orderStatus === 'PAYMENT_CONFIRMED';
                  const isCancelled = order.orderStatus === 'CANCELLED';
                  const hasSuccessfulPayment = order.paymentStatus === 'SUCCESS';
                  const paidAmt = order.paidAmount != null 
                    ? order.paidAmount 
                    : (order.paymentType === 'ADVANCE_20' ? Math.round(order.amount * 0.20) : order.amount);
                  
                  return (
                    <div key={order.id} style={{padding: '1.5rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                            <h4 style={{margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.2rem'}}>{order.orderNumber}</h4>
                            <span style={{
                              fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px',
                              backgroundColor: isCancelled ? '#FEE2E2' : (order.orderStatus.includes('DELIVERED') ? '#DCFCE7' : '#DBEAFE'),
                              color: isCancelled ? '#991B1B' : (order.orderStatus.includes('DELIVERED') ? '#166534' : '#1E40AF')
                            }}>
                              {getStatusDisplay(order.orderStatus)}
                            </span>
                          </div>
                          <p style={{color: 'var(--text-main)', fontSize: '0.95rem', margin: '0.35rem 0', fontWeight: 500}}>
                            {order.design?.name || order.customDesignName || 'Custom Blouse'}
                          </p>
                          <div style={{color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4'}}>
                            <div>
                              Stitching Total: <strong>₹{order.amount}</strong> • Payment: <strong style={{color: order.paymentStatus === 'SUCCESS' ? '#16A34A' : order.paymentStatus === 'UNDER_REVIEW' ? '#D97706' : 'inherit'}}>{order.paymentStatus === 'SUCCESS' ? 'PAID' : (isCancelled ? 'CANCELLED' : order.paymentStatus)}</strong>
                            </div>
                            <div style={{marginTop: '0.2rem'}}>
                              Plan: <strong>{order.paymentType === 'ADVANCE_20' ? '20% Advance Booking' : 'Full Payment (100%)'}</strong> • Paid: <strong>₹{paidAmt}</strong>
                              {order.transactionNumber && (
                                <span> • Txn ID: <code style={{color: 'var(--primary-color)', fontWeight: 600}}>{order.transactionNumber}</code></span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                          <Link 
                            to="/track" 
                            className="btn btn-primary" 
                            style={{padding: '0.45rem 0.9rem', fontSize: '0.85rem', textDecoration: 'none'}} 
                            state={{orderNumber: order.orderNumber}}
                          >
                            Track 📍
                          </Link>

                          {(order.paymentStatus === 'SUCCESS' || order.paymentStatus === 'UNDER_REVIEW') && (
                            <>
                              <Link 
                                to="/success" 
                                className="btn btn-outline" 
                                style={{padding: '0.45rem 0.9rem', fontSize: '0.85rem', textDecoration: 'none'}} 
                                state={{orderNumber: order.orderNumber}}
                              >
                                Invoice 🧾
                              </Link>
                              <a 
                                href={`http://localhost:8080/api/orders/${order.id}/invoice`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="btn btn-outline" 
                                style={{padding: '0.45rem 0.9rem', fontSize: '0.85rem', textDecoration: 'none'}}
                                title="Download PDF Invoice"
                              >
                                📥 PDF
                              </a>
                            </>
                          )}

                          <a 
                            href={`https://wa.me/918341085629?text=Hello%20Ammaji%20Fashions,%20I%20need%20help%20with%20my%20stitching%20order%20#${order.orderNumber}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-outline" 
                            style={{padding: '0.45rem 0.9rem', fontSize: '0.85rem', textDecoration: 'none', color: '#16A34A', borderColor: '#16A34A'}}
                          >
                            💬 WhatsApp Stylist
                          </a>

                          {canCancel && (
                            <button 
                              onClick={() => setConfirmCancelOrder(order)} 
                              className="btn btn-outline" 
                              style={{padding: '0.45rem 0.9rem', fontSize: '0.85rem', color: 'var(--error-color)', borderColor: 'var(--error-color)'}}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cancelled Order Section */}
                      {isCancelled && (
                        hasSuccessfulPayment ? (
                          /* Refund in Progress Box (Displayed ONLY when payment was done and successful!) */
                          <div style={{
                            marginTop: '1.25rem',
                            padding: '1.25rem',
                            backgroundColor: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            borderRadius: '8px'
                          }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <span style={{fontSize: '1.2rem'}}>🔄</span>
                                <strong style={{color: '#92400E', fontSize: '0.95rem'}}>
                                  Refund Status: {order.refundStatus === 'REFUND_COMPLETED' ? 'Refund Completed' : 'Refund Processing'}
                                </strong>
                              </div>
                              <span style={{fontSize: '0.8rem', background: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600}}>
                                Expected within 2 days
                              </span>
                            </div>

                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.85rem', color: '#78350F', marginBottom: '1rem'}}>
                              <div>
                                <span style={{color: '#92400E', fontWeight: 600}}>Refund Amount:</span> ₹{paidAmt}
                              </div>
                              <div>
                                <span style={{color: '#92400E', fontWeight: 600}}>Payment Option:</span> {order.paymentType === 'ADVANCE_20' ? '20% Advance Booking' : '100% Full Payment'}
                              </div>
                              <div>
                                <span style={{color: '#92400E', fontWeight: 600}}>Transaction Ref:</span> {order.transactionNumber || 'TXN-RECORD'}
                              </div>
                              <div>
                                <span style={{color: '#92400E', fontWeight: 600}}>Credited To:</span> Original payment source
                              </div>
                            </div>

                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #FCD34D'}}>
                              <span style={{fontSize: '0.82rem', color: '#92400E'}}>
                                Have questions regarding your refund?
                              </span>
                              <a 
                                href={`https://wa.me/918341085629?text=Hello%20Ammaji%20Fashions,%20I%20would%20like%20to%20check%20the%20refund%20status%20for%20cancelled%20order%20%23${order.orderNumber}%20(Txn%20Ref:%20${order.transactionNumber || 'N/A'},%20Refund%20Amount:%20%E2%82%B9${paidAmt}).`}
                                target="_blank"
                                rel="noreferrer"
                                style={{color: '#15803D', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'}}
                              >
                                💬 Check Refund Status on WhatsApp →
                              </a>
                            </div>
                          </div>
                        ) : (
                          /* Unpaid / Payment Cancelled Box (NO Refund amount or Txn ref, just clear note) */
                          <div style={{
                            marginTop: '1.25rem',
                            padding: '1rem 1.25rem',
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px'
                          }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem'}}>
                              <span style={{fontSize: '1rem'}}>🚫</span>
                              <strong style={{color: '#4B5563', fontSize: '0.9rem'}}>Payment Cancelled</strong>
                            </div>
                            <p style={{color: '#6B7280', fontSize: '0.88rem', margin: 0, lineHeight: 1.5}}>
                              📌 <strong>Note:</strong> Payment was cancelled. If any amount was deducted, it will return in 3 days.
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmCancelOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3500,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>⚠️</div>
            <h3 style={{fontSize: '1.4rem', marginBottom: '0.75rem', fontFamily: 'var(--font-serif)'}}>
              Cancel Order #{confirmCancelOrder.orderNumber}?
            </h3>
            <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem'}}>
              Are you sure you wish to cancel this bespoke stitching order?
              {confirmCancelOrder.paymentStatus === 'SUCCESS' && (
                <span> Any paid amount will be automatically credited to your original payment source within 2 business days.</span>
              )}
            </p>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
              <button 
                onClick={handleConfirmCancel} 
                className="btn btn-primary" 
                style={{backgroundColor: 'var(--error-color)', padding: '0.75rem 1.5rem'}}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
              <button 
                onClick={() => setConfirmCancelOrder(null)} 
                className="btn btn-outline" 
                style={{padding: '0.75rem 1.5rem'}}
                disabled={cancelling}
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation & Refund Prompt Modal */}
      {cancellationNotice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3600,
          padding: '1rem'
        }}>
          <div className="card" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            border: cancellationNotice.hasRefund ? '2px solid #FCD34D' : '2px solid var(--border-color)'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>
              {cancellationNotice.hasRefund ? '🔄' : '🚫'}
            </div>
            <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--text-main)'}}>
              Order Cancelled
            </h3>
            
            {cancellationNotice.hasRefund ? (
              <>
                <div style={{
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  marginBottom: '1.75rem',
                  textAlign: 'left'
                }}>
                  <p style={{color: '#92400E', fontSize: '1rem', lineHeight: '1.6', margin: 0, fontWeight: 500}}>
                    We observe that you have cancelled the order and the amount you have paid (<strong>₹{cancellationNotice.paidAmount}</strong>) will be refunded within 2 days. For any queries, reach us here:
                  </p>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '0.85rem'}}>
                  <a 
                    href={`https://wa.me/918341085629?text=Hello%20Ammaji%20Fashions,%20I%20have%20cancelled%20order%20%23${cancellationNotice.orderNumber}%20(Txn%20Ref:%20${cancellationNotice.transactionNumber || 'N/A'}).%20Please%20update%20me%20on%20the%20status%20of%20the%20refund%20of%20%E2%82%B9${cancellationNotice.paidAmount}.`}
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{
                      backgroundColor: '#25D366',
                      borderColor: '#25D366',
                      color: '#fff',
                      padding: '0.85rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none'
                    }}
                  >
                    💬 Check Refund Status on WhatsApp
                  </a>

                  <button 
                    onClick={() => setCancellationNotice(null)} 
                    className="btn btn-outline" 
                    style={{padding: '0.75rem 1.5rem', fontSize: '0.95rem'}}
                  >
                    Acknowledge & Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  marginBottom: '1.75rem',
                  textAlign: 'left'
                }}>
                  <p style={{color: '#4B5563', fontSize: '0.95rem', lineHeight: '1.6', margin: 0}}>
                    Order #{cancellationNotice.orderNumber} has been cancelled.
                    <br /><br />
                    📌 <strong>Note:</strong> Payment was not completed. If any amount was deducted, it will return in 3 days.
                  </p>
                </div>

                <button 
                  onClick={() => setCancellationNotice(null)} 
                  className="btn btn-primary" 
                  style={{padding: '0.75rem 1.5rem', fontSize: '0.95rem', width: '100%'}}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
