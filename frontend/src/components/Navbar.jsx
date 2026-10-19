import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiSun, FiMoon, FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('iraaya_theme') || 'dark';
    setDarkMode(theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const next = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('iraaya_theme', next);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="Iraaya home">
          <img src="/iraaya-logo.jpg" alt="Iraaya — Handicrafted by Artisans, Cherished by the world" />
        </Link>

        <div className="navbar__nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
          <Link to="/products" className={`nav-link ${isActive('/products')}`}>Shop</Link>
          <Link to="/states" className={`nav-link ${isActive('/states')}`}>By State</Link>
          {user && <Link to="/wishlist" className={`nav-link ${isActive('/wishlist')}`}>Wishlist</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>Admin</Link>}
        </div>

        <div className="navbar__actions">
          <button onClick={toggleTheme} className="btn btn-ghost btn-icon" title="Toggle theme">
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          {user && (
            <Link to="/cart" className="btn btn-ghost btn-icon cart-btn" title="Cart">
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ gap: '0.4rem' }}
              >
                <FiUser />
                <span style={{ fontSize: '0.85rem' }}>{user.name?.split(' ')[0]}</span>
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)', minWidth: '160px',
                  boxShadow: 'var(--shadow-lg)', zIndex: 100,
                  overflow: 'hidden'
                }}>
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-fast)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiUser size={14} /> Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'var(--transition-fast)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <FiSettings size={14} /> Admin
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.88rem', color: '#ff6b6b', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
