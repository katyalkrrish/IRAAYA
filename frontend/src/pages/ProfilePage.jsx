import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiUser, FiHeart, FiShoppingBag, FiLogOut } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return (
    <div className="page-wrapper">
      <div className="empty-state" style={{ marginTop: '6rem' }}>
        <div className="empty-state__icon">🔒</div>
        <h3>Login Required</h3>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Login</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Profile Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2.5rem'
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h1 style={{ fontFamily: 'Prata, serif', fontSize: '1.8rem', fontWeight: 700 }}>{user.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
            {user.role === 'admin' && (
              <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.3rem 0.8rem', background: 'var(--gradient-brand)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                Admin
              </span>
            )}
          </div>

          {/* Quick Links */}
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
            {[
              { icon: <FiHeart />, label: 'My Wishlist', to: '/wishlist', desc: 'View saved items' },
              { icon: <FiShoppingBag />, label: 'My Cart', to: '/cart', desc: 'View cart & checkout' },
              ...(user.role === 'admin' ? [{ icon: '⚙️', label: 'Admin Dashboard', to: '/admin', desc: 'Manage products & users' }] : []),
            ].map(item => (
              <Link key={item.label} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--saffron)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'rgba(255,153,51,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-saffron)', fontSize: '1.1rem', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }}
          >
            <FiLogOut /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
