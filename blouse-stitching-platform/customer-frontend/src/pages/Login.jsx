import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  const [formErrors, setFormErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        const clean = value.trim();
        if (!clean) return "Email or mobile number is required.";
        if (/^\d+$/.test(clean)) {
          return clean.length === 10 ? "" : "Mobile number must be exactly 10 digits.";
        }
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? "Please enter a valid email address." : "";
      case 'password':
        return !value ? "Password is required." : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Live validation while typing
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
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
      // Actually authenticate with the backend (supports both email and mobile)
      const res = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password
      });
      
      // Destructure token and user from the backend response
      const { token, user } = res.data;
      
      // Save to context and local storage
      login(token, user);
      
      navigate('/profile');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data;
      if (typeof errorMsg === 'string' && errorMsg.length > 0) {
        setGlobalError(errorMsg);
      } else {
        setGlobalError('Invalid user or user details not found. Please register.');
      }
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
    <div className="container section" style={{maxWidth: '500px'}}>
      <div className="card" style={{padding: '3rem'}}>
        <h2 className="section-title">Login</h2>
        {globalError && <div style={{backgroundColor: 'var(--error-color)', color: 'white', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem'}}>{globalError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom: '1.5rem'}}>
            <label className="form-label">Email Address or Mobile Number</label>
            <input 
              type="text" 
              className={`form-control ${formErrors.email ? 'input-error' : ''}`} 
              name="email" 
              placeholder="e.g. priya@example.com or 9876543210"
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            <ErrorMsg msg={formErrors.email} />
          </div>
          
          <div className="form-group" style={{marginBottom: '1.5rem'}}>
            <label className="form-label">Password</label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className={`form-control ${formErrors.password ? 'input-error' : ''}`} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
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

          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '-0.75rem', marginBottom: '1.25rem'}}>
            <Link to="/forgot-password" style={{color: 'var(--primary-color)', fontSize: '0.85rem', textDecoration: 'none'}}>
              Forgot password?
            </Link>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '0.5rem', padding: '1rem'}} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)'}}>
          Don't have an account? <Link to="/register" style={{color: 'var(--primary-color)'}}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
export default Login;
