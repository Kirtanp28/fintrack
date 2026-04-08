import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiTrendingDown, FiTrendingUp, FiBarChart2,
  FiCpu, FiTarget, FiUser, FiLogOut, FiSun, FiMoon,
  FiMenu, FiX, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { path: '/expenses', icon: FiTrendingDown, label: 'Expenses' },
  { path: '/income', icon: FiTrendingUp, label: 'Income' },
  { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { path: '/ai-insights', icon: FiCpu, label: 'AI Insights' },
  { path: '/budget', icon: FiTarget, label: 'Budget' },
  { path: '/profile', icon: FiUser, label: 'Profile' },
];

export default function AppLayout() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49, backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh',
        width: 'var(--sidebar-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column',
        zIndex: 50, padding: '20px 16px',
        transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }}
      className={`${!sidebarOpen ? 'hidden md:flex' : 'flex'} flex-col`}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 20px', borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiDollarSign color="white" size={18} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>FinTrack</div>
            <div style={{ fontSize: 10, color: 'var(--accent-green)', fontWeight: 600, letterSpacing: '0.1em' }}>AI</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
            }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className="nav-item"
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', color: 'var(--accent-rose)' }}
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Topbar (mobile) */}
      <header style={{
        position: 'fixed', top: 0, right: 0, left: 0,
        height: 'var(--topbar-height)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', zIndex: 40,
      }}
      className="md:hidden"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiDollarSign color="white" size={15} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>FinTrack AI</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <FiMenu size={22} />
        </button>
      </header>

      {/* Topbar (desktop) */}
      <header style={{
        position: 'fixed', top: 0, right: 0,
        left: 'var(--sidebar-width)',
        height: 'var(--topbar-height)',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 28px', zIndex: 40,
      }}
      className="hidden md:flex"
      >
        <button onClick={toggleDarkMode} style={{
          background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
          borderRadius: 8, padding: '7px', cursor: 'pointer', color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center'
        }}>
          {darkMode ? <FiSun size={17} /> : <FiMoon size={17} />}
        </button>
      </header>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
