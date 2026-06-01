import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../services/api';
import { IconArrowLeft } from '../components/Icons';
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

  if (loading) return <div className="page-loading">Syncing invoice records...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!order) return null;

  return (
    <div className="order-details fade-in-up">
      <div className="order-details__header">
        <button className="btn btn--secondary btn--sm" onClick={() => navigate('/orders')}>
          <IconArrowLeft size={14} />
          <span>Back to Orders</span>
        </button>
      </div>

      <div className="order-details__title-area">
        <h1 className="page-title">Order Dispatch Details</h1>
        <p className="page-subtitle">Invoice record receipt and fulfillment tracking for Order #{order.id}</p>
      </div>

      <div className="order-details__grid">
        {/* Order Metadata */}
        <div className="order-details__section glass-panel">
          <h2 className="order-details__section-title">Fulfillment Metadata</h2>
          <dl className="detail-list">
            <dt>Order ID</dt>
            <dd>
              <code className="order-id-badge">#{order.id}</code>
            </dd>
            
            <dt>Date Processed</dt>
            <dd>{formatDate(order.created_at)}</dd>
            
            <dt>Fulfillment Status</dt>
            <dd>
              <span className="status-badge status-badge--success">{order.status}</span>
            </dd>
            
            <dt>Total Value</dt>
            <dd className="detail-total-value">
              ${parseFloat(order.total_amount).toFixed(2)}
            </dd>
          </dl>
        </div>

        {/* Customer Info */}
        <div className="order-details__section glass-panel">
          <h2 className="order-details__section-title">Client Account Details</h2>
          <dl className="detail-list">
            <dt>Full Name</dt>
            <dd style={{ fontWeight: 600 }}>{order.customer.full_name}</dd>
            
            <dt>Email Address</dt>
            <dd>
              <a href={`mailto:${order.customer.email}`} className="customer-email-link">
                {order.customer.email}
              </a>
            </dd>
            
            <dt>Phone Number</dt>
            <dd>{order.customer.phone}</dd>
          </dl>
        </div>
      </div>

      {/* Order Item Grid */}
      <div className="order-details__section glass-panel" style={{ marginTop: '2rem' }}>
        <h2 className="order-details__section-title">Dispatched Line Items</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product Description</th>
                <th>SKU Code</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Subtotal Value</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Product Description" style={{ fontWeight: 600 }}>{item.product.name}</td>
                  <td data-label="SKU Code">
                    <code className="sku-badge">{item.product.sku}</code>
                  </td>
                  <td data-label="Unit Price" style={{ textAlign: 'right' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td data-label="Quantity" style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                  <td data-label="Subtotal Value" style={{ textAlign: 'right', fontWeight: 700 }}>
                    ${parseFloat(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-footer-row">
                <td colSpan="4" className="table-footer-label">Invoice Grand Total:</td>
                <td className="table-footer-val">${parseFloat(order.total_amount).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
