import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/orders', label: 'Orders', icon: '🛍️' },
    { path: '/categories', label: 'Categories', icon: '📁' },
    { path: '/designs', label: 'Designs', icon: '✨' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out from the Admin Panel?")) {
      localStorage.removeItem('adminToken');
      navigate('/login');
    }
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header" style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
          <span style={{fontSize: '1.5rem'}}>✂️</span>
          <div>
            <div style={{fontWeight: 700}}>Ammaji Fashions</div>
            <div style={{fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 'normal'}}>Bespoke Tailoring Admin</div>
          </div>
        </div>
        <nav style={{flex: 1}}>
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span style={{marginRight: '12px', fontSize: '1.1rem'}}>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        <div style={{padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%', 
              padding: '0.65rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#F87171', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="topbar" style={{justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <span style={{fontSize: '0.75rem', background: '#DCFCE7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600}}>
              🟢 System Online
            </span>
            <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
              Ammaji Fashions Tailoring v2.4
            </span>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '1.25rem'}}>
            <a 
              href="http://localhost:5180" 
              target="_blank" 
              rel="noreferrer" 
              className="btn btn-outline" 
              style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', textDecoration: 'none', padding: '0.4rem 0.8rem'}}
            >
              🌐 Open Customer Store
            </a>

            <div style={{display: 'flex', alignItems: 'center', gap: '0.65rem'}}>
              <div style={{width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                A
              </div>
              <div style={{lineHeight: '1.2'}}>
                <div style={{fontSize: '0.85rem', fontWeight: 600}}>Master Admin</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>admin@blouse.com</div>
              </div>
            </div>
          </div>
        </header>
        
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
