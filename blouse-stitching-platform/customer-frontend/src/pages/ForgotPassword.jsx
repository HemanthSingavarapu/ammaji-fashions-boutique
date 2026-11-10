import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function ForgotPassword() {
  const navigate = useNavigate();

  // Step 1: Verification form
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // Step 2: Reset form
  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState('');
  const [userName, setUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  // Step 1: Submit Identity Verification
  const handleVerifyIdentity = async (e) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    if (!cleanEmail || !cleanMobile) {
      setError("Please enter both your registered email and mobile number.");
      return;
    }

    if (cleanMobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/verify', {
        email: cleanEmail,
        mobile: cleanMobile
      });

      setResetToken(res.data.resetToken);
      setUserName(res.data.userName || 'Valued Customer');
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Verification failed. Please check your email and mobile number.";
      setError(typeof msg === 'string' ? msg : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        resetToken: resetToken,
        newPassword: newPassword
      });

      setSuccessMsg("🎉 Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Failed to reset password. Please try again.";
      setError(typeof msg === 'string' ? msg : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section" style={{maxWidth: '520px'}}>
      <div className="card" style={{padding: '3rem 2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
        
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>🔐</div>
          <h2 className="section-title" style={{marginBottom: '0.4rem'}}>Reset Password</h2>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0}}>
            {step === 1 ? 'Verify your identity to set a new password' : `Welcome, ${userName}! Set your new password`}
          </p>
        </div>

        {error && (
          <div style={{backgroundColor: 'var(--error-color)', color: '#fff', padding: '0.85rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div style={{backgroundColor: '#10B981', color: '#fff', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.92rem', textAlign: 'center', fontWeight: 600}}>
            {successMsg}
          </div>
        )}

        {/* STEP 1: Verify Identity */}
        {step === 1 && !successMsg && (
          <form onSubmit={handleVerifyIdentity}>
            <div className="form-group" style={{marginBottom: '1.25rem'}}>
              <label className="form-label">Registered Email Address <span style={{color: 'red'}}>*</span></label>
              <input
                type="email"
                className="form-control"
                placeholder="xyz@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <label className="form-label">Registered Mobile Number <span style={{color: 'red'}}>*</span></label>
              <input
                type="tel"
                className="form-control"
                placeholder="9999999999"
                maxLength="10"
                value={mobile}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setMobile(val);
                }}
                required
              />
              <small style={{color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '0.35rem'}}>
                🔒 Free instant verification • No waiting for SMS or OTP delays
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{width: '100%', padding: '0.9rem', fontSize: '0.95rem'}}
              disabled={loading}
            >
              {loading ? 'Verifying Identity...' : 'Verify & Continue →'}
            </button>
          </form>
        )}

        {/* STEP 2: Set New Password */}
        {step === 2 && !successMsg && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group" style={{marginBottom: '1.25rem'}}>
              <label className="form-label">New Password <span style={{color: 'red'}}>*</span></label>
              <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
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
            </div>

            <div className="form-group" style={{marginBottom: '1.5rem'}}>
              <label className="form-label">Confirm New Password <span style={{color: 'red'}}>*</span></label>
              <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="confirm password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
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
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{width: '100%', padding: '0.9rem', fontSize: '0.95rem'}}
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {/* Back Link */}
        <div style={{textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)'}}>
          <Link to="/login" style={{color: 'var(--primary-color)', fontSize: '0.9rem', textDecoration: 'none'}}>
            ← Remember your password? <strong>Back to Login</strong>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
