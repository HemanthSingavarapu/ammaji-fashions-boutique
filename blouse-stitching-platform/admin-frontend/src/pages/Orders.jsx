import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status Update Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('MATERIAL_RECEIVED');
  const [comment, setComment] = useState('');

  // Shipping Label Modal
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [labelOrder, setLabelOrder] = useState(null);

  // Order Details Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);

  const navigate = useNavigate();

  const fetchOrders = () => {
    setLoading(true);
    api.get('/admin/orders')
      .then(res => {
        setOrders(res.data.sort((a,b) => b.id - a.id));
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        if(err.response?.status === 401) navigate('/login');
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setComment('');
    setShowModal(true);
  };

  const handleLabelClick = (order) => {
    setLabelOrder(order);
    setShowLabelModal(true);
  };

  const handleDetailClick = (order) => {
    setDetailOrder(order);
    setShowDetailModal(true);
  };

  const submitUpdate = () => {
    if(!selectedOrder) return;
    
    api.put(`/admin/orders/${selectedOrder.id}/status?status=${newStatus}&comment=${encodeURIComponent(comment || 'Status updated by admin')}`)
      .then(() => {
        setShowModal(false);
        fetchOrders();
      })
      .catch(err => alert('Failed to update status'));
  };

  const exportToCSV = () => {
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }
    const headers = ["Order Number", "Customer Name", "Customer Email", "Customer Phone", "Design", "Amount (INR)", "Payment Status", "Order Status", "Date"];
    const rows = orders.map(o => [
      `"${o.orderNumber || ''}"`,
      `"${o.user?.name || 'Customer'}"`,
      `"${o.user?.email || ''}"`,
      `"${o.user?.mobile || ''}"`,
      `"${o.design?.name || o.customDesignName || 'Custom Stitch'}"`,
      o.amount || 0,
      `"${o.paymentStatus || 'PENDING'}"`,
      `"${o.orderStatus || ''}"`,
      `"${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.mobile && order.user.mobile.includes(searchTerm));
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'IN_PROGRESS') {
      return matchesSearch && !['DELIVERED', 'CANCELLED', 'ORDER_PLACED'].includes(order.orderStatus);
    }
    return matchesSearch && order.orderStatus === statusFilter;
  });

  return (
    <div className="page-content">
      {/* Top Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h1 className="page-title" style={{margin: 0}}>Order Management</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem'}}>
            Review custom stitching requests, manage progress, and generate shipping labels.
          </p>
        </div>
        <div style={{display: 'flex', gap: '0.75rem'}}>
          <button className="btn btn-outline" onClick={fetchOrders} title="Refresh data">
            🔄 Refresh
          </button>
          <button className="btn btn-primary" onClick={exportToCSV} style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            📥 Export to CSV
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="card" style={{padding: '1rem 1.5rem', marginBottom: '1.5rem'}}>
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{position: 'relative', flex: '1', minWidth: '260px'}}>
            <input 
              type="text" 
              placeholder="Search by Order #, Customer Name, or Phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', 
                padding: '0.65rem 1rem', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem'
              }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999'}}
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
            {[
              { key: 'ALL', label: `All (${orders.length})` },
              { key: 'IN_PROGRESS', label: 'In Progress' },
              { key: 'READY_FOR_DELIVERY', label: 'Ready' },
              { key: 'DELIVERED', label: 'Delivered' },
              { key: 'CANCELLED', label: 'Cancelled' }
            ].map(tab => (
              <button 
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.85rem',
                  borderRadius: '20px',
                  border: statusFilter === tab.key ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: statusFilter === tab.key ? 'var(--primary)' : '#fff',
                  color: statusFilter === tab.key ? '#fff' : 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="card">
        {loading ? (
          <p style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>Loading live orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem 1rem'}}>
            <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>📦</div>
            <p style={{fontWeight: 500}}>No orders match your filter criteria.</p>
            {searchTerm && <button className="btn btn-outline" style={{marginTop: '0.75rem'}} onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>Clear Filters</button>}
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Design / Style</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <span 
                        onClick={() => handleDetailClick(order)} 
                        style={{color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'}}
                        title="Click to view full details"
                      >
                        {order.orderNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{fontWeight: 600}}>{order.user?.name || 'Customer'}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{order.user?.mobile || order.user?.email || 'N/A'}</div>
                    </td>
                    <td>
                      <div>{order.design?.name || order.customDesignName || 'Custom Blouse'}</div>
                      {order.courierOption === 'BOUTIQUE' && (
                        <span style={{fontSize: '0.75rem', background: '#F3E8FF', color: '#6B21A8', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.2rem'}}>
                          🛵 Boutique Pickup
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{color: 'var(--text-main)'}}>₹{order.amount}</strong>
                    </td>
                    <td>
                      <span className={`badge ${order.paymentStatus === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>
                        {order.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        order.orderStatus === 'DELIVERED' ? 'badge-success' : 
                        order.orderStatus === 'CANCELLED' ? 'badge-warning' : 
                        order.orderStatus.includes('READY') ? 'badge-primary' : 'badge-primary'
                      }`} style={order.orderStatus === 'CANCELLED' ? {background: '#FEE2E2', color: '#B91C1C'} : {}}>
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{textAlign: 'right'}}>
                      <div style={{display: 'inline-flex', gap: '0.5rem', alignItems: 'center'}}>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleDetailClick(order)}
                          style={{padding: '0.35rem 0.65rem', fontSize: '0.8rem'}}
                          title="View Details"
                        >
                          👁️ View
                        </button>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleLabelClick(order)}
                          style={{padding: '0.35rem 0.65rem', fontSize: '0.8rem', backgroundColor: '#F9FAFB'}}
                          title="Print Shipping Courier Label"
                        >
                          🏷️ Label
                        </button>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleUpdateClick(order)}
                          style={{padding: '0.35rem 0.65rem', fontSize: '0.8rem'}}
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPDATE STATUS MODAL */}
      {showModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="card" style={{width: '520px', maxWidth: '90%', margin: '0', maxHeight: '90vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem'}}>
              <h3 style={{margin: 0}}>Update Status: {selectedOrder?.orderNumber}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer'}}>✕</button>
            </div>

            <div style={{marginTop: '1.25rem', marginBottom: '1.25rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Select Stage</label>
              <select 
                value={newStatus} 
                onChange={e=>setNewStatus(e.target.value)} 
                style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.95rem'}}
              >
                <option value="MATERIAL_AWAITING">MATERIAL AWAITING (Awaiting saree/fabric delivery)</option>
                <option value="MATERIAL_RECEIVED">MATERIAL RECEIVED (Fabric received at workshop)</option>
                <option value="DESIGNING_IN_PROGRESS">DESIGNING IN PROGRESS (Pattern tracing & cutting)</option>
                <option value="STITCHING_IN_PROGRESS">STITCHING IN PROGRESS (Master tailor stitching)</option>
                <option value="QUALITY_CHECK">QUALITY CHECK (Measurement & finishing check)</option>
                <option value="READY_FOR_DELIVERY">READY FOR DELIVERY (Packed with boutique box)</option>
                <option value="SHIPPED">SHIPPED (Handed to courier / out for delivery)</option>
                <option value="DELIVERED">DELIVERED (Delivered to customer)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            {/* Quick Comment Templates */}
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                Quick Suggestions:
              </label>
              <div style={{display: 'flex', gap: '0.4rem', flexWrap: 'wrap'}}>
                {[
                  "Fabric received & matched with design.",
                  "Master cutting started as per measurements.",
                  "Maggam work & stitching underway.",
                  "Passed quality check, packed securely.",
                  "Dispatched via courier, AWB generated."
                ].map((txt, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    onClick={() => setComment(txt)}
                    style={{fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '4px', cursor: 'pointer'}}
                  >
                    {txt.split(' ')[0]} {txt.split(' ')[1]}...
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Notes / Progress Comment for Customer</label>
              <textarea 
                value={comment} 
                onChange={e=>setComment(e.target.value)} 
                style={{width: '100%', padding: '0.65rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.9rem'}} 
                rows="3" 
                placeholder="Write specific notes on fabric, fitting, or shipment..."
              ></textarea>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'}}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitUpdate}>Save & Notify Customer</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {showDetailModal && detailOrder && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="card" style={{width: '600px', maxWidth: '90%', margin: '0', maxHeight: '90vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem'}}>
              <h3 style={{margin: 0}}>Order Details #{detailOrder.orderNumber}</h3>
              <button onClick={() => setShowDetailModal(false)} style={{background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer'}}>✕</button>
            </div>

            <div style={{padding: '1.5rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem'}}>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>CUSTOMER</div>
                <div style={{fontWeight: 600, marginTop: '0.2rem'}}>{detailOrder.user?.name || 'Customer'}</div>
                <div style={{fontSize: '0.85rem'}}>{detailOrder.user?.email}</div>
                <div style={{fontSize: '0.85rem'}}>{detailOrder.user?.mobile}</div>
              </div>
              <div>
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>BILLING & STATUS</div>
                <div style={{fontWeight: 600, marginTop: '0.2rem'}}>Total: ₹{detailOrder.amount} (Excl. Courier)</div>
                <div style={{fontSize: '0.85rem'}}>Plan: <strong>{detailOrder.paymentType === 'ADVANCE_20' ? '20% Advance' : 'Full Payment'}</strong></div>
                <div style={{fontSize: '0.85rem'}}>Paid: <strong>₹{detailOrder.paidAmount != null ? detailOrder.paidAmount : (detailOrder.paymentType === 'ADVANCE_20' ? Math.round(detailOrder.amount * 0.20) : detailOrder.amount)}</strong> | Balance: <strong>₹{detailOrder.balanceAmount != null ? detailOrder.balanceAmount : 0}</strong></div>
                <div style={{fontSize: '0.85rem'}}>Txn Ref: <code style={{color: 'var(--primary)'}}>{detailOrder.transactionNumber || 'N/A'}</code></div>
                <div style={{fontSize: '0.85rem'}}>Status: <strong>{detailOrder.orderStatus}</strong></div>
                {detailOrder.refundStatus && (
                  <div style={{fontSize: '0.85rem', color: '#B45309', fontWeight: 600}}>Refund: {detailOrder.refundStatus}</div>
                )}
              </div>

              <div style={{gridColumn: '1 / -1', borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>DESIGN / PRODUCT</div>
                <div style={{fontWeight: 600, marginTop: '0.2rem'}}>{detailOrder.design?.name || detailOrder.customDesignName || 'Custom Style'}</div>
                {detailOrder.customDesignDetails && <p style={{fontSize: '0.85rem', color: '#555', marginTop: '0.25rem'}}>{detailOrder.customDesignDetails}</p>}
              </div>

              <div style={{gridColumn: '1 / -1'}}>
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>MEASUREMENTS PROVIDED</div>
                <div style={{background: '#F9FAFB', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', marginTop: '0.35rem', border: '1px solid #E5E7EB'}}>
                  {detailOrder.measurement || 'Standard Size'}
                </div>
              </div>

              <div style={{gridColumn: '1 / -1'}}>
                <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>DELIVERY & PICKUP ADDRESS</div>
                <div style={{background: '#F9FAFB', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem', marginTop: '0.35rem', border: '1px solid #E5E7EB'}}>
                  {detailOrder.deliveryAddress || 'Address on file'}
                </div>
              </div>

              {detailOrder.specialInstructions && (
                <div style={{gridColumn: '1 / -1'}}>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>SPECIAL CUSTOMIZATION NOTES</div>
                  <div style={{background: '#FFFBEB', padding: '0.75rem', borderRadius: '4px', fontSize: '0.85rem', color: '#92400E', marginTop: '0.35rem', border: '1px solid #FDE68A'}}>
                    {detailOrder.specialInstructions}
                  </div>
                </div>
              )}
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
              <button className="btn btn-outline" onClick={() => { setShowDetailModal(false); handleLabelClick(detailOrder); }}>🏷️ Print Shipping Label</button>
              <button className="btn btn-primary" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE SHIPPING LABEL MODAL */}
      {showLabelModal && labelOrder && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000}}>
          <div style={{background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '650px', width: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h3 style={{margin: 0}}>Courier Shipping Label</h3>
              <button onClick={() => setShowLabelModal(false)} style={{background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer'}}>✕</button>
            </div>

            {/* THE SHIPPING LABEL CONTAINER */}
            <div id="printable-shipping-label" style={{border: '2px solid #000', padding: '1.5rem', backgroundColor: '#fff', color: '#000', fontFamily: 'Arial, sans-serif'}}>
              {/* Header */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '1rem'}}>
                <div>
                  <div style={{fontSize: '1.25rem', fontWeight: 900, letterSpacing: '1px'}}>BOUTIQUE EXPRESS</div>
                  <div style={{fontSize: '0.75rem', color: '#444'}}>PRIORITY APPAREL LOGISTICS</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: '0.75rem', fontWeight: 'bold'}}>PREPAID SHIPMENT</div>
                  <div style={{fontSize: '1rem', fontWeight: 'bold', color: '#000'}}>AWB: EXP-{labelOrder.orderNumber}</div>
                </div>
              </div>

              {/* Barcode Graphic */}
              <div style={{textAlign: 'center', margin: '0.75rem 0', padding: '0.5rem', background: '#f8f8f8', border: '1px dashed #666'}}>
                <div style={{fontFamily: 'monospace', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold'}}>
                  |||||| |||||||| |||| ||||||||| ||||||| ||||||
                </div>
                <div style={{fontSize: '0.75rem', letterSpacing: '2px', marginTop: '4px'}}>
                  *{labelOrder.orderNumber}*
                </div>
              </div>

              {/* Sender & Receiver Address Grid */}
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '2px solid #000', borderBottom: '2px solid #000', padding: '1rem 0'}}>
                <div style={{borderRight: '1px solid #ddd', paddingRight: '0.75rem'}}>
                  <div style={{fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', marginBottom: '4px'}}>SHIP FROM:</div>
                  <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>BOUTIQUE BLOUSE STUDIO</div>
                  <div style={{fontSize: '0.8rem', lineHeight: '1.3', marginTop: '2px'}}>
                    Studio #402, Fashion District, MG Road<br />
                    Bangalore, Karnataka - 560001<br />
                    Phone: +91 98765 43210
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', marginBottom: '4px'}}>DELIVER TO:</div>
                  <div style={{fontWeight: 'bold', fontSize: '0.95rem'}}>{labelOrder.user?.name || 'Customer'}</div>
                  <div style={{fontSize: '0.85rem', lineHeight: '1.4', marginTop: '2px'}}>
                    {labelOrder.deliveryAddress || 'Address on file'}<br />
                    <strong>Contact:</strong> {labelOrder.user?.mobile || labelOrder.user?.email || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Package & Order Details */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '0.75rem 0', borderBottom: '1px solid #000', fontSize: '0.8rem'}}>
                <div>
                  <span style={{color: '#666'}}>Order #: </span>
                  <strong>{labelOrder.orderNumber}</strong>
                </div>
                <div>
                  <span style={{color: '#666'}}>Weight: </span>
                  <strong>0.65 KG</strong>
                </div>
                <div>
                  <span style={{color: '#666'}}>Contents: </span>
                  <strong>Stitched Apparel</strong>
                </div>
              </div>

              {/* Footer Declaration */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.7rem', color: '#555'}}>
                <div>
                  Crafted & Inspected with 100% Quality Assurance.<br />
                  Non-hazardous standard dry apparel parcel.
                </div>
                <div style={{border: '1px solid #999', padding: '4px 8px', textAlign: 'center'}}>
                  QC PASSED ✔
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem'}}>
              <button className="btn btn-outline" onClick={() => setShowLabelModal(false)}>Close</button>
              <button 
                className="btn btn-primary" 
                onClick={() => window.print()}
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
              >
                🖨️ Print Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
