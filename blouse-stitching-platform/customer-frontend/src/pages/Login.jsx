import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api, { prewarmBackend } from '../services/api';

const getDeviceDescription = () => {
  if (typeof navigator === 'undefined') return "Web Browser";
  const ua = navigator.userAgent || "";
  let browser = "Browser";
  let os = "Device";

  if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Internet";
  else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";
  else if (ua.indexOf("Edge") > -1) browser = "Edge";

  if (ua.indexOf("iPhone") > -1) os = "iPhone";
  else if (ua.indexOf("iPad") > -1) os = "iPad";
  else if (ua.indexOf("Android") > -1) os = "Android";
  else if (ua.indexOf("Macintosh") > -1) os = "macOS";
  else if (ua.indexOf("Windows") > -1) os = "Windows";
  else if (ua.indexOf("Linux") > -1) os = "Linux";

  return `${browser} on ${os}`;
};

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  const [formErrors, setFormErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const [sessionLimitExceeded, setSessionLimitExceeded] = useState(false);
  const [activeDevices, setActiveDevices] = useState([]);
  const [forceLoading, setForceLoading] = useState(false);
  const [sessionTerminatedNotice, setSessionTerminatedNotice] = useState('');

  useEffect(() => {
    prewarmBackend();
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'session_terminated') {
      const reason = sessionStorage.getItem('logout_reason') || 
        'Your session has ended because another device logged in and terminated other sessions.';
      setSessionTerminatedNotice(reason);
      sessionStorage.removeItem('logout_reason');
    }
  }, []);

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

  const handleSubmit = async (e, forceLogout = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setGlobalError('');
    
    if (!validateAll()) return;

    if (forceLogout) {
      setForceLoading(true);
    } else {
      setLoading(true);
    }

    try {
      // Authenticate with backend, sending device info and optional force_logout flag
      const res = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
        device_info: getDeviceDescription(),
        force_logout: forceLogout
      });
      
      const { token, user } = res.data;
      setSessionLimitExceeded(false);
      
      // Save to context and session storage, broadcasting force logout if triggered
      login(token, user, forceLogout);
      
      navigate('/profile');
    } catch (err) {
      const respData = err.response?.data;
      if (err.response?.status === 403 && (respData?.code === 'SESSION_LIMIT_EXCEEDED' || respData?.detail === 'SESSION_LIMIT_EXCEEDED')) {
        setSessionLimitExceeded(true);
        setActiveDevices(respData.activeDevices || []);
        setGlobalError('');
      } else {
        const errorMsg = respData?.message || respData?.detail || (typeof respData === 'string' ? respData : null);
        if (typeof errorMsg === 'string' && errorMsg.trim().length > 0) {
          setGlobalError(errorMsg.trim());
        } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          setGlobalError('Connection timed out while reaching the server. Please try again.');
        } else {
          setGlobalError('Invalid user or user details not found. Please register.');
        }
      }
    } finally {
      setLoading(false);
      setForceLoading(false);
    }
  };

  const ErrorMsg = ({ msg }) => {
    if (!msg) return null;
    return <div style={{color: 'var(--error-color)', fontSize: '0.85rem', marginTop: '0.25rem'}}>{msg}</div>;
  };

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="13" r="3"></circle>
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

        {/* Remote Session Ended / Terminated Notification */}
        {sessionTerminatedNotice && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #EF4444',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.88rem',
            lineHeight: 1.4,
            fontWeight: 500
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>{sessionTerminatedNotice}</div>
          </div>
        )}
        
        {/* Active Session Limit Reached Alert & Prompt */}
        {sessionLimitExceeded && (
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1.5px solid #F59E0B',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.75rem',
            color: '#92400E'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3 style={{margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#B45309'}}>
                Active Session Limit Reached
              </h3>
            </div>
            
            <p style={{margin: '0 0 1rem 0', fontSize: '0.88rem', lineHeight: 1.5, color: '#78350F'}}>
              You are currently logged in on <strong>2 active devices</strong> (maximum allowed). Please log out from other devices to continue, or terminate other sessions below.
            </p>

            {activeDevices.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                border: '1px solid #FDE68A'
              }}>
                <div style={{fontSize: '0.75rem', fontWeight: 700, color: '#92400E', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                  Currently Active Devices:
                </div>
                {activeDevices.map((dev, idx) => (
                  <div key={idx} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#451A03', padding: '0.2rem 0'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                      <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                    <strong>Device {idx + 1}:</strong> {dev.deviceInfo}
                    {dev.lastActive && <span style={{fontSize: '0.75rem', color: '#B45309'}}>({dev.lastActive})</span>}
                  </div>
                ))}
              </div>
            )}

            <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  backgroundColor: '#D97706',
                  borderColor: '#D97706',
                  padding: '0.75rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
                disabled={forceLoading}
              >
                {forceLoading ? 'Logging out other devices...' : 'Log out other devices & Sign in here'}
              </button>
              <button
                type="button"
                onClick={() => setSessionLimitExceeded(false)}
                className="btn btn-outline"
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.88rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {globalError && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #EF4444',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.9rem',
            lineHeight: 1.4
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{globalError}</span>
            </div>
            {globalError.toLowerCase().includes('register') && (
              <Link 
                to="/register" 
                style={{
                  color: '#DC2626', 
                  fontWeight: 700, 
                  textDecoration: 'underline',
                  fontSize: '0.88rem',
                  marginLeft: 'auto'
                }}
              >
                Register Now →
              </Link>
            )}
          </div>
        )}
        
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="form-group" style={{marginBottom: '1.5rem'}}>
            <label className="form-label">Email Address or Mobile Number</label>
            <input 
              type="text" 
              className={`form-control ${formErrors.email ? 'input-error' : ''}`} 
              name="email" 
              placeholder="xyz@gmail.com or 999999999"
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
                placeholder="password"
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
