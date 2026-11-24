import { createContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  useEffect(() => {
    // Cross-tab broadcast channel for instant multi-tab sync in the same browser
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('ammaji_auth_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'FORCE_LOGOUT_EVENT') {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            try {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            } catch (e) {}
            setUser(null);
            if (window.location.pathname !== '/login') {
              sessionStorage.setItem(
                'logout_reason',
                'You were logged out because you signed in from another device or terminated active sessions.'
              );
              window.location.href = '/login?reason=session_terminated';
            }
          }
        };
        channelRef.current = bc;
      } catch (e) {}
    }

    // Read session-only storage
    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      }
    }
    setLoading(false);

    // Event listener for auth:logged_out dispatched from api.js interceptor
    const handleLoggedOut = () => {
      setUser(null);
    };
    window.addEventListener('auth:logged_out', handleLoggedOut);

    return () => {
      window.removeEventListener('auth:logged_out', handleLoggedOut);
      if (channelRef.current) {
        try {
          channelRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  // Periodic session heartbeat & window-focus validation
  // Actively verifies with backend whether session is still valid or was logged out by another device
  useEffect(() => {
    if (!user) return;

    let isChecking = false;
    const verifySession = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }
        await api.get('/auth/validate-session');
      } catch (err) {
        // If 401, the api.js interceptor automatically clears storage & redirects
      } finally {
        isChecking = false;
      }
    };

    // 1. Check immediately when user switches to or focuses this window/tab
    const onFocus = () => verifySession();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') verifySession();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    // 2. Poll every 30 seconds in background (tab focus / visibility handles immediate tab switching)
    const timer = setInterval(verifySession, 30000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(timer);
    };
  }, [user]);

  const login = (token, userData, isForceLogout = false) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    // If force logout was performed, broadcast to other tabs to immediately exit
    if (isForceLogout && channelRef.current) {
      try {
        channelRef.current.postMessage({ type: 'FORCE_LOGOUT_EVENT' });
      } catch (e) {}
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
