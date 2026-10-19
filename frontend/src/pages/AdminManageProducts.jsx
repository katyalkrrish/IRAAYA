import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiEye,
  FiMapPin,
  FiXCircle,
} from 'react-icons/fi';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
];

const CATEGORIES = [
  'Textiles',
  'Pottery',
  'Jewellery',
  'Paintings',
  'Woodwork',
  'Metalwork',
  'Bamboo Craft',
  'Stone Craft',
  'Leather Work',
  'Weaving',
];

const ITEMS_PER_PAGE = 10;

export default function AdminManageProducts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Authentication & Role check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!user || user.role !== 'admin') return;

    setLoading(true);
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        sort_by: 'createdAt',
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (category) params.category = category;
      if (state) params.state = state;

      const res = await api.get('/api/products', { params });
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [user, page, debouncedSearch, category, state]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when category or state changes
  const handleCategoryChange = (val) => {
    setCategory(val);
    setPage(1);
  };

  const handleStateChange = (val) => {
    setState(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setState('');
    setPage(1);
  };

  // Delete product action
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await api.delete(`/api/products/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);

      // If last item on page > 1, go to previous page
      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (prod) => {
    toast(`Edit functionality for "${prod.name}" will be available soon.`, {
      icon: '🛠️',
    });
  };

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

  const hasActiveFilters = Boolean(search || category || state);

  return (
    <div className="page-wrapper">
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-content">
          {/* Header */}
          <div className="admin-header">
            <div>
              <h1 className="admin-header__title">Manage Products</h1>
              <p className="admin-header__subtitle">
                View, search, edit, or remove crafts across all 33 Indian states ({total} total items)
              </p>
            </div>
            <div className="admin-header__actions">
              <Link to="/admin/add-product" className="btn btn-primary btn-sm">
                <FiPlus size={16} /> Add Product
              </Link>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-toolbar__search">
              <FiSearch size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by title, artisan, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <FiXCircle size={15} />
                </button>
              )}
            </div>

            <div className="admin-toolbar__filters">
              {/* Category Filter */}
              <select
                className="input"
                style={{ width: 'auto', minWidth: '160px', padding: '0.6rem 2.2rem 0.6rem 0.85rem', fontSize: '0.85rem' }}
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* State Filter */}
              <select
                className="input"
                style={{ width: 'auto', minWidth: '160px', padding: '0.6rem 2.2rem 0.6rem 0.85rem', fontSize: '0.85rem' }}
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Table Card */}
          <div className="admin-card">
            {loading ? (
              <div className="loading-center" style={{ minHeight: '300px' }}>
                <div className="spinner"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🔍</div>
                <h3>No products found</h3>
                <p>
                  {hasActiveFilters
                    ? 'Try adjusting or clearing your search filters.'
                    : 'There are currently no products in the catalog.'}
                </p>
                {hasActiveFilters ? (
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleClearFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: '1rem' }}>
                    <Link to="/admin/add-product" className="btn btn-primary btn-sm">
                      <FiPlus /> Add First Product
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>State</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Featured</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
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
                              <img
                                src={imageSrc}
                                alt={p.name}
                                className="admin-table__img"
                                onError={(e) => {
                                  e.target.src =
                                    'https://placehold.co/100x100/221508/D4AF37?text=Craft';
                                }}
                              />
                            </td>
                            <td>
                              <div className="admin-table__name">{p.name}</div>
                              {p.artisan && (
                                <div className="admin-table__subtext">Artisan: {p.artisan}</div>
                              )}
                            </td>
                            <td>
                              <span className="tag">
                                <FiMapPin size={11} /> {p.state}
                              </span>
                            </td>
                            <td>
                              <span className="tag">{p.category}</span>
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
                                {p.stock > 0 ? `${p.stock} units` : 'Out of stock'}
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
                              <div
                                className="admin-table__actions"
                                style={{ justifyContent: 'center' }}
                              >
                                <Link
                                  to={`/products/${p.id}`}
                                  className="admin-action-btn"
                                  title="View on store"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FiEye size={14} />
                                </Link>
                                <button
                                  type="button"
                                  className="admin-action-btn"
                                  title="Edit product"
                                  onClick={() => handleEdit(p)}
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="admin-action-btn admin-action-btn--delete"
                                  title="Delete product"
                                  onClick={() => setDeleteTarget(p)}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="admin-pagination">
                  <div className="admin-pagination__info">
                    Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(page * ITEMS_PER_PAGE, total)} of {total} items
                  </div>

                  <div className="admin-pagination__controls">
                    <button
                      type="button"
                      className="admin-pagination__btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      title="Previous Page"
                    >
                      <FiChevronLeft size={16} />
                    </button>

                    {Array.from({ length: pages }, (_, i) => i + 1)
                      .filter((pageNum) => {
                        return (
                          pageNum === 1 ||
                          pageNum === pages ||
                          Math.abs(pageNum - page) <= 1
                        );
                      })
                      .map((pageNum, idx, visibleArr) => {
                        const showEllipsis =
                          idx > 0 && pageNum - visibleArr[idx - 1] > 1;

                        return (
                          <div key={pageNum} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {showEllipsis && (
                              <span style={{ color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                                …
                              </span>
                            )}
                            <button
                              type="button"
                              className={`admin-pagination__btn ${
                                pageNum === page ? 'active' : ''
                              }`}
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </div>
                        );
                      })}

                    <button
                      type="button"
                      className="admin-pagination__btn"
                      disabled={page >= pages}
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      title="Next Page"
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="admin-modal-backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div
            className="admin-modal-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-icon">
              <FiAlertTriangle />
            </div>
            <h3 className="admin-modal-title">Delete Product?</h3>
            <p className="admin-modal-desc">
              Are you sure you want to permanently delete{' '}
              <strong style={{ color: 'var(--text-primary)' }}>"{deleteTarget.name}"</strong>?
              This handicraft item will be immediately removed from Iraaya's storefront. This action
              cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                }}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
