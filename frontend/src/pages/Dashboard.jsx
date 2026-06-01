import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';
import { IconProducts, IconCustomers, IconOrders, IconAlert } from '../components/Icons';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboard();
      setData(res.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!data) return null;

  const lowStockCount = data.low_stock_products ? data.low_stock_products.length : 0;

  return (
    <div className="dashboard fade-in-up">
      <div className="dashboard__header">
        <h1 className="page-title">Workspace Analytics</h1>
        <p className="page-subtitle">Real-time insight into your products, clients, and active orders.</p>
      </div>

      <div className="dashboard__cards">
        {/* Products Card */}
        <div className="dashboard__card dashboard__card--indigo glass-panel">
          <div className="dashboard__card-header">
            <span className="dashboard__card-label">Total Products</span>
            <div className="dashboard__card-icon-wrapper">
              <IconProducts size={20} />
            </div>
          </div>
          <span className="dashboard__card-value">{data.total_products}</span>
          <span className="dashboard__card-trend text-indigo">Active inventory lines</span>
        </div>

        {/* Customers Card */}
        <div className="dashboard__card dashboard__card--emerald glass-panel">
          <div className="dashboard__card-header">
            <span className="dashboard__card-label">Total Customers</span>
            <div className="dashboard__card-icon-wrapper">
              <IconCustomers size={20} />
            </div>
          </div>
          <span className="dashboard__card-value">{data.total_customers}</span>
          <span className="dashboard__card-trend text-emerald">Registered profiles</span>
        </div>

        {/* Orders Card */}
        <div className="dashboard__card dashboard__card--purple glass-panel">
          <div className="dashboard__card-header">
            <span className="dashboard__card-label">Total Orders</span>
            <div className="dashboard__card-icon-wrapper">
              <IconOrders size={20} />
            </div>
          </div>
          <span className="dashboard__card-value">{data.total_orders}</span>
          <span className="dashboard__card-trend text-purple">Transactions processed</span>
        </div>

        {/* Low Stock Card */}
        <div className={`dashboard__card glass-panel ${lowStockCount > 0 ? 'dashboard__card--warn-active' : 'dashboard__card--amber'}`}>
          <div className="dashboard__card-header">
            <span className="dashboard__card-label">Low Stock Items</span>
            <div className="dashboard__card-icon-wrapper">
              <IconAlert size={20} />
            </div>
          </div>
          <span className={`dashboard__card-value ${lowStockCount > 0 ? 'dashboard__card-value--warn' : ''}`}>
            {lowStockCount}
          </span>
          <span className="dashboard__card-trend text-amber">
            {lowStockCount > 0 ? 'Requires immediate action' : 'All items well-stocked'}
          </span>
        </div>
      </div>

      {data.low_stock_products && data.low_stock_products.length > 0 && (
        <div className="dashboard__section glass-panel">
          <div className="dashboard__section-header">
            <div className="dashboard__section-title-group">
              <IconAlert size={20} className="text-warn-icon" />
              <h2 className="dashboard__section-title">Critical Inventory Alerts</h2>
            </div>
            <span className="dashboard__section-badge">Low Stock Action List</span>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU Code</th>
                  <th style={{ textAlign: 'right' }}>Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map((p) => (
                  <tr key={p.sku}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <code className="sku-badge">{p.sku}</code>
                    </td>
                    <td className="text-warn" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {p.quantity_in_stock} units left
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
