import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
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
      setNotification({ message: 'Failed to load orders.', type: 'error' });
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
      setNotification({ message: 'Failed to load data for order form.', type: 'error' });
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
      setFormError('Please select a customer.');
      return;
    }

    const validItems = items.filter((item) => item.product_id && item.quantity);
    if (validItems.length === 0) {
      setFormError('Add at least one item with a product and quantity.');
      return;
    }

    for (const item of validItems) {
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        setFormError('All item quantities must be greater than 0.');
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
      setNotification({ message: 'Order created.', type: 'success' });
      closeModal();
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create order.';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteOrder(confirmDelete.id);
      setNotification({ message: 'Order cancelled.', type: 'success' });
      setConfirmDelete(null);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to cancel order.';
      setNotification({ message: msg, type: 'error' });
      setConfirmDelete(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <button className="btn btn--primary" onClick={openCreateModal}>Create Order</button>
      </div>

      {loading ? (
        <div className="page-loading">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="page-empty">No orders found.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer_name}</td>
                <td>{o.item_count}</td>
                <td>${parseFloat(o.total_amount).toFixed(2)}</td>
                <td>{formatDate(o.created_at)}</td>
                <td className="actions-cell">
                  <button className="btn btn--secondary btn--sm" onClick={() => navigate(`/orders/${o.id}`)}>View</button>
                  <button className="btn btn--danger btn--sm" onClick={() => setConfirmDelete(o)}>Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <Modal title="Create Order" onClose={closeModal}>
          <form onSubmit={handleSubmit} className="form">
            {formError && <div className="form-error-banner">{formError}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="customer">Customer</label>
              <select
                id="customer"
                className="form-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="order-items-section">
              <div className="order-items-header">
                <span className="form-label">Order Items</span>
                <button type="button" className="btn btn--secondary btn--sm" onClick={addItem}>+ Add Item</button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <select
                    className="form-select order-item-product"
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.quantity_in_stock})
                      </option>
                    ))}
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
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <div className="order-total">
                <strong>Total: ${getTotal().toFixed(2)}</strong>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn--secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Cancel order #${confirmDelete.id}? Stock will be restored.`}
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
