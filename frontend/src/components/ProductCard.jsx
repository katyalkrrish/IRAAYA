import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function StarRating({ rating, numReviews }) {
  return (
    <div className="star-rating">
      <span className="stars">
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ color: i <= Math.round(rating) ? 'var(--gold)' : 'var(--border-color)' }}>★</span>
        ))}
      </span>
      <span className="count">({numReviews || 0})</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const inWishlist = isInWishlist(product.id);
  const img = product.images?.[0] || `https://placehold.co/400x400/221508/D4AF37?text=${encodeURIComponent(product.name?.slice(0,2))}`;

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-card__image-wrap">
        <img src={img} alt={product.name} loading="lazy" onError={e => { e.target.src = `https://placehold.co/400x400/221508/D4AF37?text=🪔`; }} />
        <span className="product-card__badge badge-state">{product.state}</span>
        {product.isFeatured && <span className="product-card__badge badge-featured" style={{ top: '2.5rem' }}>Featured</span>}
        <div className="product-card__actions" onClick={e => e.stopPropagation()}>
          <button
            className={`action-btn ${inWishlist ? 'active' : ''}`}
            onClick={() => toggleWishlist(product.id)}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {inWishlist ? '❤️' : <FiHeart />}
          </button>
          <button
            className="action-btn"
            onClick={() => addToCart(product.id)}
            title="Add to cart"
          >
            <FiShoppingCart />
          </button>
        </div>
      </div>
      <div className="product-card__body">
        <div className="product-card__category">{product.category}</div>
        <div className="product-card__name">{product.name}</div>
        {product.artisan && <div className="product-card__artisan">by {product.artisan}</div>}
        <div className="product-card__footer">
          <div className="product-card__price">
            ₹{product.price?.toLocaleString('en-IN')}
            <span> /item</span>
          </div>
          <StarRating rating={product.rating} numReviews={product.numReviews} />
        </div>
      </div>
    </div>
  );
}
