import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowLeft, FiLock } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SHIPPING_THRESHOLD = 2000;
const SHIPPING_COST = 150;
const GST_RATE = 0.18;

/* ─── Fallback image when product has no photos ─── */
const PLACEHOLDER =
  'https://placehold.co/90x90/221508/D4AF37?text=🪔';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, updateCart, removeFromCart, clearCart } = useCart();

  /* ── Derived totals ── */
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const gst = subtotal * GST_RATE;
  const shipping = subtotal > SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + gst + shipping;

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  /* ── Handlers ── */
  const handleQuantityChange = (productId, currentQty, delta) => {
    const next = currentQty + delta;
    if (next < 1) return;
    updateCart(productId, next);
  };

  const handleClearCart = async () => {
    if (!cart.items.length) return;
    await clearCart();
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    toast('Checkout coming soon! 🚀', {
      icon: '🛍️',
      style: {
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
      },
    });
  };

  /* ─────────────── GUARDS ─────────────── */

  /* Still resolving auth state */
  if (authLoading) {
    return (
      <div className="page-wrapper">
        <div className="loading-center">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  /* Not logged in */
  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="cart-auth-gate">
            <div className="empty-state">
              <div className="empty-state__icon">🔒</div>
              <h3>Sign in to view your cart</h3>
              <p>Your cart awaits — please log in to continue shopping.</p>
              <div className="cart-auth-gate__actions">
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-outline">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Cart data loading */
  if (loading && !cart.items.length) {
    return (
      <div className="page-wrapper">
        <div className="loading-center">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  /* ─────────────── MAIN RENDER ─────────────── */
  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Back link */}
        <Link to="/products" className="cart-back-link">
          <FiArrowLeft />
          Continue Shopping
        </Link>

        {/* Page title */}
        <h1 className="cart-page__title">
          Your Cart{' '}
          {cart.items.length > 0 && (
            <span className="cart-page__count">({cart.items.length})</span>
          )}
        </h1>

        {cart.items.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div className="empty-state animate-in">
            <div className="empty-state__icon">
              <FiShoppingBag />
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven&apos;t added anything yet.</p>
            <Link to="/products" className="btn btn-primary cart-empty-cta">
              Browse Handicrafts
            </Link>
          </div>
        ) : (
          /* ── TWO-COLUMN LAYOUT ── */
          <div className="cart-layout">
            {/* ══════════ LEFT – Cart Items ══════════ */}
            <section className="cart-items-col">
              <div className="cart-items-list stagger-in">
                {cart.items.map((item) => {
                  const { product, quantity } = item;
                  const imgSrc = product.images?.[0] || PLACEHOLDER;

                  return (
                    <article key={item.productId} className="cart-item">
                      {/* Product image */}
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="cart-item__image"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER;
                        }}
                      />

                      {/* Info block */}
                      <div className="cart-item__info">
                        <h4 className="cart-item__name" title={product.name}>
                          {product.name}
                        </h4>

                        <div className="cart-item__meta">
                          {product.state && (
                            <span className="tag badge-state">
                              {product.state}
                            </span>
                          )}
                          {product.category && (
                            <span className="cart-item__category">
                              {product.category}
                            </span>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="quantity-control">
                          <button
                            className="qty-btn"
                            aria-label="Decrease quantity"
                            disabled={quantity <= 1 || loading}
                            onClick={() =>
                              handleQuantityChange(item.productId, quantity, -1)
                            }
                          >
                            −
                          </button>
                          <span className="qty-value">{quantity}</span>
                          <button
                            className="qty-btn"
                            aria-label="Increase quantity"
                            disabled={loading}
                            onClick={() =>
                              handleQuantityChange(item.productId, quantity, +1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Right side: price + remove */}
                      <div className="cart-item__right">
                        <span className="cart-item__price">
                          {fmt(product.price * quantity)}
                        </span>
                        <button
                          className="cart-item__remove"
                          aria-label={`Remove ${product.name}`}
                          title="Remove item"
                          disabled={loading}
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Clear cart */}
              <div className="cart-items-footer">
                <button
                  className="btn btn-ghost btn-sm cart-clear-btn"
                  onClick={handleClearCart}
                  disabled={loading}
                >
                  <FiTrash2 />
                  Clear Cart
                </button>
              </div>
            </section>

            {/* ══════════ RIGHT – Order Summary ══════════ */}
            <aside className="order-summary animate-in">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>

              <div className="summary-row">
                <span>GST (18%)</span>
                <span>{fmt(gst)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'summary-free' : ''}>
                  {shipping === 0 ? 'FREE' : fmt(shipping)}
                </span>
              </div>

              {subtotal > 0 && subtotal <= SHIPPING_THRESHOLD && (
                <p className="summary-shipping-note">
                  Add {fmt(SHIPPING_THRESHOLD - subtotal)} more for free
                  shipping
                </p>
              )}

              <div className="summary-row total">
                <span>Total</span>
                <span className="amount">{fmt(total)}</span>
              </div>

              {/* Checkout CTA */}
              <button
                className="btn btn-primary btn-checkout"
                onClick={handleCheckout}
                disabled={loading}
              >
                Proceed to Checkout
              </button>

              {/* Secure payment badge */}
              <div className="secure-badge">
                <FiLock className="secure-badge__icon" />
                <span>100% Secure Payment</span>
              </div>

              {/* Accepted payment icons (placeholder) */}
              <div className="payment-icons">
                <span className="payment-icon" title="UPI">UPI</span>
                <span className="payment-icon" title="Visa">VISA</span>
                <span className="payment-icon" title="Mastercard">MC</span>
                <span className="payment-icon" title="Net Banking">NB</span>
                <span className="payment-icon" title="RuPay">RP</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
