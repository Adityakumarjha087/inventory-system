import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { IconDashboard, IconProducts, IconCustomers, IconOrders } from './Icons';
import './Layout.css';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {/* Dynamic Background Glowing Orbs */}
      <div className="bg-glow bg-glow--1"></div>
      <div className="bg-glow bg-glow--2"></div>
      
      <button
        className="hamburger"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <span className="hamburger__line"></span>
        <span className="hamburger__line"></span>
        <span className="hamburger__line"></span>
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__brand-icon">
            <IconProducts size={20} color="white" />
          </div>
          <h1 className="sidebar__title">
            <span className="sidebar__title-main">Syndicate</span>
            <span className="sidebar__title-sub">OMS</span>
          </h1>
        </div>
        
        <nav className="sidebar__nav">
          <NavLink to="/" end className={navLinkClass} onClick={closeSidebar}>
            <IconDashboard size={18} className="sidebar__link-icon" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/products" className={navLinkClass} onClick={closeSidebar}>
            <IconProducts size={18} className="sidebar__link-icon" />
            <span>Products</span>
          </NavLink>
          <NavLink to="/customers" className={navLinkClass} onClick={closeSidebar}>
            <IconCustomers size={18} className="sidebar__link-icon" />
            <span>Customers</span>
          </NavLink>
          <NavLink to="/orders" className={navLinkClass} onClick={closeSidebar}>
            <IconOrders size={18} className="sidebar__link-icon" />
            <span>Orders</span>
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__footer-tag">Technical Assessment</span>
          <span className="sidebar__footer-ver">v1.2.0</span>
        </div>
      </aside>

      {sidebarOpen && <div className="overlay" onClick={closeSidebar} />}

      <main className="main-content">
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* Helper to apply active class on NavLink */
function navLinkClass({ isActive }) {
  return `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`;
}

export default Layout;
