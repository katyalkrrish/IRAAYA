import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUploadCloud, FiX, FiPlus } from 'react-icons/fi';
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

const INITIAL_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  state: '',
  stock: 10,
  artisan: '',
  tags: '',
  isFeatured: false,
};

export default function AdminAddProduct() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Authentication & Role check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Upload individual file to /api/upload
  const uploadFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image file`);
      return null;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await api.post('/api/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.url || null;
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to upload ${file.name}`);
      return null;
    }
  };

  // Handle file selection / drop
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls = [];

    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully!`);
    }

    setUploading(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Product description is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.state) {
      toast.error('Please select a state');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        state: formData.state,
        category: formData.category,
        images: images,
        stock: parseInt(formData.stock, 10) || 0,
        artisan: formData.artisan.trim(),
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isFeatured: Boolean(formData.isFeatured),
      };

      await api.post('/api/products', payload);
      toast.success('Product created successfully!');

      // Reset form and images
      setFormData(INITIAL_FORM);
      setImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="page-wrapper">
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-content">
          {/* Header & Back Button */}
          <div className="admin-header">
            <div>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn btn-ghost btn-sm"
                style={{ marginBottom: '0.75rem' }}
              >
                <FiArrowLeft size={16} /> Back to Dashboard
              </button>
              <h1 className="admin-header__title">Add New Product</h1>
              <p className="admin-header__subtitle">
                Publish a handcrafted item to Iraaya's artisan collection
              </p>
            </div>
          </div>

          <div className="admin-form-container">
            <div className="admin-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Product Details</h2>
              </div>

              <div className="admin-card__body">
                <form onSubmit={handleSubmit} className="admin-form">
                  <div className="admin-form-grid">
                    {/* Product Name */}
                    <div className="input-group admin-form-full">
                      <label className="input-label" htmlFor="prod-name">
                        Product Name *
                      </label>
                      <input
                        id="prod-name"
                        type="text"
                        name="name"
                        className="input"
                        placeholder="e.g., Handcrafted Blue Pottery Floral Vase"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="input-group">
                      <label className="input-label" htmlFor="prod-cat">
                        Category *
                      </label>
                      <select
                        id="prod-cat"
                        name="category"
                        className="input"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State */}
                    <div className="input-group">
                      <label className="input-label" htmlFor="prod-state">
                        State of Origin *
                      </label>
                      <select
                        id="prod-state"
                        name="state"
                        className="input"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Indian State</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div className="input-group">
                      <label className="input-label" htmlFor="prod-price">
                        Price (₹ INR) *
                      </label>
                      <input
                        id="prod-price"
                        type="number"
                        name="price"
                        min="1"
                        step="0.01"
                        className="input"
                        placeholder="e.g., 2499"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Stock */}
                    <div className="input-group">
                      <label className="input-label" htmlFor="prod-stock">
                        Available Stock
                      </label>
                      <input
                        id="prod-stock"
                        type="number"
                        name="stock"
                        min="0"
                        className="input"
                        placeholder="10"
                        value={formData.stock}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Artisan Name */}
                    <div className="input-group">
                      <label className="input-label" htmlFor="prod-artisan">
                        Artisan / Master Craftsman
                      </label>
                      <input
                        id="prod-artisan"
                        type="text"
                        name="artisan"
                        className="input"
                        placeholder="e.g., Ram Gopal Kumhar"
                        value={formData.artisan}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Tags */}
                    <div className="input-group">
                      <label className="input-label" htmlFor="prod-tags">
                        Tags (comma separated)
                      </label>
                      <input
                        id="prod-tags"
                        type="text"
                        name="tags"
                        className="input"
                        placeholder="e.g., terracotta, handmade, rajasthan"
                        value={formData.tags}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Description */}
                    <div className="input-group admin-form-full">
                      <label className="input-label" htmlFor="prod-desc">
                        Product Description *
                      </label>
                      <textarea
                        id="prod-desc"
                        name="description"
                        className="input"
                        rows={5}
                        placeholder="Describe the heritage, materials used, artistic techniques, and dimensions of this craft..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Featured Toggle */}
                    <div className="admin-form-full">
                      <div
                        className="admin-toggle-control"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))
                        }
                      >
                        <div className={`admin-switch ${formData.isFeatured ? 'checked' : ''}`}>
                          <div className="admin-switch__handle" />
                        </div>
                        <div>
                          <div className="admin-toggle-label">Feature this product</div>
                          <div className="admin-toggle-desc">
                            Featured items appear on the homepage showcase and featured badges.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Upload Area */}
                    <div className="input-group admin-form-full">
                      <label className="input-label">Product Images</label>

                      <div
                        className={`image-upload-area ${dragActive ? 'dragover' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <FiUploadCloud className="image-upload-area__icon" />
                        <p className="image-upload-area__text">
                          <strong>Click to browse</strong> or drag &amp; drop images here
                        </p>
                        <p className="admin-upload-note">
                          Supports PNG, JPG, JPEG, and WebP formats
                        </p>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFiles(e.target.files)}
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        multiple
                        style={{ display: 'none' }}
                      />

                      {uploading && (
                        <div className="admin-upload-status">
                          <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                          <span>Uploading image(s) to server...</span>
                        </div>
                      )}

                      {/* Image Previews */}
                      {images.length > 0 && (
                        <div className="image-previews">
                          {images.map((url, idx) => (
                            <div key={idx} className="image-preview">
                              <img src={url} alt={`Preview ${idx + 1}`} />
                              <button
                                type="button"
                                className="image-preview__remove"
                                onClick={() => handleRemoveImage(idx)}
                                title="Remove photo"
                              >
                                <FiX />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => navigate('/admin')}
                      disabled={submitting || uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting || uploading}
                    >
                      {submitting ? (
                        <>
                          <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                          Creating Product...
                        </>
                      ) : (
                        <>
                          <FiPlus size={18} /> Publish Product
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
