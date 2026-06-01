import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import './Products.css';

const EMPTY_FORM = { name: '', sku: '', price: '', quantity_in_stock: '' };

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProducts(search);
      setProducts(res.data);
    } catch {
      setNotification({ message: 'Failed to load products.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!form.sku.trim()) errors.sku = 'SKU is required.';
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price <= 0) errors.price = 'Price must be greater than 0.';
    const qty = parseInt(form.quantity_in_stock, 10);
    if (form.quantity_in_stock === '' || isNaN(qty) || qty < 0)
      errors.quantity_in_stock = 'Quantity must be 0 or more.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    };

    try {
      setSubmitting(true);
      if (editing) {
        await updateProduct(editing.id, payload);
        setNotification({ message: 'Product updated.', type: 'success' });
      } else {
        await createProduct(payload);
        setNotification({ message: 'Product created.', type: 'success' });
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.detail || 'An error occurred.';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteProduct(confirmDelete.id);
      setNotification({ message: 'Product deleted.', type: 'success' });
      setConfirmDelete(null);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete product.';
      setNotification({ message: msg, type: 'error' });
      setConfirmDelete(null);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <button className="btn btn--primary" onClick={openAdd}>Add Product</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : products.length === 0 ? (
        <div className="page-empty">No products found.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>${parseFloat(p.price).toFixed(2)}</td>
                <td className={p.quantity_in_stock <= 10 ? 'text-warn' : ''}>
                  {p.quantity_in_stock}
                </td>
                <td className="actions-cell">
                  <button className="btn btn--secondary btn--sm" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn--danger btn--sm" onClick={() => setConfirmDelete(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Product' : 'Add Product'} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Product Name</label>
              <input id="name" name="name" className="form-input" value={form.name} onChange={handleChange} />
              {formErrors.name && <span className="form-error">{formErrors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sku">SKU / Code</label>
              <input id="sku" name="sku" className="form-input" value={form.sku} onChange={handleChange} />
              {formErrors.sku && <span className="form-error">{formErrors.sku}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="price">Price</label>
              <input id="price" name="price" type="number" step="0.01" min="0.01" className="form-input" value={form.price} onChange={handleChange} />
              {formErrors.price && <span className="form-error">{formErrors.price}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="quantity_in_stock">Quantity in Stock</label>
              <input id="quantity_in_stock" name="quantity_in_stock" type="number" min="0" className="form-input" value={form.quantity_in_stock} onChange={handleChange} />
              {formErrors.quantity_in_stock && <span className="form-error">{formErrors.quantity_in_stock}</span>}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn--secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete product "${confirmDelete.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default Products;
