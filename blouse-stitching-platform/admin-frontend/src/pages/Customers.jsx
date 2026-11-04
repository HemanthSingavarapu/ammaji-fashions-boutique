import { useState, useEffect } from 'react';
import api from '../services/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/admin/users'),
      api.get('/admin/orders')
    ])
      .then(([usersRes, ordersRes]) => {
        setCustomers(usersRes.data.filter(u => u.role === 'USER'));
        setOrders(ordersRes.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getCustomerMetrics = (customerId, customerEmail) => {
    const userOrders = orders.filter(o => 
      (o.user && o.user.id === customerId) || 
      (o.user && o.user.email === customerEmail)
    );
    const totalSpend = userOrders.reduce((sum, o) => sum + (o.paymentStatus === 'SUCCESS' ? (o.amount || 0) : 0), 0);
    return {
      orderCount: userOrders.length,
      totalSpend,
      orders: userOrders
    };
  };

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.mobile && c.mobile.includes(term)) ||
      (c.city && c.city.toLowerCase().includes(term))
    );
  });

  return (
    <div className="page-content">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="page-title" style={{margin: 0}}>Customers Directory</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem'}}>
            View registered clients, order frequency, lifetime value, and delivery profiles.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="card" style={{padding: '1rem 1.5rem', marginBottom: '1.5rem'}}>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <input 
            type="text" 
            placeholder="Search customers by name, phone, email, or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', 
              maxWidth: '450px',
              padding: '0.65rem 1rem', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem'
            }}
          />
          {searchTerm && (
            <button 
              className="btn btn-outline" 
              onClick={() => setSearchTerm('')}
              style={{padding: '0.65rem 1rem', fontSize: '0.85rem'}}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p style={{textAlign: 'center', padding: '2rem'}}>Loading customers...</p>
        ) : filteredCustomers.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem 1rem'}}>
            <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>👥</div>
            <p style={{fontWeight: 500}}>No customers match your search criteria.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="table" style={{width: '100%'}}>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Orders</th>
                  <th>Lifetime Spend</th>
                  <th>Tier</th>
                  <th style={{textAlign: 'right'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => {
                  const metrics = getCustomerMetrics(c.id, c.email);
                  const isVip = metrics.totalSpend >= 5000;
                  const isRegular = metrics.totalSpend > 0;

                  return (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>
                        <div style={{fontWeight: 600}}>{c.name}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Joined member</div>
                      </td>
                      <td>
                        <div>{c.email}</div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{c.mobile || 'No phone'}</div>
                      </td>
                      <td>
                        {c.city ? `${c.city}${c.state ? ', ' + c.state : ''}` : 'Not provided'}
                      </td>
                      <td>
                        <strong>{metrics.orderCount}</strong> {metrics.orderCount === 1 ? 'order' : 'orders'}
                      </td>
                      <td>
                        <strong style={{color: metrics.totalSpend > 0 ? 'var(--primary)' : 'var(--text-muted)'}}>
                          ₹{metrics.totalSpend.toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        {isVip ? (
                          <span className="badge" style={{background: '#FEF3C7', color: '#92400E'}}>👑 VIP</span>
                        ) : isRegular ? (
                          <span className="badge" style={{background: '#DBEAFE', color: '#1E40AF'}}>Active</span>
                        ) : (
                          <span className="badge" style={{background: '#F3F4F6', color: '#6B7280'}}>New</span>
                        )}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => setSelectedCustomer({ ...c, metrics })}
                          style={{padding: '0.35rem 0.75rem', fontSize: '0.8rem'}}
                        >
                          Profile 🔍
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOMER PROFILE DRAWER / MODAL */}
      {selectedCustomer && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="card" style={{width: '600px', maxWidth: '90%', margin: 0, maxHeight: '90vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem'}}>
              <h3 style={{margin: 0}}>Customer Profile: {selectedCustomer.name}</h3>
              <button onClick={() => setSelectedCustomer(null)} style={{background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer'}}>✕</button>
            </div>

            <div style={{padding: '1.5rem 0'}}>
              {/* Overview Metrics Cards */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', textAlign: 'center'}}>
                <div style={{background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #E5E7EB'}}>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>TOTAL ORDERS</div>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold'}}>{selectedCustomer.metrics.orderCount}</div>
                </div>
                <div style={{background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #E5E7EB'}}>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>LIFETIME SPEND</div>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)'}}>₹{selectedCustomer.metrics.totalSpend.toLocaleString('en-IN')}</div>
                </div>
                <div style={{background: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #E5E7EB'}}>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>STATUS</div>
                  <div style={{fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem'}}>
                    {selectedCustomer.metrics.totalSpend >= 5000 ? '👑 VIP' : 'Regular'}
                  </div>
                </div>
              </div>

              {/* Personal & Address Info */}
              <div style={{marginBottom: '1.5rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem'}}>
                <h4 style={{fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-main)'}}>Contact & Delivery Address</h4>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem'}}>
                  <div><strong>Email:</strong> {selectedCustomer.email}</div>
                  <div><strong>Phone:</strong> {selectedCustomer.mobile || 'N/A'}</div>
                  <div style={{gridColumn: '1 / -1'}}>
                    <strong>Address:</strong> {selectedCustomer.address ? `${selectedCustomer.address}, ${selectedCustomer.city || ''} ${selectedCustomer.state || ''} - ${selectedCustomer.pincode || ''}` : 'No saved address'}
                  </div>
                </div>
              </div>

              {/* Customer Past Orders */}
              <div>
                <h4 style={{fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-main)'}}>Order History ({selectedCustomer.metrics.orders.length})</h4>
                {selectedCustomer.metrics.orders.length === 0 ? (
                  <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>No orders placed yet.</p>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {selectedCustomer.metrics.orders.map(o => (
                      <div key={o.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '0.85rem'}}>
                        <div>
                          <strong>{o.orderNumber}</strong> — {o.design?.name || o.customDesignName || 'Custom Blouse'}
                        </div>
                        <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                          <strong>₹{o.amount}</strong>
                          <span className={`badge ${o.orderStatus === 'DELIVERED' ? 'badge-success' : 'badge-primary'}`}>
                            {o.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
              {selectedCustomer.mobile ? (
                <a 
                  href={`https://wa.me/91${selectedCustomer.mobile.replace(/\D/g, '')}?text=Hello ${encodeURIComponent(selectedCustomer.name)}, this is Ammaji Fashions regarding your stitching order.`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16A34A', borderColor: '#16A34A', textDecoration: 'none'}}
                >
                  💬 Chat on WhatsApp
                </a>
              ) : <div />}
              <button className="btn btn-primary" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
