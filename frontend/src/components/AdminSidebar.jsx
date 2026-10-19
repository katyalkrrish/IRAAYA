import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiPlusCircle, FiBox, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

export default function AdminSidebar() {
  const location = useLocation();

  const isCurrent = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <Link to="/admin" className="admin-sidebar__logo">
          <img src="/iraaya-logo.jpg" alt="Iraaya" />
        </Link>
        <span className="admin-sidebar__badge">Admin Portal</span>
      </div>

      <nav className="admin-sidebar__nav">
        <div className="admin-sidebar__section-title">Navigation</div>
        <Link to="/admin" className={`admin-nav-item ${isCurrent('/admin')}`}>
          <FiGrid size={18} />
          <span>Dashboard</span>
        </Link>
        <Link to="/admin/add-product" className={`admin-nav-item ${isCurrent('/admin/add-product')}`}>
          <FiPlusCircle size={18} />
          <span>Add Product</span>
        </Link>
        <Link to="/admin/products" className={`admin-nav-item ${isCurrent('/admin/products')}`}>
          <FiBox size={18} />
          <span>Manage Products</span>
        </Link>
      </nav>

      <div className="admin-sidebar__footer">
        <Link to="/" className="admin-nav-item">
          <FiArrowLeft size={16} />
          <span>Back to Store</span>
        </Link>
        <Link to="/products" className="admin-nav-item">
          <FiShoppingBag size={16} />
          <span>View Public Shop</span>
        </Link>
      </div>
    </aside>
  );
}
