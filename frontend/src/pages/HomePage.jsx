import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name: 'Textiles', emoji: '🧵' },
  { name: 'Pottery', emoji: '🏺' },
  { name: 'Jewellery', emoji: '💎' },
  { name: 'Paintings', emoji: '🎨' },
  { name: 'Woodwork', emoji: '🪵' },
  { name: 'Metalwork', emoji: '⚙️' },
  { name: 'Bamboo Craft', emoji: '🎋' },
  { name: 'Stone Craft', emoji: '🪨' },
  { name: 'Leather Work', emoji: '👟' },
  { name: 'Weaving', emoji: '🧶' },
];

export default function HomePage() {
  const navigate = useNavigate();

  // State for products and states
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [states, setStates] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingStates, setLoadingStates] = useState(true);

  // State for newsletter form
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    // Fetch 8 featured products
    api.get('/api/products?featured=true&limit=8')
      .then((res) => {
        const prods = res.data?.products || (Array.isArray(res.data) ? res.data : []);
        setFeaturedProducts(prods.slice(0, 8));
      })
      .catch((err) => {
        console.error('Failed to load featured products:', err);
      })
      .finally(() => {
        setLoadingProducts(false);
      });

    // Fetch states
    api.get('/api/states')
      .then((res) => {
        const statesData = res.data?.states || (Array.isArray(res.data) ? res.data : []);
        setStates(statesData.slice(0, 6));
      })
      .catch((err) => {
        console.error('Failed to load states:', err);
      })
      .finally(() => {
        setLoadingStates(false);
      });
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
      toast.success('Welcome to Iraaya! 🪔 You are now subscribed.');
    }, 400);
  };

  return (
    <div className="homepage animate-in">
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero__bg-art">
          <div className="hero__circle hero__circle--1" />
          <div className="hero__circle hero__circle--2" />
          <div className="hero__circle hero__circle--3" />
        </div>

        <div className="container hero__inner">
          {/* Introduce the Iraaya brand before inviting visitors to browse. */}
          <div className="hero__content">
            <div className="hero__tag">
              <span>✦</span> A home for India's living craft traditions
            </div>

            <h1 className="hero__title">
              <span className="hero__brand-name">I R A A Y A</span>
              <span className="hero__brand-line">Crafted by heritage.<br /><span className="gradient-text">Carried forward.</span></span>
            </h1>

            <p className="hero__desc">
              We bring India's remarkable artisan traditions closer to the homes that cherish them.
              Every Iraaya piece carries the hands, places and stories behind its making.
            </p>

            <div className="hero__actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Discover the collection
              </Link>
              <Link to="/states" className="btn btn-outline btn-lg">
                Meet the regions
              </Link>
            </div>

            <div className="hero__stats">
              <div className="hero__stat-item">
                <span className="hero__stat-number">500+</span>
                <span className="hero__stat-label">Artisans</span>
              </div>
              <div className="hero__stat-item">
                <span className="hero__stat-number">28</span>
                <span className="hero__stat-label">States</span>
              </div>
              <div className="hero__stat-item">
                <span className="hero__stat-number">1000+</span>
                <span className="hero__stat-label">Products</span>
              </div>
            </div>
          </div>

          {/* Brand-led visual: a hand-drawn inspired seal and the values behind Iraaya. */}
          <div className="hero__identity" aria-label="Iraaya celebrates India's artisan heritage">
            <img className="hero__identity-logo" src="/iraaya-logo.jpg" alt="Iraaya — Handicrafted by Artisans, Cherished by the world" />
          </div>
        </div>
      </section>

      {/* 2. CATEGORY STRIP */}
      <section className="category-strip-section">
        <div className="container">
          <div className="category-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                className="category-tab"
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                title={`Browse ${cat.name}`}
              >
                <span className="category-tab__icon">{cat.emoji}</span>
                <span className="category-tab__label">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="section-heading__tag">Curated Crafts</span>
            <h2>Handpicked For You</h2>
            <p>
              Masterfully fashioned by India's finest craftspeople. Each piece reflects generational dedication and peerless artistry.
            </p>
          </div>

          <div className="products-grid">
            {loadingProducts ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="product-skeleton-card skeleton animate-in">
                  <div className="product-skeleton-img skeleton" />
                  <div className="product-skeleton-body">
                    <div className="product-skeleton-line product-skeleton-line--category skeleton" />
                    <div className="product-skeleton-line product-skeleton-line--title skeleton" />
                    <div className="product-skeleton-line product-skeleton-line--artisan skeleton" />
                    <div className="product-skeleton-line product-skeleton-line--price skeleton" />
                  </div>
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">🪔</div>
                <h3>No featured products available right now</h3>
                <p>Check back shortly or explore our full catalogue.</p>
              </div>
            )}
          </div>

          <div className="section-footer">
            <Link to="/products" className="btn btn-outline btn-lg">
              View All Products &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 4. STATES SHOWCASE */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-heading">
            <span className="section-heading__tag">Regional Heritage</span>
            <h2>Explore by Indian State</h2>
            <p>
              From the vibrant desert colours of Rajasthan to the serene backwaters of Kerala, immerse yourself in regional craft treasures.
            </p>
          </div>

          <div className="states-grid">
            {loadingStates ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="state-skeleton-card skeleton animate-in" />
              ))
            ) : states.length > 0 ? (
              states.map((state) => (
                <div
                  key={state.name}
                  className="state-card animate-in"
                  onClick={() => navigate(`/products?state=${encodeURIComponent(state.name)}`)}
                >
                  <div className="state-card__bg">
                    <span>🏛️</span>
                  </div>
                  <div className="state-card__overlay" />
                  <span className="state-card__count">
                    {state.productCount || 0} Crafts
                  </span>
                  <div className="state-card__content">
                    <div className="state-card__name">🏛️ {state.name}</div>
                    <div className="state-card__craft">{state.craft}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">🏛️</div>
                <h3>States data currently unavailable</h3>
                <p>Explore directly through our product directory.</p>
              </div>
            )}
          </div>

          <div className="section-footer">
            <Link to="/states" className="btn btn-ghost btn-lg">
              Explore All 28 States &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 5. STORY SECTION */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            {/* Left Column: Decorative Visual Card */}
            <div className="story-visual-card">
              <div className="story-visual-glow" />
              <div className="story-visual-diya">🪔</div>
              <div className="story-visual-quote">
                "Craft is living history — every thread, chisel stroke, and brush line breathes the soul of India."
              </div>
              <span className="story-visual-origin">5000 Years of Heritage</span>
            </div>

            {/* Right Column: Story Narrative */}
            <div className="story-content">
              <div className="story-tag">Our Heritage & Mission</div>
              <h2 className="story-title">The Iraaya Story</h2>
              <p className="story-desc">
                For over five millennia, Indian craftsmanship has captivated the world with its unparalleled intricacy and spiritual reverence.
                Iraaya was created to honor this timeless legacy by connecting indigenous artisans directly with patrons worldwide — preserving endangered traditions while ensuring dignity, fair trade, and prosperity for artisan families.
              </p>

              <ul className="story-points">
                <li className="story-point-item">
                  <span>🧵</span>
                  <span>Authentic handmade items</span>
                </li>
                <li className="story-point-item">
                  <span>🤝</span>
                  <span>Fair trade with artisans</span>
                </li>
                <li className="story-point-item">
                  <span>🌍</span>
                  <span>Shipped worldwide</span>
                </li>
                <li className="story-point-item">
                  <span>✅</span>
                  <span>Quality certified</span>
                </li>
              </ul>

              <Link to="/products" className="btn btn-primary btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER / CTA SECTION */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-banner">
            <div className="newsletter-banner__glow" />
            <div className="newsletter-inner">
              <div className="newsletter-tag">Exclusive Access</div>
              <h2 className="newsletter-title">Join the Iraaya Community</h2>
              <p className="newsletter-desc">
                Receive intimate stories of master artisans, early invitations to limited-edition craft drops, and cultural heritage insights right in your inbox.
              </p>

              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>

              <div className="newsletter-guarantee">
                🔒 We respect your privacy. Unsubscribe anytime with one click.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
