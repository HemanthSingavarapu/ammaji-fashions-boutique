import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  QrCodeIcon, 
  CreditCardIcon, 
  BankIcon, 
  TruckIcon, 
  PackageIcon, 
  CopyIcon, 
  ClockIcon, 
  InfoIcon 
} from '../components/Icons';
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
  
  const [paymentMethod, setPaymentMethod] = useState('UPI_QR');
  const [paymentDetails, setPaymentDetails] = useState({ cardNo: '', cardName: '', expiry: '', cvv: '', upiId: '', utr: '', bank: 'State Bank of India' });
  const [upiData, setUpiData] = useState(null);
  const [paymentType, setPaymentType] = useState('ADVANCE_20'); // 'ADVANCE_20' or 'FULL'
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [courierOption, setCourierOption] = useState('SELF'); // 'SELF' or 'BOUTIQUE'
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = (text, label) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(''), 2500);
    } catch (e) {
      console.warn("Clipboard copy error:", e);
    }
  };
  
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

  // Real-time calculations (declared at top level)
  const addonsTotal = (addons.tassels ? ADDON_PRICES.tassels : 0) + 
                      (addons.padded ? ADDON_PRICES.padded : 0) + 
                      (addons.premiumLining ? ADDON_PRICES.premiumLining : 0);

  const designPrice = design ? Number(design.price || 0) : 0;
  const finalPayableAmount = designPrice + addonsTotal;
  const advance20Amount = Math.round(finalPayableAmount * 0.20);
  const amountToPayToday = paymentType === 'ADVANCE_20' ? advance20Amount : finalPayableAmount;
  const remainingAmount = finalPayableAmount - amountToPayToday;

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

  useEffect(() => {
    if (step === 2 && amountToPayToday > 0) {
      api.get(`/payments/upi-info?amount=${amountToPayToday}&orderNumber=NEW_ORDER`)
        .then(res => setUpiData(res.data))
        .catch(() => {});
    }
  }, [step, amountToPayToday]);

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

    const cleanedMeasurement = {};
    if (measurement) {
      ['bust', 'waist', 'shoulder', 'blouseLength', 'sleeveLength', 'armhole', 'frontNeck', 'backNeck'].forEach(k => {
        const val = measurement[k];
        if (val !== '' && val !== null && val !== undefined && !isNaN(Number(val))) {
          cleanedMeasurement[k] = Number(val);
        } else {
          cleanedMeasurement[k] = null;
        }
      });
    }

    const parsedDesignId = (id && id !== 'custom' && !isNaN(Number(id))) ? parseInt(id, 10) : null;

    return {
      designId: parsedDesignId,
      customDesignName: id === 'custom' ? design?.name : null,
      customDesignDetails: id === 'custom' ? design?.description : null,
      deliveryAddress: finalAddress,
      specialInstructions: finalInstructions,
      measurement: cleanedMeasurement,
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
    
    setLoading(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randCode = Math.floor(100000 + Math.random() * 900000);
      let prefix = 'UPI';
      if (paymentMethod === 'Card') prefix = 'CARD';
      else if (paymentMethod === 'NetBanking') prefix = 'NB';
      else if (paymentMethod === 'UPI_QR') prefix = 'UPI-QR';

      const txnNumber = `${prefix}-${dateStr}-${randCode}`;

      let currentOrder = order;
      if (!currentOrder || !currentOrder.id) {
        currentOrder = await createOrderCall();
      }

      let finalTxnNumber = txnNumber;
      try {
        const payRes = await api.post(`/payments/dummy?orderId=${currentOrder.id}&success=true&transactionNumber=${txnNumber}&paymentType=${paymentType}&paidAmount=${amountToPayToday}&balanceAmount=${remainingAmount}`);
        if (payRes.data?.paymentReference) {
          finalTxnNumber = payRes.data.paymentReference;
        }
      } catch (postErr) {
        if (postErr.response?.status === 404 || postErr.response?.status === 400) {
          currentOrder = await createOrderCall();
          const payRes = await api.post(`/payments/dummy?orderId=${currentOrder.id}&success=true&transactionNumber=${txnNumber}&paymentType=${paymentType}&paidAmount=${amountToPayToday}&balanceAmount=${remainingAmount}`);
          if (payRes.data?.paymentReference) {
            finalTxnNumber = payRes.data.paymentReference;
          }
        } else {
          throw postErr;
        }
      }

      // Navigate to new Success/Invoice page!
      navigate('/success', { 
        state: { 
          orderNumber: currentOrder.orderNumber,
          transactionNumber: finalTxnNumber,
          paidAmount: amountToPayToday,
          paymentType: paymentType,
          balanceAmount: remainingAmount,
          isUnderReview: false
        } 
      });
    } catch (err) {
      console.error("Payment error:", err);
      const detail = err.response?.data?.detail;
      let msg = "";
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail.map(d => d.msg || (typeof d === 'string' ? d : JSON.stringify(d))).join(", ");
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (typeof err.response?.data === 'string') {
        msg = err.response.data;
      } else {
        msg = err.message || "Payment processing error. Please try again.";
      }
      alert(`Payment Notice: ${msg}`);
      setLoading(false);
    }
  };

  if (!user || !design) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading checkout details...</p>
      </div>
    );
  }

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
              <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.35rem', verticalAlign: 'middle', marginRight: '4px'}}><InfoIcon size={16} color="var(--primary-color)" /> <strong>Note:</strong></span> Courier charges are not included in the stitching total. We will share the bill copy of the courier for your reference.
            </div>

            {/* Doorstep Valet Slot Picker */}
            {courierOption === 'BOUTIQUE' && (
              <div style={{padding: '1.25rem', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '8px', marginBottom: '1.5rem'}}>
                <h5 style={{color: '#6D28D9', margin: '0 0 0.75rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                  <TruckIcon size={18} color="#6D28D9" /> Doorstep Fabric Valet Scheduling
                </h5>
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
              <div style={{color: 'var(--error-color)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                <ClockIcon size={18} color="var(--error-color)" /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
              {[
                { id: 'UPI_QR', label: 'QR Code (UPI)', icon: <QrCodeIcon size={18} /> },
                { id: 'Card', label: 'Credit / Debit Card', icon: <CreditCardIcon size={18} /> },
                { id: 'NetBanking', label: 'Net Banking', icon: <BankIcon size={18} /> }
              ].map(item => (
                <label key={item.id} style={{
                  border: '2px solid',
                  borderColor: paymentMethod === item.id ? 'var(--primary-color)' : 'var(--border-color)',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: '1',
                  minWidth: '170px',
                  backgroundColor: paymentMethod === item.id ? 'var(--bg-surface-elevated)' : 'transparent',
                  fontWeight: paymentMethod === item.id ? 700 : 500,
                  transition: 'all 0.2s ease'
                }}>
                  <input type="radio" name="paymentMethod" value={item.id} checked={paymentMethod === item.id} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem'}}>
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </label>
              ))}
            </div>

            {/* Payment Details Form */}
            <div style={{marginBottom: '2rem'}}>
              {paymentMethod === 'UPI_QR' ? (() => {
                const displayVpa = (upiData?.vpa || 'ammajifashions@upi').trim();
                const displayPayee = (upiData?.payeeName || 'Ammaji Fashions').trim();
                const safePayee = displayPayee.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
                const safeNote = `Order-${order?.orderNumber || 'NEW_ORDER'}`;
                const upiUri = upiData?.upiString || `upi://pay?pa=${displayVpa}&pn=${encodeURIComponent(safePayee)}&am=${amountToPayToday.toFixed(2)}&cu=INR&tn=${encodeURIComponent(safeNote)}`;
                const qrImageSrc = upiData?.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

                return (
                  <div style={{
                    background: 'var(--bg-surface-elevated)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    padding: '2rem 1.5rem', 
                    textAlign: 'center'
                  }}>
                    <div style={{display: 'inline-block', background: '#FFFFFF', padding: '14px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0'}}>
                      <img 
                        src={qrImageSrc} 
                        alt="UPI QR Code" 
                        style={{width: '220px', height: '220px', display: 'block'}} 
                      />
                    </div>

                    <div style={{marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center'}}>
                      <div style={{fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center'}}>
                        <span>UPI ID:</span>
                        <span style={{color: 'var(--primary-color)', fontFamily: 'monospace', fontSize: '1.05rem', background: '#FFF', padding: '3px 10px', borderRadius: '4px', border: '1px solid #DDD'}}>{displayVpa}</span>
                        <button 
                          type="button" 
                          onClick={() => handleCopy(displayVpa, 'UPI ID')} 
                          style={{border: '1px solid #CBD5E1', background: '#F8FAFC', borderRadius: '4px', padding: '3px 8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px'}}
                        >
                          {copiedText === 'UPI ID' ? '✓ Copied!' : <><CopyIcon size={12} /> Copy</>}
                        </button>
                      </div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                        Payee: <strong>{displayPayee}</strong>
                      </div>

                      <a 
                        href={upiUri} 
                        className="btn btn-outline" 
                        style={{marginTop: '0.25rem', fontSize: '0.85rem', padding: '0.45rem 1rem'}}
                      >
                        Tap to Pay in Mobile App
                      </a>
                    </div>
                  </div>
                );
              })() : paymentMethod === 'Card' ? (
                <div style={{
                  background: 'var(--bg-surface-elevated)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '1.75rem',
                  textAlign: 'left'
                }}>
                  <h4 style={{margin: '0 0 1.25rem 0', color: 'var(--text-main)', fontSize: '1.1rem'}}>Credit / Debit Card</h4>
                  <div style={{display: 'grid', gap: '1rem'}}>
                    <div>
                      <label className="form-label" style={{fontSize: '0.85rem', fontWeight: 600}}>Card Number <span style={{color:'red'}}>*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="1234 5678 9012 3456" 
                        maxLength={19} 
                        value={paymentDetails.cardNo} 
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                          setPaymentDetails({...paymentDetails, cardNo: formatted});
                        }} 
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{fontSize: '0.85rem', fontWeight: 600}}>Cardholder Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="name on card" 
                        value={paymentDetails.cardName} 
                        onChange={(e) => setPaymentDetails({...paymentDetails, cardName: e.target.value})} 
                      />
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                      <div>
                        <label className="form-label" style={{fontSize: '0.85rem', fontWeight: 600}}>Expiry (MM/YY) <span style={{color:'red'}}>*</span></label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="MM/YY" 
                          maxLength={5} 
                          value={paymentDetails.expiry} 
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                            setPaymentDetails({...paymentDetails, expiry: val});
                          }} 
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{fontSize: '0.85rem', fontWeight: 600}}>CVV <span style={{color:'red'}}>*</span></label>
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder="•••" 
                          maxLength={3} 
                          value={paymentDetails.cvv} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                            setPaymentDetails({...paymentDetails, cvv: val});
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'var(--bg-surface-elevated)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '1.75rem',
                  textAlign: 'left'
                }}>
                  <h4 style={{margin: '0 0 1.25rem 0', color: 'var(--text-main)', fontSize: '1.1rem'}}>Net Banking / Bank Transfer</h4>
                  
                  <div style={{marginBottom: '1.25rem'}}>
                    <label className="form-label" style={{fontSize: '0.85rem', fontWeight: 600}}>Select Your Bank</label>
                    <select 
                      className="form-control" 
                      value={paymentDetails.bank} 
                      onChange={(e) => setPaymentDetails({...paymentDetails, bank: e.target.value})}
                      style={{fontSize: '0.95rem', padding: '0.65rem'}}
                    >
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Federal Bank">Federal Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                    </select>
                  </div>

                  <div style={{background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#334155'}}>
                    <div style={{fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                      <BankIcon size={16} />
                      <span>Direct NEFT / IMPS Boutique Account:</span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.3rem'}}>
                      <div>Bank: <strong>Federal Bank</strong></div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span>Account No: <strong>77770113307348</strong></span>
                        <button type="button" onClick={() => handleCopy('77770113307348', 'A/C')} style={{border: 'none', background: 'transparent', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline'}}>
                          {copiedText === 'A/C' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span>IFSC: <strong>FDRL0007777</strong></span>
                        <button type="button" onClick={() => handleCopy('FDRL0007777', 'IFSC')} style={{border: 'none', background: 'transparent', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline'}}>
                          {copiedText === 'IFSC' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <div>Payee: <strong>Ammaji Fashions</strong></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{textAlign: 'center', marginTop: '2.5rem'}}>
              <p style={{marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text-muted)'}}>
                Amount to Pay Today: <strong style={{color: 'var(--primary-color)', fontSize: '1.25rem'}}>₹{amountToPayToday}</strong> ({paymentType === 'ADVANCE_20' ? '20% Advance Booking' : 'Full Payment'})
              </p>
              <div style={{display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                <button 
                  type="button"
                  onClick={() => handlePayment(true)} 
                  className="btn btn-primary" 
                  style={{
                    backgroundColor: '#16A34A', 
                    borderColor: '#16A34A', 
                    color: '#ffffff', 
                    padding: '0.95rem 3rem', 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                  }} 
                  disabled={loading}
                >
                  {loading ? 'Processing Payment...' : `Pay ₹${amountToPayToday}`}
                </button>
                <button 
                  type="button"
                  onClick={() => handlePayment(false)} 
                  className="btn btn-outline" 
                  style={{
                    borderColor: 'var(--error-color)', 
                    color: 'var(--error-color)', 
                    padding: '0.95rem 2rem', 
                    fontSize: '1rem', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }} 
                  disabled={loading}
                >
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
                  <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(155, 35, 53, 0.1)', color: 'var(--primary-color)', flexShrink: 0}}>
                    <TruckIcon size={26} color="var(--primary-color)" />
                  </div>
                  <div>
                    <p style={{color: 'var(--text-main)', fontWeight: 'bold'}}>We will pick up your fabric!</p>
                    <p style={{color: 'var(--text-muted)', marginTop: '0.5rem'}}>Please pack your unstitched fabric in a secure package. Our courier partner will pick it up on <strong>{pickupDay} ({pickupSlot})</strong> from your pickup address. Ensure your Order Number ({order.orderNumber}) is written on the package.</p>
                  </div>
                </div>
              ) : (
                <div style={{display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
                  <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(155, 35, 53, 0.1)', color: 'var(--primary-color)', flexShrink: 0}}>
                    <PackageIcon size={26} color="var(--primary-color)" />
                  </div>
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
