import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      <button
        className="hamburger"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h1 className="sidebar__title">Inventory & Orders</h1>
        </div>
        <nav className="sidebar__nav">
          <NavLink to="/" end className={navLinkClass} onClick={closeSidebar}>
            Dashboard
          </NavLink>
          <NavLink to="/products" className={navLinkClass} onClick={closeSidebar}>
            Products
          </NavLink>
          <NavLink to="/customers" className={navLinkClass} onClick={closeSidebar}>
            Customers
          </NavLink>
          <NavLink to="/orders" className={navLinkClass} onClick={closeSidebar}>
            Orders
          </NavLink>
        </nav>
      </aside>

      {sidebarOpen && <div className="overlay" onClick={closeSidebar} />}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

/* Helper to apply active class on NavLink */
function navLinkClass({ isActive }) {
  return `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`;
}

export default Layout;
