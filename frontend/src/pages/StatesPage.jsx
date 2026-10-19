import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMapPin, FiPackage } from 'react-icons/fi';
import api from '../api/client';

const STATE_EMOJIS = {
  'Rajasthan': '🏯', 'Kerala': '🌴', 'Gujarat': '🎨', 'West Bengal': '🎭',
  'Tamil Nadu': '🏛️', 'Uttar Pradesh': '🕌', 'Maharashtra': '🌊', 'Karnataka': '🌺',
  'Odisha': '⛪', 'Assam': '🍵', 'Bihar': '🏺', 'Madhya Pradesh': '🐯',
  'Himachal Pradesh': '🏔️', 'Jammu & Kashmir': '❄️', 'Goa': '🏖️', 'Punjab': '🌾',
  'Andhra Pradesh': '🎯', 'Telangana': '🔮', 'Jharkhand': '🌿', 'Chhattisgarh': '🌳',
  'Haryana': '🌻', 'Uttarakhand': '🏕️', 'Manipur': '💃', 'Meghalaya': '☁️',
  'Mizoram': '🦋', 'Nagaland': '🗿', 'Arunachal Pradesh': '🌅', 'Sikkim': '🏔️',
  'Tripura': '🎵', 'Delhi': '🏙️', 'Ladakh': '🌌', 'Puducherry': '🌸', 'Chandigarh': '🌆',
};

export default function StatesPage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/states')
      .then(res => setStates(res.data.states))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = states.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ background: 'var(--gradient-hero)', padding: '5rem 0 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-glow)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero__tag" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <FiMapPin /> Explore India
          </div>
          <h1 style={{ fontFamily: 'Prata, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
            Crafts From <span className="gradient-text">Every Corner of India</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Discover the unique handcrafted traditions from all 28 states and 8 Union Territories of India.
          </p>
          <div style={{ maxWidth: '440px', margin: '0 auto' }}>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search states..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">🔍</button>
            </div>
          </div>
        </div>
      </div>

      <div className="container section">
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Showing {filtered.length} states
            </p>
            <div className="states-grid">
              {filtered.map((state, i) => (
                <div
                  key={state.name}
                  className="state-card animate-in"
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/products?state=${encodeURIComponent(state.name)}`)}
                >
                  <div className="state-card__bg">
                    <span style={{ fontSize: '3.5rem' }}>{STATE_EMOJIS[state.name] || '🏛️'}</span>
                  </div>
                  <div className="state-card__overlay" />
                  {state.productCount > 0 && (
                    <div className="state-card__count">
                      <FiPackage size={10} style={{ marginRight: 3 }} />{state.productCount}
                    </div>
                  )}
                  <div className="state-card__content">
                    <div className="state-card__name">{state.name}</div>
                    <div className="state-card__craft">{state.craft}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
