import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 0 1.5rem'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <img className="footer__logo" src="/iraaya-logo.jpg" alt="Iraaya — Handicrafted by Artisans, Cherished by the world" />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '240px' }}>
              Celebrating the rich heritage of Indian handicrafts, connecting skilled artisans with the world.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Shop</h4>
            {['All Products', 'By State', 'Textiles', 'Jewellery', 'Pottery'].map(item => (
              <Link key={item} to="/products" style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'var(--transition-fast)' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-saffron)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{item}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem' }}>States</h4>
            {['Rajasthan', 'Gujarat', 'West Bengal', 'Tamil Nadu', 'Kashmir'].map(s => (
              <Link key={s} to={`/states`} style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'var(--transition-fast)' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-saffron)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{s}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '1rem' }}>Support</h4>
            {['About Us', 'Contact', 'Shipping Policy', 'Return Policy', 'Privacy Policy'].map(item => (
              <a key={item} href="#" style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '0.5rem', transition: 'var(--transition-fast)' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-saffron)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{item}</a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            © 2024 Iraaya. Celebrating India's Artisan Heritage. 🪔
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Made with ❤️ for Indian Artisans
          </p>
        </div>
      </div>
    </footer>
  );
}
