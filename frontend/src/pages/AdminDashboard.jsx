import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiList, FiMapPin, FiExternalLink } from 'react-icons/fi';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';

const TOTAL_USERS_HARDCODED = 142;
const TOTAL_CATEGORIES = 10;

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication & Role check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Fetch recent products
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    let isMounted = true;
    const fetchRecent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/products', {
          params: { limit: 5, sort_by: 'createdAt' }
        });
        if (isMounted) {
          setProducts(res.data.products || []);
          setTotalProducts(res.data.total ?? (res.data.products?.length || 0));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Failed to fetch recent products');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecent();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (authLoading) {
    return (
      <div className="page-wrapper loading-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="page-wrapper">
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-content">
          {/* Header */}
          <div className="admin-header">
            <div>
              <h1 className="admin-header__title">Admin Dashboard</h1>
              <p className="admin-header__subtitle">
                Welcome back, {user?.name || 'Admin'} • Overview of store catalog and artisan crafts
              </p>
            </div>
            <div className="admin-header__actions">
              <Link to="/admin/add-product" className="btn btn-primary btn-sm">
                <FiPlus size={16} /> Add Product
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-card__value">{totalProducts}</div>
              <div className="stat-card__label">Total Products</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{TOTAL_USERS_HARDCODED}</div>
              <div className="stat-card__label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">{TOTAL_CATEGORIES}</div>
              <div className="stat-card__label">Craft Categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value">33</div>
              <div className="stat-card__label">States & UTs</div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="admin-quick-actions">
            <Link to="/admin/add-product" className="btn btn-primary">
              <FiPlus size={18} /> Add New Product
            </Link>
            <Link to="/admin/products" className="btn btn-outline">
              <FiList size={18} /> View All Products
            </Link>
          </div>

          {/* Recent Products Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">Recent Products</h2>
              <Link to="/admin/products" className="btn btn-ghost btn-sm">
                View All ({totalProducts})
              </Link>
            </div>

            {loading ? (
              <div className="loading-center">
                <div className="spinner"></div>
              </div>
            ) : error ? (
              <div className="empty-state">
                <p className="text-muted">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">📦</div>
                <h3>No products found</h3>
                <p>Start by adding your first handicraft item.</p>
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/admin/add-product" className="btn btn-primary btn-sm">
                    <FiPlus /> Add First Product
                  </Link>
                </div>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>State</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const imageSrc =
                        p.images && p.images.length > 0
                          ? p.images[0]
                          : 'https://placehold.co/100x100/221508/D4AF37?text=Craft';

                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="admin-table__cell-flex">
                              <img
                                src={imageSrc}
                                alt={p.name}
                                className="admin-table__img"
                                onError={(e) => {
                                  e.target.src = 'https://placehold.co/100x100/221508/D4AF37?text=Craft';
                                }}
                              />
                              <div>
                                <div className="admin-table__name">{p.name}</div>
                                {p.artisan && (
                                  <div className="admin-table__subtext">By {p.artisan}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="tag">{p.category}</span>
                          </td>
                          <td>
                            <span className="tag">
                              <FiMapPin size={11} /> {p.state}
                            </span>
                          </td>
                          <td className="admin-table__price">
                            ₹{Number(p.price || 0).toLocaleString('en-IN')}
                          </td>
                          <td>
                            <span
                              className={`admin-badge ${
                                p.stock > 5
                                  ? 'admin-badge--success'
                                  : p.stock > 0
                                  ? 'admin-badge--warning'
                                  : 'admin-badge--danger'
                              }`}
                            >
                              {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                            </span>
                          </td>
                          <td>
                            {p.isFeatured ? (
                              <span className="admin-badge admin-badge--featured">Featured</span>
                            ) : (
                              <span className="admin-badge admin-badge--normal">Standard</span>
                            )}
                          </td>
                          <td>
                            <Link
                              to={`/products/${p.id}`}
                              className="admin-action-btn"
                              title="View in Store"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FiExternalLink size={14} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
