import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/api/wishlist')
      .then(res => setItems(res.data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, wishlist]);

  if (!user) return (
    <div className="page-wrapper">
      <div className="empty-state" style={{ marginTop: '6rem' }}>
        <div className="empty-state__icon">🔒</div>
        <h3>Login Required</h3>
        <p>Please login to view your wishlist</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Login</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Prata, serif', fontSize: '2rem', fontWeight: 700 }}>
              My <span className="gradient-text">Wishlist</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">Continue Shopping</Link>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : items.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '4rem' }}>
            <div className="empty-state__icon">❤️</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love to come back to them later</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              <FiShoppingCart /> Explore Products
            </Link>
          </div>
        ) : (
          <div className="products-grid stagger-in">
            {items.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
