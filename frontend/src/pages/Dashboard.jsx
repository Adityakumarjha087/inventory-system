import { useState, useEffect } from 'react';
import { getDashboard } from '../services/api';
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

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="dashboard__cards">
        <div className="dashboard__card">
          <span className="dashboard__card-label">Total Products</span>
          <span className="dashboard__card-value">{data.total_products}</span>
        </div>
        <div className="dashboard__card">
          <span className="dashboard__card-label">Total Customers</span>
          <span className="dashboard__card-value">{data.total_customers}</span>
        </div>
        <div className="dashboard__card">
          <span className="dashboard__card-label">Total Orders</span>
          <span className="dashboard__card-value">{data.total_orders}</span>
        </div>
        <div className="dashboard__card">
          <span className="dashboard__card-label">Low Stock Items</span>
          <span className="dashboard__card-value dashboard__card-value--warn">
            {data.low_stock_products ? data.low_stock_products.length : 0}
          </span>
        </div>
      </div>

      {data.low_stock_products && data.low_stock_products.length > 0 && (
        <div className="dashboard__section">
          <h2 className="dashboard__section-title">Low Stock Products</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.low_stock_products.map((p) => (
                <tr key={p.sku}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td className="text-warn">{p.quantity_in_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
