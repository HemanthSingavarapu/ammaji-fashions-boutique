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
      
      alert("Registration successful! Please login.");
      navigate('/login');
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

  return (
    <div className="container section" style={{maxWidth: '800px'}}>
      <div className="card" style={{padding: '3rem'}}>
        <h2 className="section-title">Create an Account</h2>
        {globalError && (
          <div style={{backgroundColor: 'var(--error-color)', color: 'white', padding: '1rem 1.25rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem'}}>
            <div>⚠️ {globalError}</div>
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
              <input type="text" className={`form-control ${formErrors.name ? 'input-error' : ''}`} name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Priya Sharma" />
              <ErrorMsg msg={formErrors.name} />
            </div>
            
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Email Address <span style={{color: 'red'}}>*</span></label>
              <input type="email" className={`form-control ${formErrors.email ? 'input-error' : ''}`} name="email" value={formData.email} onChange={handleChange} required placeholder="priya@example.com" />
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
                  placeholder="Min 6 characters" 
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
              <input type="tel" className={`form-control ${formErrors.mobile ? 'input-error' : ''}`} name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="10-digit mobile number" maxLength="10" />
              <ErrorMsg msg={formErrors.mobile} />
            </div>
            
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Pincode <span style={{color: 'red'}}>*</span></label>
              <input type="text" className={`form-control ${formErrors.pincode ? 'input-error' : ''}`} name="pincode" value={formData.pincode} onChange={handleChange} required maxLength="6" />
              <ErrorMsg msg={formErrors.pincode} />
            </div>
          </div>

          <div className="form-group" style={{marginBottom: '1.5rem'}}>
            <label className="form-label">Street Address <span style={{color: 'red'}}>*</span></label>
            <textarea className={`form-control ${formErrors.address ? 'input-error' : ''}`} name="address" rows="2" value={formData.address} onChange={handleChange} required placeholder="House No, Street, Landmark"></textarea>
            <ErrorMsg msg={formErrors.address} />
          </div>
          
          <div className="responsive-form-grid">
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">City <span style={{color: 'red'}}>*</span></label>
              <input type="text" className={`form-control ${formErrors.city ? 'input-error' : ''}`} name="city" value={formData.city} onChange={handleChange} required />
              <ErrorMsg msg={formErrors.city} />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">State</label>
              <input type="text" className="form-control" name="state" value={formData.state} onChange={handleChange} />
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
