import { useState, useEffect, useCallback } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import { IconPlus, IconSearch, IconTrash } from '../components/Icons';
import './Customers.css';

const EMPTY_FORM = { full_name: '', email: '', phone: '' };

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCustomers(search);
      setCustomers(res.data);
    } catch {
      setNotification({ message: 'Failed to load customers.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const validate = () => {
    const errors = {};
    if (!form.full_name.trim()) errors.full_name = 'Full name is required.';
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Enter a valid email address.';
    if (!form.phone.trim()) errors.phone = 'Phone number is required.';
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
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };

    try {
      setSubmitting(true);
      await createCustomer(payload);
      setNotification({ message: 'Customer account registered successfully.', type: 'success' });
      closeModal();
      fetchCustomers();
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
      await deleteCustomer(confirmDelete.id);
      setNotification({ message: 'Customer account removed from database.', type: 'success' });
      setConfirmDelete(null);
      fetchCustomers();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete customer.';
      setNotification({ message: msg, type: 'error' });
      setConfirmDelete(null);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="customers-page fade-in-up">
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Customers Directory</h1>
          <p className="page-subtitle">Lookup, add, manage, or remove customer profile records in Syndicate.</p>
        </div>
        <button className="btn btn--primary" onClick={openAdd}>
          <IconPlus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="search-bar">
        <div className="search-bar__input-wrapper">
          <IconSearch size={16} className="search-bar__icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search customers by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Syncing active profiles...</div>
      ) : customers.length === 0 ? (
        <div className="page-empty">No customer accounts matched criteria.</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td data-label="Customer Name" style={{ fontWeight: 600 }}>{c.full_name}</td>
                  <td data-label="Email Address">
                    <a href={`mailto:${c.email}`} className="customer-email-link">
                      {c.email}
                    </a>
                  </td>
                  <td data-label="Phone Number" style={{ fontWeight: 500 }}>{c.phone}</td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    <button className="btn btn--danger btn--sm" onClick={() => setConfirmDelete(c)}>
                      <IconTrash size={14} />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Register Customer Account" onClose={closeModal}>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label className="form-label" htmlFor="full_name">Full Name</label>
              <input id="full_name" name="full_name" className="form-input" placeholder="e.g. John Doe" value={form.full_name} onChange={handleChange} />
              {formErrors.full_name && <span className="form-error">{formErrors.full_name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" className="form-input" placeholder="e.g. john.doe@nexus.com" value={form.email} onChange={handleChange} />
              {formErrors.email && <span className="form-error">{formErrors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" className="form-input" placeholder="e.g. +1 (555) 019-2834" value={form.phone} onChange={handleChange} />
              {formErrors.phone && <span className="form-error">{formErrors.phone}</span>}
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn--secondary" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Registering...' : 'Register Profile'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Are you sure you want to remove customer "${confirmDelete.full_name}" from Syndicate system records? This will delete active linkages and cannot be undone.`}
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

export default Customers;
