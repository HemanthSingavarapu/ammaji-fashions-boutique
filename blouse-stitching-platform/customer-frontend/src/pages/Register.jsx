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

  return (
    <div className="container section" style={{maxWidth: '800px'}}>
      <div className="card" style={{padding: '3rem'}}>
        <h2 className="section-title">Create an Account</h2>
        {globalError && <div style={{backgroundColor: 'var(--error-color)', color: 'white', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem'}}>{globalError}</div>}
        
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
              <input type="password" className={`form-control ${formErrors.password ? 'input-error' : ''}`} name="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 characters" />
              <ErrorMsg msg={formErrors.password} />
            </div>
            <div className="form-group" style={{marginBottom: 0}}>
              <label className="form-label">Confirm Password <span style={{color: 'red'}}>*</span></label>
              <input type="password" className={`form-control ${formErrors.confirmPassword ? 'input-error' : ''}`} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
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
