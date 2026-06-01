import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ---------- Products ---------- */

export const getProducts = (search = '') => {
  const params = search ? { search } : {};
  return api.get('/products', { params });
};

export const getProduct = (id) => api.get(`/products/${id}`);

export const createProduct = (data) => api.post('/products', data);

export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

/* ---------- Customers ---------- */

export const getCustomers = (search = '') => {
  const params = search ? { search } : {};
  return api.get('/customers', { params });
};

export const getCustomer = (id) => api.get(`/customers/${id}`);

export const createCustomer = (data) => api.post('/customers', data);

export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

/* ---------- Orders ---------- */

export const getOrders = () => api.get('/orders');

export const getOrder = (id) => api.get(`/orders/${id}`);

export const createOrder = (data) => api.post('/orders', data);

export const deleteOrder = (id) => api.delete(`/orders/${id}`);

/* ---------- Dashboard ---------- */

export const getDashboard = () => api.get('/dashboard');

export default api;
