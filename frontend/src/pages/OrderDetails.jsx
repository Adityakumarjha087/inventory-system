import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../services/api';
import './OrderDetails.css';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrder(id);
      setOrder(res.data);
    } catch {
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!order) return null;

  return (
    <div className="order-details">
      <button className="btn btn--secondary" onClick={() => navigate('/orders')}>
        ← Back to Orders
      </button>

      <h1 className="page-title" style={{ marginTop: '16px' }}>Order #{order.id}</h1>

      <div className="order-details__info">
        <div className="order-details__section">
          <h2 className="order-details__section-title">Order Information</h2>
          <dl className="detail-list">
            <dt>Order ID</dt>
            <dd>{order.id}</dd>
            <dt>Date</dt>
            <dd>{formatDate(order.created_at)}</dd>
            <dt>Status</dt>
            <dd className="status-badge">{order.status}</dd>
            <dt>Total Amount</dt>
            <dd><strong>${parseFloat(order.total_amount).toFixed(2)}</strong></dd>
          </dl>
        </div>

        <div className="order-details__section">
          <h2 className="order-details__section-title">Customer Information</h2>
          <dl className="detail-list">
            <dt>Name</dt>
            <dd>{order.customer.full_name}</dd>
            <dt>Email</dt>
            <dd>{order.customer.email}</dd>
            <dt>Phone</dt>
            <dd>{order.customer.phone}</dd>
          </dl>
        </div>
      </div>

      <div className="order-details__section">
        <h2 className="order-details__section-title">Order Items</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product.name}</td>
                <td>{item.product.sku}</td>
                <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>${parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600 }}>Total</td>
              <td style={{ fontWeight: 700 }}>${parseFloat(order.total_amount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default OrderDetails;
