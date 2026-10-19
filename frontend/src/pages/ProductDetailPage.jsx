import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiArrowLeft, FiShare2, FiMapPin } from 'react-icons/fi';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StarRating({ rating, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          style={{
            fontSize: interactive ? '1.5rem' : '1rem',
            color: i <= (hover || Math.round(rating)) ? 'var(--gold)' : 'var(--border-color)',
            cursor: interactive ? 'pointer' : 'default',
            transition: 'var(--transition-fast)'
          }}
          onClick={() => interactive && onRate && onRate(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
        >★</span>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/api/products/${id}`),
          api.get(`/api/reviews/${id}`)
        ]);
        setProduct(pRes.data);
        setReviews(rRes.data.reviews);
      } catch (e) {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => addToCart(id, qty);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to leave a review'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/api/reviews/${id}`, reviewForm);
      toast.success('Review submitted!');
      const rRes = await api.get(`/api/reviews/${id}`);
      setReviews(rRes.data.reviews);
      setReviewForm({ rating: 5, comment: '' });
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper loading-center">
      <div className="spinner"></div>
    </div>
  );

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images
    : [`https://placehold.co/600x600/221508/D4AF37?text=${encodeURIComponent(product.name?.slice(0,2))}`];

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '2rem' }}>
          <FiArrowLeft /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--border-color)', aspectRatio: '1' }}>
              <img
                src={images[activeImg]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.src = 'https://placehold.co/600x600/221508/D4AF37?text=🪔'; }}
              />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: '72px', height: '72px', borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                      border: `2px solid ${i === activeImg ? 'var(--saffron)' : 'var(--border-color)'}`,
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span className="tag">{product.category}</span>
                <span className="tag" style={{ color: 'var(--text-saffron)', borderColor: 'rgba(255,153,51,0.3)' }}>
                  <FiMapPin size={11} style={{ marginRight: 4 }} />{product.state}
                </span>
                {product.isFeatured && <span className="tag" style={{ background: 'var(--gradient-brand)', color: 'white', border: 'none' }}>Featured</span>}
              </div>
              <h1 style={{ fontFamily: 'Prata, serif', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2 }}>
                {product.name}
              </h1>
              {product.artisan && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Crafted by <strong style={{ color: 'var(--text-secondary)' }}>{product.artisan}</strong></p>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <StarRating rating={product.rating} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.numReviews} reviews)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'Prata, serif', fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-gold)' }}>
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>per item</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {product.description}
            </p>

            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500 }}>Qty:</span>
              <div className="quantity-control">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}>+</button>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button
                className={`btn ${inWishlist ? 'btn-primary' : 'btn-outline'} btn-icon`}
                onClick={() => toggleWishlist(product.id)}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {inWishlist ? '❤️' : <FiHeart />}
              </button>
              <button className="btn btn-ghost btn-icon" title="Share" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}>
                <FiShare2 />
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              {['🔒 Secure Payment', '🚚 Free Shipping >₹2000', '✅ Authentic Craft', '↩️ Easy Returns'].map(badge => (
                <div key={badge} style={{ padding: '0.6rem 0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
          <h2 style={{ fontFamily: 'Prata, serif', fontSize: '1.6rem', marginBottom: '2rem' }}>
            Customer Reviews
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Review list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state__icon">⭐</div>
                  <h3>No reviews yet</h3>
                  <p>Be the first to review this product!</p>
                </div>
              ) : reviews.map(r => (
                <div key={r.id} style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem' }}>{r.userName}</strong>
                      <div style={{ display: 'flex', gap: '1px', marginTop: '2px' }}>
                        {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= r.rating ? 'var(--gold)' : 'var(--border-color)', fontSize: '0.85rem' }}>★</span>)}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{r.comment}</p>
                </div>
              ))}
            </div>

            {/* Add review form */}
            {user && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Prata, serif', fontSize: '1.15rem', marginBottom: '1.25rem' }}>Write a Review</h3>
                <form onSubmit={handleReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div className="input-label" style={{ marginBottom: '0.5rem' }}>Your Rating</div>
                    <StarRating interactive rating={reviewForm.rating} onRate={(r) => setReviewForm(f => ({ ...f, rating: r }))} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Your Review</label>
                    <textarea
                      className="input"
                      placeholder="Share your experience with this product..."
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview} style={{ justifyContent: 'center' }}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
