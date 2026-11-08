import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('admin@blouse.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      
      // Ensure user is an admin
      if (res.data.user.role === 'ADMIN') {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminUser', JSON.stringify(res.data.user));
        navigate('/');
      } else {
        setError('Unauthorized access. Admin privileges required.');
      }
    } catch (err) {
      // Auto-recovery: If admin account was not seeded in the database, seed it and retry
      try {
        await api.post('/auth/setup-admin');
        const retryRes = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
        if (retryRes.data.user.role === 'ADMIN') {
          localStorage.setItem('adminToken', retryRes.data.token);
          localStorage.setItem('adminUser', JSON.stringify(retryRes.data.user));
          navigate('/');
          return;
        }
      } catch (retryErr) {
        // Show friendly error
      }
      setError('Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = () => {
    setEmail('admin@blouse.com');
    setPassword('admin123');
    setError('');
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
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--admin-bg)'}}>
      <div className="card" style={{width: '420px', maxWidth: '92%', padding: '2.5rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'}}>
        <div style={{textAlign: 'center', marginBottom: '1.75rem'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>✂️</div>
          <h2 style={{margin: 0, fontSize: '1.6rem'}}>Ammaji Fashions Admin</h2>
          <p style={{color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem'}}>
            Sign in to manage tailoring orders & catalog
          </p>
        </div>
        
        {error && (
          <div style={{color: '#991B1B', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.25rem', fontSize: '0.85rem', textAlign: 'center'}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem'}}>Admin Email</label>
            <input 
              type="email" 
              required 
              style={{width: '100%', padding: '0.7rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.9rem'}} 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
            />
          </div>
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.85rem'}}>Password</label>
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                style={{width: '100%', padding: '0.7rem 2.5rem 0.7rem 0.7rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.9rem'}} 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
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
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%', padding: '0.75rem', fontSize: '0.95rem'}}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        {/* Credentials Helper Box */}
        <div style={{marginTop: '1.5rem', padding: '0.85rem', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: '6px', fontSize: '0.8rem', color: '#475569'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem'}}>
            <strong style={{color: 'var(--text-main)'}}>Default Admin Credentials:</strong>
            <button 
              type="button" 
              onClick={handleFillCredentials}
              style={{background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0, fontSize: '0.75rem'}}
            >
              Fill Credentials
            </button>
          </div>
          <div>Email: <code>admin@blouse.com</code></div>
          <div>Password: <code>admin123</code></div>
        </div>
      </div>
    </div>
  );
}

export default Login;
