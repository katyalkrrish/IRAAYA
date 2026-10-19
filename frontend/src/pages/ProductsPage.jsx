import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiX, FiRotateCcw } from 'react-icons/fi';
import api from '../api/client';
import ProductCard from '../components/ProductCard';

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

const CATEGORY_TABS = [
  { id: '', name: 'All', icon: '✨' },
  { id: 'Textiles', name: 'Textiles', icon: '🧵' },
  { id: 'Pottery', name: 'Pottery', icon: '🏺' },
  { id: 'Jewellery', name: 'Jewellery', icon: '💍' },
  { id: 'Paintings', name: 'Paintings', icon: '🎨' },
  { id: 'Woodwork', name: 'Woodwork', icon: '🪵' },
  { id: 'Metalwork', name: 'Metalwork', icon: '🔔' },
  { id: 'Bamboo Craft', name: 'Bamboo Craft', icon: '🎋' },
  { id: 'Stone Craft', name: 'Stone Craft', icon: '🪨' },
  { id: 'Leather Work', name: 'Leather Work', icon: '👜' },
  { id: 'Weaving', name: 'Weaving', icon: '🧶' },
];

const FALLBACK_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const querySearch = searchParams.get('search') || '';
  const queryCategory = searchParams.get('category') || '';
  const queryState = searchParams.get('state') || '';
  const queryMinPrice = searchParams.get('min_price') || '';
  const queryMaxPrice = searchParams.get('max_price') || '';
  const querySortBy = searchParams.get('sort_by') || 'createdAt';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  // States & categories from API
  const [statesList, setStatesList] = useState(FALLBACK_STATES);

  // Local form inputs for sidebar
  const [searchInput, setSearchInput] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [selectedState, setSelectedState] = useState(queryState);
  const [minPrice, setMinPrice] = useState(queryMinPrice);
  const [maxPrice, setMaxPrice] = useState(queryMaxPrice);
  const [sortBy, setSortBy] = useState(querySortBy);

  // Products state
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // UI view state
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch metadata on mount
  useEffect(() => {
    api.get('/api/products/meta')
      .then((res) => {
        if (res.data?.states && Array.isArray(res.data.states)) {
          setStatesList(res.data.states);
        }
      })
      .catch((err) => {
        console.error('Failed to load products metadata:', err);
      });
  }, []);

  // Synchronize sidebar form inputs when URL searchParams changes
  useEffect(() => {
    setSearchInput(querySearch);
    setSelectedCategory(queryCategory);
    setSelectedState(queryState);
    setMinPrice(queryMinPrice);
    setMaxPrice(queryMaxPrice);
    setSortBy(querySortBy);
  }, [querySearch, queryCategory, queryState, queryMinPrice, queryMaxPrice, querySortBy]);

  // Fetch products based on searchParams
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const page = searchParams.get('page') || 1;
      const params = {
        page: Number(page),
        limit: 12,
      };

      const searchVal = searchParams.get('search');
      if (searchVal) params.search = searchVal;

      const catVal = searchParams.get('category');
      if (catVal) params.category = catVal;

      const stateVal = searchParams.get('state');
      if (stateVal) params.state = stateVal;

      const minP = searchParams.get('min_price');
      if (minP !== null && minP !== '') params.min_price = Number(minP);

      const maxP = searchParams.get('max_price');
      if (maxP !== null && maxP !== '') params.max_price = Number(maxP);

      const sortVal = searchParams.get('sort_by') || 'createdAt';
      params.sort_by = sortVal;

      const res = await api.get('/api/products', { params });
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters from sidebar form
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const nextParams = {};

    if (searchInput.trim()) nextParams.search = searchInput.trim();
    if (selectedCategory) nextParams.category = selectedCategory;
    if (selectedState) nextParams.state = selectedState;
    if (minPrice !== '') nextParams.min_price = minPrice;
    if (maxPrice !== '') nextParams.max_price = maxPrice;
    if (sortBy && sortBy !== 'createdAt') nextParams.sort_by = sortBy;

    // Reset page to 1 when filters are applied
    setSearchParams(nextParams);
    setMobileFilterOpen(false);
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearchInput('');
    setSelectedCategory('');
    setSelectedState('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  // Category Tab Click
  const handleCategoryTabClick = (catId) => {
    setSelectedCategory(catId);
    const nextParams = {};

    if (searchInput.trim()) nextParams.search = searchInput.trim();
    if (catId) nextParams.category = catId;
    if (selectedState) nextParams.state = selectedState;
    if (minPrice !== '') nextParams.min_price = minPrice;
    if (maxPrice !== '') nextParams.max_price = maxPrice;
    if (sortBy && sortBy !== 'createdAt') nextParams.sort_by = sortBy;

    setSearchParams(nextParams);
  };

  // Sort dropdown in top bar
  const handleTopSortChange = (newSort) => {
    setSortBy(newSort);
    const nextParams = {};

    if (querySearch) nextParams.search = querySearch;
    if (queryCategory) nextParams.category = queryCategory;
    if (queryState) nextParams.state = queryState;
    if (queryMinPrice) nextParams.min_price = queryMinPrice;
    if (queryMaxPrice) nextParams.max_price = queryMaxPrice;
    if (newSort && newSort !== 'createdAt') nextParams.sort_by = newSort;
    if (queryPage > 1) nextParams.page = queryPage.toString();

    setSearchParams(nextParams);
  };

  // Remove individual active filter
  const handleRemoveFilter = (key) => {
    const nextParams = {};
    if (key !== 'search' && querySearch) nextParams.search = querySearch;
    if (key !== 'category' && queryCategory) nextParams.category = queryCategory;
    if (key !== 'state' && queryState) nextParams.state = queryState;
    if (key !== 'price') {
      if (queryMinPrice) nextParams.min_price = queryMinPrice;
      if (queryMaxPrice) nextParams.max_price = queryMaxPrice;
    }
    if (querySortBy && querySortBy !== 'createdAt') nextParams.sort_by = querySortBy;

    setSearchParams(nextParams);
  };

  // Pagination Change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === queryPage) return;
    const nextParams = {};

    if (querySearch) nextParams.search = querySearch;
    if (queryCategory) nextParams.category = queryCategory;
    if (queryState) nextParams.state = queryState;
    if (queryMinPrice) nextParams.min_price = queryMinPrice;
    if (queryMaxPrice) nextParams.max_price = queryMaxPrice;
    if (querySortBy && querySortBy !== 'createdAt') nextParams.sort_by = querySortBy;
    if (newPage > 1) nextParams.page = newPage.toString();

    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else {
      pages.push(1);
      if (queryPage > 3) pages.push('...');
      const start = Math.max(2, queryPage - 1);
      const end = Math.min(totalPages - 1, queryPage + 1);
      for (let i = start; i <= end; i += 1) pages.push(i);
      if (queryPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const hasActiveFilters = Boolean(
    querySearch || queryCategory || queryState || queryMinPrice || queryMaxPrice || (querySortBy && querySortBy !== 'createdAt')
  );

  return (
    <div className="page-wrapper products-page">
      {/* Header Banner */}
      <section className="products-hero">
        <div className="products-hero__glow" />
        <div className="container products-hero__inner">
          <div className="products-hero__tag">
            Authentic Indian Craftsmanship
          </div>
          <h1 className="products-hero__title">
            Explore Handcrafted <span className="gradient-text">Treasures</span>
          </h1>
          <p className="products-hero__desc">
            Directly sourced from master artisans across all 28 states and Union Territories of India.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Mobile Filter Toggle Button */}
        <div className="mobile-filter-bar">
          <button
            type="button"
            className="btn btn-outline mobile-filter-btn"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <FiFilter />
            <span>{mobileFilterOpen ? 'Hide Filters' : 'Filter & Sort Products'}</span>
          </button>
        </div>

        <div className="products-layout">
          {/* Left Sidebar Filter Panel */}
          <aside className={`filter-panel ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="filter-panel__header">
              <div className="filter-panel__title">
                <FiFilter />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="filter-panel__reset"
                  onClick={handleClearAll}
                  title="Clear all filters"
                >
                  <FiRotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <form onSubmit={handleApplyFilters}>
              {/* Search by Name */}
              <div className="filter-section">
                <h4>Search</h4>
                <div className="filter-search-box">
                  <FiSearch className="filter-search-icon" />
                  <input
                    type="text"
                    className="input filter-search-input"
                    placeholder="Search by craft or name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="filter-section">
                <h4>Category</h4>
                <select
                  className="input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Dropdown */}
              <div className="filter-section">
                <h4>State of Origin</h4>
                <select
                  className="input"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="">All Indian States</option>
                  {statesList.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <h4>Price Range (₹)</h4>
                <div className="price-inputs-row">
                  <div className="price-input-col">
                    <span className="price-input-label">Min Price</span>
                    <input
                      type="number"
                      min="0"
                      className="input price-input"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <span className="price-separator">—</span>
                  <div className="price-input-col">
                    <span className="price-input-label">Max Price</span>
                    <input
                      type="number"
                      min="0"
                      className="input price-input"
                      placeholder="50000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div className="filter-section">
                <h4>Sort By</h4>
                <select
                  className="input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="filter-actions">
                <button type="submit" className="btn btn-primary">
                  Apply Filters
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>
            </form>
          </aside>

          {/* Right Main Area */}
          <main className="products-content">
            {/* Category Tabs (Horizontal Scrollable) */}
            <div className="products-tabs-wrapper">
              <div className="category-tabs">
                {CATEGORY_TABS.map((tab) => (
                  <div
                    key={tab.id || 'all'}
                    className={`category-tab ${queryCategory === tab.id ? 'active' : ''}`}
                    onClick={() => handleCategoryTabClick(tab.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleCategoryTabClick(tab.id);
                      }
                    }}
                  >
                    <span className="category-tab__icon">{tab.icon}</span>
                    <span className="category-tab__label">{tab.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Bar */}
            <div className="products-topbar">
              <div className="products-count">
                Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
              </div>

              <div className="products-topbar__right">
                <span className="products-sort-label">Sort:</span>
                <select
                  className="input products-sort-select"
                  value={querySortBy}
                  onChange={(e) => handleTopSortChange(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="view-mode-toggle">
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                    aria-label="Grid view"
                  >
                    <FiGrid />
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List view"
                    aria-label="List view"
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Badges */}
            {hasActiveFilters && (
              <div className="active-filters-bar">
                {querySearch && (
                  <span className="active-filter-badge">
                    Search: "{querySearch}"
                    <button
                      type="button"
                      className="active-filter-badge__remove"
                      onClick={() => handleRemoveFilter('search')}
                      aria-label="Remove search filter"
                    >
                      <FiX />
                    </button>
                  </span>
                )}
                {queryCategory && (
                  <span className="active-filter-badge">
                    Category: {queryCategory}
                    <button
                      type="button"
                      className="active-filter-badge__remove"
                      onClick={() => handleRemoveFilter('category')}
                      aria-label="Remove category filter"
                    >
                      <FiX />
                    </button>
                  </span>
                )}
                {queryState && (
                  <span className="active-filter-badge">
                    State: {queryState}
                    <button
                      type="button"
                      className="active-filter-badge__remove"
                      onClick={() => handleRemoveFilter('state')}
                      aria-label="Remove state filter"
                    >
                      <FiX />
                    </button>
                  </span>
                )}
                {(queryMinPrice || queryMaxPrice) && (
                  <span className="active-filter-badge">
                    Price: ₹{queryMinPrice || '0'} - ₹{queryMaxPrice || '∞'}
                    <button
                      type="button"
                      className="active-filter-badge__remove"
                      onClick={() => handleRemoveFilter('price')}
                      aria-label="Remove price filter"
                    >
                      <FiX />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  className="active-filters-clear"
                  onClick={handleClearAll}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Grid / Loading / Empty */}
            {loading ? (
              <div className="loading-center">
                <div className="spinner" />
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">🪔</div>
                <h3>No Handcrafted Products Found</h3>
                <p>We couldn't find any products matching your selected criteria. Try adjusting or clearing your filters.</p>
                <div className="empty-state-cta">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleClearAll}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'list' ? 'products-grid products-grid--list' : 'products-grid'}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="products-pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={queryPage <= 1}
                  onClick={() => handlePageChange(queryPage - 1)}
                >
                  <FiChevronLeft /> Previous
                </button>

                {getPageNumbers().map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`pagination-btn ${queryPage === p ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={queryPage >= totalPages}
                  onClick={() => handlePageChange(queryPage + 1)}
                >
                  Next <FiChevronRight />
                </button>

                <div className="pagination-info">
                  Page {queryPage} of {totalPages}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
