import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  FileText,
  Building2,
  CheckCircle2,
  CalendarCheck,
  Bell,
  History,
  ShieldCheck,
  Users,
  LogOut,
  Menu,
  X,
  FileSearch,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout, isAdmin, isOfficial, isInstitution } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll or fetch unread alert counts
  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await api.getUnreadAlertCount();
        if (res.success) {
          setUnreadCount(res.count);
        }
      } catch (e) {
        // quiet error on background poll
      }
    }
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // 30 sec poll
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Applications', path: '/applications', icon: FileText },
    { label: 'Institutions', path: '/institutions', icon: Building2 },
    { label: 'Compliance', path: '/compliance', icon: CheckCircle2 },
    { label: 'EVC Scheduling', path: '/evc', icon: CalendarCheck },
    { label: 'Alerts', path: '/alerts', icon: Bell, badge: unreadCount },
    { label: 'Workflow History', path: '/workflow-history', icon: History },
    { label: 'Document Assistant', path: '/document-check', icon: FileSearch },
    // Authorized modules
    ...((isAdmin || isOfficial) ? [{ label: 'Audit Trail', path: '/audit', icon: ShieldCheck }] : []),
    ...(isAdmin ? [{ label: 'User Management', path: '/users', icon: Users }] : [])
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-emblem">FP</div>
          <div className="brand-text">
            <h1>FlowPilot</h1>
            <p>Approval & Compliance</p>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge > 0 && <span className="badge-count">{item.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'background 0.15s'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#475569',
                padding: '4px'
              }}
              aria-label="Toggle Navigation"
            >
              <Menu size={22} />
            </button>

            <div className="prototype-tag">
              <span />
              <strong>FlowPilot</strong> &bull; Hackathon Prototype &bull; Non-Statutory Demonstration
            </div>
          </div>

          <div className="topbar-right">
            {/* Quick alert notification bell */}
            <NavLink
              to="/alerts"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: '#475569'
              }}
              title="View Alerts & Deadlines"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    border: '2px solid #ffffff'
                  }}
                />
              )}
            </NavLink>

            {/* User Profile */}
            <div className="user-profile-badge">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: user?.role === 'ADMIN' ? '#fef3c7' : user?.role === 'OFFICIAL' ? '#dbeafe' : '#e0e7ff',
                      color: user?.role === 'ADMIN' ? '#b45309' : user?.role === 'OFFICIAL' ? '#1d4ed8' : '#4338ca',
                      fontWeight: 700,
                      fontSize: '10px'
                    }}
                  >
                    {user?.role}
                  </span>
                  {user?.institution_code && <span>&bull; {user.institution_code}</span>}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
