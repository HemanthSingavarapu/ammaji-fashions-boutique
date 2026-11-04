import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderNumber = location.state?.orderNumber;
    if (!orderNumber) {
      navigate('/');
      return;
    }
    
    api.get(`/orders/track/${orderNumber}`)
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="container section" style={{textAlign: 'center', padding: '5rem'}}>
        <p style={{fontSize: '1.1rem', color: 'var(--text-muted)'}}>Loading invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container section" style={{textAlign: 'center', padding: '4rem'}}>
        <h3>Order not found.</h3>
        <Link to="/" className="btn btn-primary" style={{marginTop: '1rem'}}>Back to Home</Link>
      </div>
    );
  }

  const transactionNumber = order?.transactionNumber || location.state?.transactionNumber || 'TXN-PENDING';
  const paymentType = order?.paymentType || location.state?.paymentType || 'ADVANCE_20';
  const isAdvance = paymentType === 'ADVANCE_20';

  const paidAmount = order?.paidAmount != null 
    ? order.paidAmount 
    : (location.state?.paidAmount != null 
        ? location.state.paidAmount 
        : (isAdvance ? Math.round(order?.amount * 0.20) : order?.amount));

  const balanceDue = order?.balanceAmount != null 
    ? order.balanceAmount 
    : (location.state?.balanceAmount != null 
        ? location.state.balanceAmount 
        : Math.max(0, (order?.amount || 0) - paidAmount));

  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="section container" style={{maxWidth: '750px', paddingBottom: '4rem'}}>
      
      {/* Top Banner */}
      <div style={{
        background: '#ECFDF5', 
        border: '1px solid #A7F3D0', 
        borderRadius: '12px', 
        padding: '1.25rem 1.75rem', 
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.85rem'}}>
          <div style={{
            background: '#10B981', 
            color: '#fff', 
            borderRadius: '50%', 
            width: '36px', 
            height: '36px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1.15rem',
            fontWeight: 'bold'
          }}>✓</div>
          <div>
            <h3 style={{margin: 0, color: '#065F46', fontSize: '1.2rem', fontWeight: 700}}>Payment Successful</h3>
            <p style={{margin: '0.15rem 0 0 0', color: '#047857', fontSize: '0.88rem'}}>
              {isAdvance ? '20% Advance Booking Received' : '100% Full Payment Received'}
            </p>
          </div>
        </div>

        <div style={{display: 'flex', gap: '0.6rem'}}>
          <button 
            onClick={() => window.print()} 
            className="btn btn-outline" 
            style={{padding: '0.45rem 0.9rem', fontSize: '0.85rem', background: '#fff'}}
          >
            🖨️ Print
          </button>
          <Link 
            to="/track" 
            className="btn btn-primary" 
            state={{ orderNumber: order.orderNumber }}
            style={{padding: '0.45rem 1rem', fontSize: '0.85rem'}}
          >
            Track Order 📍
          </Link>
        </div>
      </div>

      {/* Clean & Simple Printable Invoice Card */}
      <div 
        id="printable-invoice" 
        style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          padding: '2.5rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
        }}
      >
        {/* Invoice Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
          <div>
            <h2 style={{margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)', fontFamily: 'var(--font-serif)', letterSpacing: '0.5px'}}>
              Ammaji Fashions
            </h2>
            <p style={{margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem'}}>
              Bespoke Blouse Atelier • Official Invoice
            </p>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '0.82rem', color: 'var(--text-muted)'}}>Order ID</div>
            <div style={{fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)'}}>#{order.orderNumber}</div>
            <div style={{fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem'}}>{orderDate}</div>
          </div>
        </div>

        {/* Transaction Summary Pill */}
        <div style={{
          background: 'var(--bg-surface-elevated)', 
          padding: '0.8rem 1.2rem', 
          borderRadius: '8px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap', 
          gap: '0.8rem',
          marginBottom: '1.75rem',
          fontSize: '0.88rem'
        }}>
          <div>
            <span style={{color: 'var(--text-muted)'}}>Transaction Ref: </span>
            <strong style={{color: 'var(--primary-color)'}}>{transactionNumber}</strong>
          </div>
          <div>
            <span style={{color: 'var(--text-muted)'}}>Status: </span>
            <span style={{background: '#DCFCE7', color: '#166534', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.8rem'}}>
              PAID ({isAdvance ? '20% Advance' : 'Full Payment'})
            </span>
          </div>
        </div>

        {/* Customer & Delivery Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem', fontSize: '0.9rem'}}>
          <div>
            <div style={{color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem', fontWeight: 600}}>
              Billed To
            </div>
            <div style={{fontWeight: 700, color: 'var(--text-main)'}}>{order.user?.name || 'Valued Customer'}</div>
            {order.user?.mobile && <div style={{color: 'var(--text-muted)'}}>{order.user.mobile}</div>}
            {order.user?.email && <div style={{color: 'var(--text-muted)'}}>{order.user.email}</div>}
          </div>

          <div>
            <div style={{color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem', fontWeight: 600}}>
              Delivery Address
            </div>
            <div style={{color: 'var(--text-muted)', lineHeight: '1.4'}}>
              {order.deliveryAddress || 'Address on file'}
            </div>
          </div>
        </div>

        {/* Minimal Itemized Table */}
        <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.92rem'}}>
          <thead>
            <tr style={{borderBottom: '1px solid #E5E7EB', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase'}}>
              <th style={{textAlign: 'left', paddingBottom: '0.75rem', fontWeight: 600}}>Description</th>
              <th style={{textAlign: 'right', paddingBottom: '0.75rem', fontWeight: 600}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{borderBottom: '1px solid #F3F4F6'}}>
              <td style={{padding: '0.85rem 0'}}>
                <strong style={{color: 'var(--text-main)'}}>
                  {order.design?.name || order.customDesignName || 'Custom Bespoke Blouse'}
                </strong>
                <div style={{fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem'}}>
                  Stitching & Atelier Crafting
                </div>
              </td>
              <td style={{textAlign: 'right', padding: '0.85rem 0', fontWeight: 600}}>
                ₹{order.design?.price || order.amount}
              </td>
            </tr>

            {/* Courier Row */}
            <tr style={{borderBottom: '1px solid #F3F4F6'}}>
              <td style={{padding: '0.85rem 0'}}>
                <div>
                  {order.courierOption === 'BOUTIQUE' ? 'Doorstep Valet Pickup & Drop' : 'Self Courier (Return Delivery)'}
                </div>
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem'}}>
                  Courier charges billed at actuals
                </div>
              </td>
              <td style={{textAlign: 'right', padding: '0.85rem 0', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem'}}>
                Excluded (Bill copy shared)
              </td>
            </tr>

            {/* Add-ons if present */}
            {order.design?.price && (order.amount - order.design.price) > 0 && (
              <tr style={{borderBottom: '1px solid #F3F4F6'}}>
                <td style={{padding: '0.85rem 0'}}>
                  <div>Selected Custom Add-ons</div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem'}}>
                    Tassels / Padding / Silk Lining
                  </div>
                </td>
                <td style={{textAlign: 'right', padding: '0.85rem 0', fontWeight: 600}}>
                  ₹{order.amount - order.design.price}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Clean Summary */}
        <div style={{borderTop: '1px solid #E5E7EB', paddingTop: '1rem', marginBottom: '1.5rem'}}>
          <div style={{maxWidth: '280px', marginLeft: 'auto', fontSize: '0.92rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-muted)'}}>
              <span>Total Stitching:</span>
              <strong style={{color: 'var(--text-main)'}}>₹{order.amount}</strong>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#16A34A', fontWeight: 600}}>
              <span>Paid Today ({isAdvance ? '20% Adv' : 'Full'}):</span>
              <span>- ₹{paidAmount}</span>
            </div>

            <div style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              paddingTop: '0.6rem', 
              marginTop: '0.4rem', 
              borderTop: '2px solid #E5E7EB', 
              fontSize: '1.15rem', 
              fontWeight: 800,
              color: 'var(--primary-color)'
            }}>
              <span>Balance Due:</span>
              <span>₹{balanceDue}</span>
            </div>
            
            {balanceDue > 0 && (
              <div style={{fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.2rem'}}>
                Payable before dispatch
              </div>
            )}
          </div>
        </div>

        {/* Simple Note & Contact */}
        <div style={{
          background: '#F9FAFB', 
          borderRadius: '8px', 
          padding: '1rem 1.25rem', 
          fontSize: '0.85rem', 
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            📌 <strong>Note:</strong> Courier bill copy will be shared for your reference upon dispatch.
          </div>
          <a 
            href={`https://wa.me/918341085629?text=Hello%20Ammaji%20Fashions,%20inquiry%20for%20order%20%23${order.orderNumber}%20(Txn%20Ref:%20${transactionNumber})`} 
            target="_blank" 
            rel="noreferrer" 
            style={{color: '#16A34A', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'}}
          >
            💬 WhatsApp Support
          </a>
        </div>

      </div>

      {/* Bottom Back Button */}
      <div style={{textAlign: 'center', marginTop: '2rem'}}>
        <Link to="/profile" style={{color: 'var(--primary-color)', fontSize: '0.95rem', textDecoration: 'underline'}}>
          ← Back to My Orders
        </Link>
      </div>

    </div>
  );
}

export default Success;
