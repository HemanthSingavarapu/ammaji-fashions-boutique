import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function Checkout() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const customData = location.state;
  
  const [step, setStep] = useState(1);
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (id === 'custom' && customData) {
      setDesign({
        id: 'custom',
        name: customData.customDesignName,
        price: customData.price,
        description: customData.customDesignDetails,
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
      });
      return;
    }
    if (id && id !== 'custom') {
      api.get(`/designs/${id}`)
        .then(res => setDesign(res.data))
        .catch(err => {
          // Fallback if network or mock ID
          setDesign({ id, price: 3500, name: "Bridal Heavy Blouse" });
        });
    }
  }, [id, customData]);
  
  const [measurement, setMeasurement] = useState({
    bust: '', waist: '', shoulder: '', blouseLength: '', 
    sleeveLength: '', armhole: '', frontNeck: '', backNeck: ''
  });
  
  useEffect(() => {
    if (user) {
      api.get('/users/me/measurements')
        .then(res => {
          if (res.data) {
            setMeasurement(prev => ({
              bust: res.data.bust != null ? res.data.bust : prev.bust,
              waist: res.data.waist != null ? res.data.waist : prev.waist,
              shoulder: res.data.shoulder != null ? res.data.shoulder : prev.shoulder,
              blouseLength: res.data.blouseLength != null ? res.data.blouseLength : prev.blouseLength,
              sleeveLength: res.data.sleeveLength != null ? res.data.sleeveLength : prev.sleeveLength,
              armhole: res.data.armhole != null ? res.data.armhole : prev.armhole,
              frontNeck: res.data.frontNeck != null ? res.data.frontNeck : prev.frontNeck,
              backNeck: res.data.backNeck != null ? res.data.backNeck : prev.backNeck
            }));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const [address, setAddress] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [differentPickup, setDifferentPickup] = useState(false);
  
  // Doorstep Pickup Preferences
  const [pickupSlot, setPickupSlot] = useState('Morning (10:00 AM - 01:00 PM)');
  const [pickupDay, setPickupDay] = useState('Tomorrow');

  const [instructions, setInstructions] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [paymentDetails, setPaymentDetails] = useState({ cardNo: '', expiry: '', cvv: '', upiId: '' });
  const [paymentType, setPaymentType] = useState('ADVANCE_20'); // 'ADVANCE_20' or 'FULL'
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [courierOption, setCourierOption] = useState('SELF'); // 'SELF' or 'BOUTIQUE'
  
  // Customizations
  const [addons, setAddons] = useState({
    tassels: false,
    padded: false,
    premiumLining: false
  });
  
  const ADDON_PRICES = {
    tassels: 150,
    padded: 250,
    premiumLining: 200
  };
  
  // Courier charges are excluded from online stitching order total (billed at actuals with bill copy shared)
  const COURIER_RETURN_CHARGE = 0;
  const COURIER_BOUTIQUE_CHARGE = 0;

  // 1. ENFORCE AUTHENTICATION
  useEffect(() => {
    if (!user) {
      alert("You must login or register to place an order!");
      navigate('/login');
    } else {
      setAddress(user.address || '');
      setPickupAddress(user.address || '');
    }
  }, [user, navigate]);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (step === 2 && timeLeft === 0) {
      alert("Payment session expired.");
      navigate('/');
    }
    return () => clearInterval(timer);
  }, [step, timeLeft, navigate]);

  // Separate effect to strictly scroll to top ONLY when 'step' changes!
  useEffect(() => {
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  const handleAddInstructionTag = (tag) => {
    setInstructions(prev => {
      if (!prev) return tag;
      if (prev.includes(tag)) return prev;
      return `${prev}, ${tag}`;
    });
  };

  const buildOrderPayload = () => {
    let finalAddress = address;
    if (courierOption === 'BOUTIQUE' && differentPickup && pickupAddress) {
      finalAddress = `DELIVERY: ${address} | PICKUP: ${pickupAddress}`;
    }
    let finalInstructions = instructions;
    const selectedAddons = Object.keys(addons).filter(key => addons[key]);
    if (selectedAddons.length > 0) {
      finalInstructions = `ADD-ONS REQUESTED: ${selectedAddons.join(', ')}\n` + finalInstructions;
    }
    if (courierOption === 'BOUTIQUE') {
      finalInstructions = `PICKUP SLOT: ${pickupDay} - ${pickupSlot}\n` + finalInstructions;
    }
    return {
      designId: id === 'custom' ? null : id,
      customDesignName: id === 'custom' ? design?.name : null,
      customDesignDetails: id === 'custom' ? design?.description : null,
      deliveryAddress: finalAddress,
      specialInstructions: finalInstructions,
      measurement: measurement,
      courierOption: courierOption,
      amount: finalPayableAmount,
      paymentType: paymentType,
      paidAmount: amountToPayToday,
      balanceAmount: remainingAmount
    };
  };

  const createOrderCall = async () => {
    const payload = buildOrderPayload();
    const res = await api.post('/orders', payload);
    setOrder(res.data);
    return res.data;
  };

  const handleCreateOrder = async () => {
    // Basic validations
    if (!measurement) {
      alert("Please provide your measurements or select a standard size.");
      return;
    }
    
    if (courierOption === 'BOUTIQUE' && differentPickup && !pickupAddress) {
      alert("Please provide a pickup address.");
      return;
    }
    
    if (!address) {
      alert("Please provide a delivery address.");
      return;
    }
    
    try {
      await createOrderCall();
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create order. Please try again.");
    }
  };

  const handlePayment = async (success) => {
    if (!success) {
      const confirmCancel = window.confirm("Are you sure you want to cancel the payment? Your order will not be placed.");
      if (!confirmCancel) return;
      
      setLoading(true);
      try {
        if (order && order.id) {
          // Delete unplaced pending order so it does not clutter profile
          await api.delete(`/orders/${order.id}`);
        }
      } catch (err) {
        try {
          await api.post(`/payments/dummy?orderId=${order.id}&success=false`);
        } catch (e) {}
      }
      setLoading(false);
      navigate('/');
      return;
    }
    
    // Validate Payment Details
    if (paymentMethod === 'Card') {
      if (paymentDetails.cardNo.length !== 16) { alert("Please enter a valid 16-digit card number"); return; }
      if (paymentDetails.expiry.length < 5) { alert("Please enter a valid expiry date (MM/YY)"); return; }
      if (paymentDetails.cvv.length !== 3) { alert("Please enter a valid 3-digit CVV"); return; }
    } else {
      if (paymentDetails.upiId.length < 5 || !paymentDetails.upiId.includes('@')) { alert("Please enter a valid UPI ID (e.g. name@ybl)"); return; }
    }

    setLoading(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randCode = Math.floor(100000 + Math.random() * 900000);
      const txnNumber = `TXN-${dateStr}-${randCode}`;

      let currentOrder = order;
      if (!currentOrder || !currentOrder.id) {
        currentOrder = await createOrderCall();
      }

      try {
        await api.post(`/payments/dummy?orderId=${currentOrder.id}&success=true&transactionNumber=${txnNumber}&paymentType=${paymentType}&paidAmount=${amountToPayToday}&balanceAmount=${remainingAmount}`);
      } catch (postErr) {
        // If order session expired or order not found in DB, re-create cleanly and retry payment
        if (postErr.response?.status === 404 || postErr.response?.status === 400) {
          currentOrder = await createOrderCall();
          await api.post(`/payments/dummy?orderId=${currentOrder.id}&success=true&transactionNumber=${txnNumber}&paymentType=${paymentType}&paidAmount=${amountToPayToday}&balanceAmount=${remainingAmount}`);
        } else {
          throw postErr;
        }
      }

      // Navigate to new Success/Invoice page!
      navigate('/success', { 
        state: { 
          orderNumber: currentOrder.orderNumber,
          transactionNumber: txnNumber,
          paidAmount: amountToPayToday,
          paymentType: paymentType,
          balanceAmount: remainingAmount
        } 
      });
    } catch (err) {
      console.error("Payment error:", err);
      const msg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response?.data : null) || "Payment processing error. Please try again.";
      alert(msg);
      setLoading(false);
    }
  };

  if(!user || !design) return <div className="container section">Loading...</div>;

  const currentCourierCharge = 0;
  
  const addonsTotal = (addons.tassels ? ADDON_PRICES.tassels : 0) + 
                      (addons.padded ? ADDON_PRICES.padded : 0) + 
                      (addons.premiumLining ? ADDON_PRICES.premiumLining : 0);

  const rawTotal = design.price + addonsTotal;
  const finalPayableAmount = rawTotal;

  const advance20Amount = Math.round(finalPayableAmount * 0.20);
  const amountToPayToday = paymentType === 'ADVANCE_20' ? advance20Amount : finalPayableAmount;
  const remainingAmount = finalPayableAmount - amountToPayToday;

  return (
    <div className="container section" style={{maxWidth: '850px'}}>
      <h2 className="section-title" style={{marginBottom: '2rem'}}>Complete Your Order</h2>
      
      {error && <div style={{color: 'white', backgroundColor: 'var(--error-color)', padding: '1rem', borderRadius: '6px', marginBottom: '2rem'}}>{error}</div>}

      <div className="card" style={{padding: '3rem'}}>
        
        {step === 1 && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', gap: '2rem', flexWrap: 'wrap'}}>
              <div style={{flex: '1', minWidth: '300px'}}>
                <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>{design.name}</h3>
                <p style={{color: 'var(--text-muted)'}}>Stitching Charges: ₹{design.price}</p>
                <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem', fontStyle: 'italic'}}>
                  (Excluding courier charges)
                </p>
              </div>
              <div style={{textAlign: 'right'}}>
                <p style={{fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0}}>
                  Total: ₹{finalPayableAmount}
                </p>
                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block'}}>
                  (Excluding courier charges)
                </span>
              </div>
            </div>

            {/* Measurements Section */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h4 style={{fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--primary-color)', margin: 0}}>Measurements (in inches)</h4>
              <Link to="/guide" style={{color: 'var(--primary-color)', fontSize: '0.9rem', textDecoration: 'underline'}}>Need help measuring?</Link>
            </div>
            
            <div className="grid-3" style={{gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
              {Object.keys(measurement).map(key => (
                <div className="form-group" key={key} style={{marginBottom: '0'}}>
                  <label className="form-label" style={{textTransform: 'capitalize'}}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input type="number" step="0.5" className="form-control" value={measurement[key]} onChange={e => setMeasurement({...measurement, [key]: e.target.value})} required />
                </div>
              ))}
            </div>

            {/* Courier Options */}
            <h4 style={{fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '3rem', marginBottom: '1.5rem'}}>Courier Options</h4>
            <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
              <label style={{border: '2px solid', borderColor: courierOption === 'SELF' ? 'var(--primary-color)' : 'var(--border-color)', padding: '1.5rem', borderRadius: '8px', cursor: 'pointer', flex: '1', minWidth: '250px', backgroundColor: courierOption === 'SELF' ? 'var(--bg-surface-elevated)' : 'transparent'}}>
                <input type="radio" name="courierOption" value="SELF" checked={courierOption === 'SELF'} onChange={(e) => setCourierOption(e.target.value)} style={{marginBottom: '1rem'}} />
                <h5 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Self Courier</h5>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>You courier your fabric to our workshop. We will stitch and return the finished blouse.</p>
              </label>
              
              <label style={{border: '2px solid', borderColor: courierOption === 'BOUTIQUE' ? 'var(--primary-color)' : 'var(--border-color)', padding: '1.5rem', borderRadius: '8px', cursor: 'pointer', flex: '1', minWidth: '250px', backgroundColor: courierOption === 'BOUTIQUE' ? 'var(--bg-surface-elevated)' : 'transparent'}}>
                <input type="radio" name="courierOption" value="BOUTIQUE" checked={courierOption === 'BOUTIQUE'} onChange={(e) => setCourierOption(e.target.value)} style={{marginBottom: '1rem'}} />
                <h5 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>Pickup & Drop</h5>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>We will arrange a courier valet to pick up raw fabric from your doorstep and drop off the finished blouse.</p>
              </label>
            </div>

            {/* Note about courier billing */}
            <div style={{background: 'var(--bg-surface-elevated)', padding: '0.85rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)'}}>
              📌 <strong>Note:</strong> Courier charges are not included in the stitching total. We will share the bill copy of the courier for your reference.
            </div>

            {/* Doorstep Valet Slot Picker */}
            {courierOption === 'BOUTIQUE' && (
              <div style={{padding: '1.25rem', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '8px', marginBottom: '1.5rem'}}>
                <h5 style={{color: '#6D28D9', margin: '0 0 0.75rem 0', fontSize: '0.95rem'}}>🛵 Doorstep Fabric Valet Scheduling</h5>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 500}}>Pickup Day</label>
                    <select 
                      value={pickupDay} 
                      onChange={e => setPickupDay(e.target.value)}
                      style={{width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                    >
                      <option value="Tomorrow">Tomorrow (Standard)</option>
                      <option value="Day After Tomorrow">Day After Tomorrow</option>
                      <option value="In 3 Days">In 3 Days</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 500}}>Preferred Time Slot</label>
                    <select 
                      value={pickupSlot} 
                      onChange={e => setPickupSlot(e.target.value)}
                      style={{width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                    >
                      <option value="Morning (10:00 AM - 01:00 PM)">Morning (10:00 AM - 01:00 PM)</option>
                      <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                      <option value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-group" style={{marginTop: '1rem'}}>
              <label className="form-label">{courierOption === 'BOUTIQUE' ? 'Delivery (Drop-off) Address' : 'Delivery Address'}</label>
              <textarea className="form-control" rows="2" value={address} onChange={e => setAddress(e.target.value)} required></textarea>
            </div>

            {courierOption === 'BOUTIQUE' && (
              <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem'}}>
                  <input type="checkbox" checked={differentPickup} onChange={e => setDifferentPickup(e.target.checked)} />
                  <span>Use a different address for pickup</span>
                </label>
                
                {differentPickup && (
                  <div className="form-group" style={{paddingLeft: '1.5rem', borderLeft: '3px solid var(--primary-color)'}}>
                    <label className="form-label">Pickup Address</label>
                    <textarea className="form-control" rows="2" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} required placeholder="Enter the address where we should pick up the unstitched fabric..."></textarea>
                  </div>
                )}
              </div>
            )}

            {/* Customizations */}
            <h4 style={{fontFamily: 'var(--font-sans)', fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '2.5rem', marginBottom: '1rem'}}>Premium Customizations (Optional)</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: addons.tassels ? 'var(--bg-surface-elevated)' : 'transparent'}}>
                <input type="checkbox" checked={addons.tassels} onChange={e => setAddons({...addons, tassels: e.target.checked})} />
                <div>
                  <div style={{fontWeight: 'bold'}}>Designer Tassels</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>+ ₹{ADDON_PRICES.tassels}</div>
                </div>
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: addons.padded ? 'var(--bg-surface-elevated)' : 'transparent'}}>
                <input type="checkbox" checked={addons.padded} onChange={e => setAddons({...addons, padded: e.target.checked})} />
                <div>
                  <div style={{fontWeight: 'bold'}}>Padded Cups</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>+ ₹{ADDON_PRICES.padded}</div>
                </div>
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: addons.premiumLining ? 'var(--bg-surface-elevated)' : 'transparent'}}>
                <input type="checkbox" checked={addons.premiumLining} onChange={e => setAddons({...addons, premiumLining: e.target.checked})} />
                <div>
                  <div style={{fontWeight: 'bold'}}>Premium Silk Lining</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>+ ₹{ADDON_PRICES.premiumLining}</div>
                </div>
              </label>
            </div>

            {/* Special Instructions & Quick Chips */}
            <div className="form-group">
              <label className="form-label">Special Tailoring Instructions</label>
              
              {/* Quick Suggestion Chips */}
              <div style={{display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem'}}>
                {[
                  "Leave 2-inch side margin",
                  "Attach contrast latkans",
                  "Keep deep sweetheart back",
                  "Double pre-washed lining",
                  "Front opening hooks"
                ].map((chip, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    onClick={() => handleAddInstructionTag(chip)}
                    style={{fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '15px', cursor: 'pointer'}}
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <textarea className="form-control" rows="3" placeholder="e.g. Keep back neck slightly deeper..." value={instructions} onChange={e => setInstructions(e.target.value)}></textarea>
            </div>
            
            <button onClick={handleCreateOrder} className="btn btn-primary" style={{marginTop: '1.5rem', padding: '1rem 3rem', width: '100%', fontSize: '1.1rem'}}>
              Proceed to Payment (₹{finalPayableAmount})
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{fontSize: '2rem', marginBottom: '1rem', textAlign: 'center'}}>Secure Payment</h3>
            
            {/* Payment Choice: 20% Advance vs Full Payment */}
            <div style={{marginBottom: '2rem'}}>
              <h4 style={{fontSize: '1.15rem', color: 'var(--primary-color)', marginBottom: '1rem'}}>
                Select Payment Option
              </h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem'}}>
                <label style={{
                  border: '2px solid',
                  borderColor: paymentType === 'ADVANCE_20' ? 'var(--primary-color)' : 'var(--border-color)',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: paymentType === 'ADVANCE_20' ? 'var(--bg-surface-elevated)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                    <input 
                      type="radio" 
                      name="paymentType" 
                      value="ADVANCE_20" 
                      checked={paymentType === 'ADVANCE_20'} 
                      onChange={() => setPaymentType('ADVANCE_20')} 
                    />
                    <span style={{fontWeight: 700, fontSize: '1.05rem'}}>20% Advance Booking</span>
                  </div>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '0.2rem'}}>
                    ₹{advance20Amount}
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0}}>
                    Pay 20% today to confirm your atelier slot. Remaining balance of ₹{finalPayableAmount - advance20Amount} payable upon dispatch.
                  </p>
                </label>

                <label style={{
                  border: '2px solid',
                  borderColor: paymentType === 'FULL' ? 'var(--primary-color)' : 'var(--border-color)',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: paymentType === 'FULL' ? 'var(--bg-surface-elevated)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
                    <input 
                      type="radio" 
                      name="paymentType" 
                      value="FULL" 
                      checked={paymentType === 'FULL'} 
                      onChange={() => setPaymentType('FULL')} 
                    />
                    <span style={{fontWeight: 700, fontSize: '1.05rem'}}>Full Payment (100%)</span>
                  </div>
                  <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '0.2rem'}}>
                    ₹{finalPayableAmount}
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0}}>
                    Complete full payment upfront. Enjoy zero remaining balance when your blouse is ready.
                  </p>
                </label>
              </div>
            </div>

            <div style={{backgroundColor: 'var(--bg-surface-elevated)', padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--border-color)'}}>
              <h4 style={{marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>Payment Breakdown</h4>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>
                <span>Stitching Charges:</span>
                <span>₹{design.price}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>
                <span>Courier Charges ({courierOption === 'BOUTIQUE' ? 'Pickup & Drop' : 'Self Courier'}):</span>
                <span style={{fontStyle: 'italic'}}>Excluded (Bill copy will be shared)</span>
              </div>
              
              {addonsTotal > 0 && (
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>
                  <span>Premium Add-ons:</span>
                  <span>₹{addonsTotal}</span>
                </div>
              )}
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '1.15rem'}}>
                <span>Stitching Total (Excl. Courier):</span>
                <span>₹{finalPayableAmount}</span>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.2rem'}}>
                <span>Payable Today ({paymentType === 'ADVANCE_20' ? '20% Advance' : '100% Full Payment'}):</span>
                <span>₹{amountToPayToday}</span>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem'}}>
                <span>Remaining Balance (Pay upon completion):</span>
                <span>₹{remainingAmount}</span>
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h4 style={{margin: 0}}>Select Payment Method</h4>
              <div style={{color: 'var(--error-color)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
              {['Card', 'PhonePe'].map(method => (
                <label key={method} style={{border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '150px', backgroundColor: paymentMethod === method ? 'var(--bg-surface-elevated)' : 'transparent'}}>
                  <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                  {method}
                </label>
              ))}
            </div>

            {/* Payment Details Form */}
            <div style={{marginBottom: '2rem'}}>
              {paymentMethod === 'Card' ? (
                <div style={{display: 'grid', gap: '1rem'}}>
                  <div>
                    <label className="form-label">Card Number <span style={{color:'red'}}>*</span></label>
                    <input type="text" className="form-control" placeholder="16-digit card number" maxLength="16" value={paymentDetails.cardNo} onChange={(e) => { if(/^[0-9]*$/.test(e.target.value)) setPaymentDetails({...paymentDetails, cardNo: e.target.value}) }} required />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div>
                      <label className="form-label">Expiry (MM/YY) <span style={{color:'red'}}>*</span></label>
                      <input type="text" className="form-control" placeholder="MM/YY" maxLength="5" value={paymentDetails.expiry} onChange={(e) => setPaymentDetails({...paymentDetails, expiry: e.target.value})} required />
                    </div>
                    <div>
                      <label className="form-label">CVV <span style={{color:'red'}}>*</span></label>
                      <input type="text" className="form-control" placeholder="123" maxLength="3" value={paymentDetails.cvv} onChange={(e) => { if(/^[0-9]*$/.test(e.target.value)) setPaymentDetails({...paymentDetails, cvv: e.target.value}) }} required />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="form-label">PhonePe UPI ID <span style={{color:'red'}}>*</span></label>
                  <input type="text" className="form-control" placeholder="e.g. yourname@ybl or 9876543210@upi" value={paymentDetails.upiId} onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})} required />
                </div>
              )}
            </div>
            
            <div style={{textAlign: 'center', marginTop: '3rem'}}>
              <p style={{marginBottom: '1.5rem'}}>
                Pay <strong>₹{amountToPayToday}</strong> ({paymentType === 'ADVANCE_20' ? '20% Advance' : 'Full Payment'}) via {paymentMethod}
              </p>
              <div style={{display: 'flex', gap: '1.5rem', justifyContent: 'center'}}>
                <button onClick={() => handlePayment(true)} className="btn btn-primary" style={{backgroundColor: 'var(--success-color)', padding: '1rem 2rem'}} disabled={loading}>
                  {loading ? 'Processing...' : `Pay ₹${amountToPayToday}`}
                </button>
                <button onClick={() => handlePayment(false)} className="btn btn-primary" style={{backgroundColor: 'var(--error-color)', padding: '1rem 2rem'}} disabled={loading}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{textAlign: 'center', padding: '2rem 0'}}>
            <div style={{fontSize: '5rem', color: 'var(--success-color)', marginBottom: '1.5rem'}}>✓</div>
            <h2 style={{fontFamily: 'var(--font-serif)', fontSize: '2.5rem'}}>Order Received!</h2>
            <p style={{fontSize: '1.2rem', margin: '1.5rem 0'}}>Your Order Number is: <strong style={{color: 'var(--primary-color)'}}>{order.orderNumber}</strong></p>
            
            <div style={{backgroundColor: 'var(--bg-surface-elevated)', padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', textAlign: 'left'}}>
              <p style={{color: 'var(--text-main)', fontWeight: '500', fontSize: '1.2rem', marginBottom: '1rem'}}>Next Steps:</p>
              
              {courierOption === 'BOUTIQUE' ? (
                <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
                  <div style={{fontSize: '2rem'}}>🚚</div>
                  <div>
                    <p style={{color: 'var(--text-main)', fontWeight: 'bold'}}>We will pick up your fabric!</p>
                    <p style={{color: 'var(--text-muted)', marginTop: '0.5rem'}}>Please pack your unstitched fabric in a secure package. Our courier partner will pick it up on <strong>{pickupDay} ({pickupSlot})</strong> from your pickup address. Ensure your Order Number ({order.orderNumber}) is written on the package.</p>
                  </div>
                </div>
              ) : (
                <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
                  <div style={{fontSize: '2rem'}}>📦</div>
                  <div>
                    <p style={{color: 'var(--text-main)', fontWeight: 'bold'}}>Please courier your fabric to us.</p>
                    <p style={{color: 'var(--text-muted)', marginTop: '0.5rem'}}>Pack your unstitched fabric and courier it to our workshop address. You are responsible for the courier charges to send the material to us. Ensure your Order Number ({order.orderNumber}) is written on the package.</p>
                  </div>
                </div>
              )}
              
              <p style={{color: 'var(--text-muted)', marginTop: '1.5rem', fontSize: '0.95rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                {remainingAmount > 0 ? (
                  <>Note: Your remaining balance of <strong>₹{remainingAmount}</strong> will be due once the blouse is stitched and ready for final delivery. Courier charges will be shared via bill copy for your reference.</>
                ) : (
                  <>Note: <strong>Full payment completed!</strong> Zero remaining stitching balance. Courier charges will be shared via bill copy for your reference.</>
                )}
              </p>
            </div>
            
            <button onClick={() => navigate('/track')} className="btn btn-primary" style={{padding: '1rem 3rem'}}>Track Order Status</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default Checkout;
