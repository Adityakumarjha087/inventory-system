import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import { IconPlus, IconTrash, IconInfo, IconOrders } from '../components/Icons';
import './Orders.css';

const EMPTY_ITEM = { product_id: '', quantity: '' };

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      setOrders(res.data);
    } catch {
      setNotification({ message: 'Failed to load orders history.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setCustomerId('');
      setItems([{ ...EMPTY_ITEM }]);
      setFormError('');
      setShowModal(true);
    } catch {
      setNotification({ message: 'Failed to synchronize inventory data for form.', type: 'error' });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCustomerId('');
    setItems([{ ...EMPTY_ITEM }]);
    setFormError('');
  };

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { ...EMPTY_ITEM }]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  /* Compute running total for the order form */
  const getLineSubtotal = (item) => {
    const product = products.find((p) => p.id === Number(item.product_id));
    const qty = parseInt(item.quantity, 10);
    if (!product || isNaN(qty) || qty <= 0) return 0;
    return parseFloat(product.price) * qty;
  };

  const getTotal = () => items.reduce((sum, item) => sum + getLineSubtotal(item), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerId) {
      setFormError('Please select an active customer profile.');
      return;
    }

    const validItems = items.filter((item) => item.product_id && item.quantity);
    if (validItems.length === 0) {
      setFormError('Add at least one product with an ordering quantity.');
      return;
    }

    for (const item of validItems) {
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        setFormError('All product quantities must be greater than zero.');
        return;
      }
      // Optional client-side stock check for helper warnings
      const product = products.find((p) => p.id === Number(item.product_id));
      if (product && qty > product.quantity_in_stock) {
        setFormError(`Insufficient stock for "${product.name}". Max available is ${product.quantity_in_stock}.`);
        return;
      }
    }

    const payload = {
      customer_id: Number(customerId),
      items: validItems.map((item) => ({
        product_id: Number(item.product_id),
        quantity: parseInt(item.quantity, 10),
      })),
    };

    try {
      setSubmitting(true);
      await createOrder(payload);
      setNotification({ message: 'Order created successfully and stock adjusted.', type: 'success' });
      closeModal();
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to dispatch order.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteOrder(confirmDelete.id);
      setNotification({ message: `Order #${confirmDelete.id} cancelled. Stock restored.`, type: 'success' });
      setConfirmDelete(null);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to cancel order transaction.';
      setNotification({ message: msg, type: 'error' });
      setConfirmDelete(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="orders-page fade-in-up">
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Orders Ledger</h1>
          <p className="page-subtitle">Track transactions, create new sales requests, or cancel dispatches.</p>
        </div>
        <button className="btn btn--primary" onClick={openCreateModal}>
          <IconPlus size={16} />
          <span>Create Order</span>
        </button>
      </div>

      {loading ? (
        <div className="page-loading">Syncing transaction ledger...</div>
      ) : orders.length === 0 ? (
        <div className="page-empty">No transaction history exists yet.</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Client</th>
                <th>Lines</th>
                <th>Total Value</th>
                <th>Date Dispatched</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700 }}>
                    <code className="order-id-badge">#{o.id}</code>
                  </td>
                  <td style={{ fontWeight: 600 }}>{o.customer_name}</td>
                  <td>
                    <span className="order-count-badge">{o.item_count} items</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    ${parseFloat(o.total_amount).toFixed(2)}
                  </td>
                  <td>{formatDate(o.created_at)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="actions-cell">
                      <button className="btn btn--secondary btn--sm" onClick={() => navigate(`/orders/${o.id}`)}>
                        <IconInfo size={14} />
                        <span>Details</span>
                      </button>
                      <button className="btn btn--danger btn--sm" onClick={() => setConfirmDelete(o)}>
                        <IconTrash size={14} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Create New Sales Order" onClose={closeModal}>
          <form onSubmit={handleSubmit} className="form">
            {formError && <div className="form-error-banner">{formError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="customer">Customer Profile</label>
              <select
                id="customer"
                className="form-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Select customer client account...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="order-items-section">
              <div className="order-items-header">
                <span className="form-label">Order Components</span>
                <button type="button" className="btn btn--secondary btn--sm" onClick={addItem}>
                  <IconPlus size={12} />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="order-items-list">
                {items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <select
                      className="form-select order-item-product"
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    >
                      <option value="">Select product...</option>
                      {products.map((p) => {
                        const outOfStock = p.quantity_in_stock <= 0;
                        return (
                          <option key={p.id} value={p.id} disabled={outOfStock}>
                            {p.name} (${parseFloat(p.price).toFixed(2)}) {outOfStock ? '[OUT OF STOCK]' : `[Stock: ${p.quantity_in_stock}]`}
                          </option>
                        );
                      })}
                    </select>
                    
                    <input
                      type="number"
                      min="1"
                      className="form-input order-item-qty"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                    
                    <span className="order-item-subtotal">
                      ${getLineSubtotal(item).toFixed(2)}
                    </span>
                    
                    <button
                      type="button"
                      className="btn btn--danger btn--sm order-item-remove"
                      disabled={items.length <= 1}
                      onClick={() => removeItem(index)}
                      aria-label="Remove item line"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="order-total-panel">
                <span className="order-total-label">Grand Total:</span>
                <strong className="order-total-value">${getTotal().toFixed(2)}</strong>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn--secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Processing Dispatch...' : 'Dispatch Order'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Are you sure you want to cancel order #${confirmDelete.id} dispatched for "${confirmDelete.customer_name}"? Order items stock will be fully restored back to available inventory. This transaction cannot be undone.`}
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

export default Orders;
