import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', mobile: '', address: '', city: '', state: '', pincode: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!/^[A-Za-z\s]+$/.test(value)) return "Name can only contain letters and spaces.";
        return value.length < 3 ? "Name must be at least 3 characters long." : "";
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Please enter a valid email address." : "";
      case 'password':
        return value.length < 6 ? "Password must be at least 6 characters." : "";
      case 'confirmPassword':
        return value !== formData.password ? "Passwords do not match." : "";
      case 'mobile':
        if (!/^[6-9][0-9]{9}$/.test(value)) return "Number should be in 10 digits.";
        return "";
      case 'address':
        return value.length < 5 ? "Please provide a complete address." : "";
      case 'city':
        return !value ? "City is required." : "";
      case 'pincode':
        return !/^[0-9]{6}$/.test(value) ? "Pincode must be exactly 6 digits." : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Block special characters and numbers in name
    if (name === 'name' && value && !/^[A-Za-z\s]+$/.test(value)) return;
    
    // Block extra numbers and non-digits in mobile, and enforce start digit
    if (name === 'mobile') {
      if (value && !/^[0-9]*$/.test(value)) return; // Only numbers
      if (value.length > 10) return; // Max 10 digits
      if (value.length === 1 && !/^[6-9]$/.test(value)) return; // First digit must be 6,7,8,9
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Live validation while typing
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));

    // Special check: if changing password, re-validate confirmPassword if it has a value
    if (name === 'password' && formData.confirmPassword) {
      setFormErrors(prev => ({ 
        ...prev, 
        confirmPassword: value !== formData.confirmPassword ? "Passwords do not match." : "" 
      }));
    }
  };

  const validateAll = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) errors[key] = err;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    
    if (!validateAll()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim()
      };
      
      // Make API call directly
      await api.post('/auth/register', payload);
      
      setRegistrationSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      setGlobalError(typeof errorMsg === 'string' ? errorMsg : 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ msg }) => {
    if (!msg) return null;
    return <div style={{color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem'}}>{msg}</div>;
  };

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  if (registrationSuccess) {
    return (
      <div 
        className="container section" 
        style={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1rem'
        }}
      >
        <div 
          className="card" 
          style={{
            maxWidth: '540px',
            width: '100%',
            padding: '3rem 2.5rem',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Green Checkmark Badge */}
          <div 
            style={{
              width: '84px',
              height: '84px',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              backgroundColor: '#ECFDF5',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.25)'
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h2 
            style={{
              fontSize: '1.9rem',
              fontFamily: 'var(--font-serif)',
              color: 'var(--text-main)',
              marginBottom: '0.75rem',
              fontWeight: 700
            }}
          >
            Registration Successful!
          </h2>

          <p 
            style={{
              fontSize: '0.98rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '1.75rem'
            }}
          >
            Welcome to <strong>Ammaji Fashions</strong>, <strong>{formData.name || 'Valued Customer'}</strong>! Your account has been registered successfully. You can now log in with your credentials to explore custom styles, design blouses, and place orders.
          </p>

          {/* Account Summary Box */}
          <div 
            style={{
              backgroundColor: 'var(--bg-surface-elevated, #F8FAFC)',
              border: '1px solid var(--border-color, #E2E8F0)',
              borderRadius: '10px',
              padding: '1.1rem 1.25rem',
              marginBottom: '2rem',
              textAlign: 'left',
              fontSize: '0.9rem'
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
              <span style={{color: 'var(--text-muted)'}}>Registered Email:</span>
              <strong style={{color: 'var(--text-main)'}}>{formData.email}</strong>
            </div>
            {formData.mobile && (
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: 'var(--text-muted)'}}>Mobile Number:</span>
                <strong style={{color: 'var(--text-main)'}}>{formData.mobile}</strong>
              </div>
            )}
          </div>

          {/* Login Button */}
          <button 
            type="button" 
            onClick={() => navigate('/login')} 
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.05rem',
              fontWeight: 600,
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              cursor: 'pointer'
            }}
          >
            <span>Proceed to Login</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{maxWidth: '800px'}}>
      <div className="card" style={{padding: '3rem'}}>
        <h2 className="section-title">Create an Account</h2>
        {globalError && (
          <div style={{backgroundColor: 'var(--error-color)', color: 'white', padding: '1rem 1.25rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{globalError}</span>
            </div>
            {globalError.toLowerCase().includes('login') && (
              <Link to="/login" style={{color: '#fff', textDecoration: 'underline', fontWeight: 'bold', fontSize: '0.9rem'}}>
                Go to Login →
              </Link>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          
          <div className="responsive-form-grid">
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Full Name <span style={{color: 'red'}}>*</span></label>
              <input type="text" className={`form-control ${formErrors.name ? 'input-error' : ''}`} name="name" value={formData.name} onChange={handleChange} required placeholder="your name" />
              <ErrorMsg msg={formErrors.name} />
            </div>
            
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Email Address <span style={{color: 'red'}}>*</span></label>
              <input type="email" className={`form-control ${formErrors.email ? 'input-error' : ''}`} name="email" value={formData.email} onChange={handleChange} required placeholder="xyz@gmail.com" />
              <ErrorMsg msg={formErrors.email} />
            </div>
          </div>
          
          <div className="responsive-form-grid">
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Password <span style={{color: 'red'}}>*</span></label>
              <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className={`form-control ${formErrors.password ? 'input-error' : ''}`} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  placeholder="password" 
                  style={{paddingRight: '2.75rem'}}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted, #6B7280)'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <ErrorMsg msg={formErrors.password} />
            </div>

            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Confirm Password <span style={{color: 'red'}}>*</span></label>
              <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  className={`form-control ${formErrors.confirmPassword ? 'input-error' : ''}`} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  placeholder="confirm password"
                  style={{paddingRight: '2.75rem'}}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted, #6B7280)'
                  }}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <ErrorMsg msg={formErrors.confirmPassword} />
            </div>
          </div>
          
          <div className="responsive-form-grid">
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Mobile Number <span style={{color: 'red'}}>*</span></label>
              <input type="tel" className={`form-control ${formErrors.mobile ? 'input-error' : ''}`} name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="9999999999" maxLength="10" />
              <ErrorMsg msg={formErrors.mobile} />
            </div>
            
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Pincode <span style={{color: 'red'}}>*</span></label>
              <input type="text" className={`form-control ${formErrors.pincode ? 'input-error' : ''}`} name="pincode" value={formData.pincode} onChange={handleChange} required maxLength="6" placeholder="pincode" />
              <ErrorMsg msg={formErrors.pincode} />
            </div>
          </div>

          <div className="form-group" style={{marginBottom: '1.5rem'}}>
            <label className="form-label">Street Address <span style={{color: 'red'}}>*</span></label>
            <textarea className={`form-control ${formErrors.address ? 'input-error' : ''}`} name="address" rows="2" value={formData.address} onChange={handleChange} required placeholder="street address"></textarea>
            <ErrorMsg msg={formErrors.address} />
          </div>
          
          <div className="responsive-form-grid">
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">City <span style={{color: 'red'}}>*</span></label>
              <input type="text" className={`form-control ${formErrors.city ? 'input-error' : ''}`} name="city" value={formData.city} onChange={handleChange} required placeholder="city" />
              <ErrorMsg msg={formErrors.city} />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">State</label>
              <input type="text" className="form-control" name="state" value={formData.state} onChange={handleChange} placeholder="state" />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem', padding: '1rem'}} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)'}}>
          Already have an account? <Link to="/login" style={{color: 'var(--primary-color)'}}>Login here</Link>
        </p>
      </div>
    </div>
  );
}
export default Register;
