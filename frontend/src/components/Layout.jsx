import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, TrendingUp,
  CheckSquare, BarChart3, Settings, LogOut, Flame,
  Search, Bell, Calendar, ChevronDown, Globe
} from 'lucide-react';

const navItems = [
  { section: 'Main', items: [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { section: 'CRM', items: [
    { path: '/contacts', icon: Users, label: 'Contacts' },
    { path: '/companies', icon: Building2, label: 'Companies' },
    { path: '/deals', icon: TrendingUp, label: 'Deals' },
  ]},
  { section: 'Productivity', items: [
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
  ]},
  { section: 'System', items: [
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Flame size={20} />
          </div>
          <div>
            <h1>CRMS</h1>
            <span>Smart CRM Suite</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(section => (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-section-title">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(user?.fullName)}
          </div>
          <div className="sidebar-user-info" style={{ flex: 1 }}>
            <h4>{user?.fullName || 'Admin User'}</h4>
            <span>{user?.role || 'Administrator'}</span>
          </div>
          <button className="btn-icon" onClick={logout} title="Logout" style={{ border: 'none', background: 'transparent' }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="top-nav-left">
            <div className="top-nav-search">
              <Search />
              <input type="text" placeholder="Search in system..." />
            </div>
          </div>

          <div className="top-nav-right">
            {/* Team Avatars Online Stack */}
            <div className="team-avatars" title="Team members online">
              <div className="team-avatar" style={{ background: '#3b82f6' }}>ST</div>
              <div className="team-avatar" style={{ background: '#10b981' }}>MJ</div>
              <div className="team-avatar" style={{ background: '#f59e0b' }}>AK</div>
              <div className="team-avatar" style={{ background: '#8b5cf6' }}>EL</div>
            </div>

            {/* Language / Region */}
            <button className="nav-icon-btn" title="Global Region">
              <Globe size={18} />
            </button>

            {/* Calendar */}
            <button className="nav-icon-btn" title="Schedule">
              <Calendar size={18} />
            </button>

            {/* Notification Bell */}
            <button className="nav-icon-btn" title="Notifications">
              <Bell size={18} />
              <span className="nav-badge-dot" />
            </button>

            {/* User Profile Menu */}
            <div className="user-profile-menu" onClick={logout} title="Click to logout">
              <div className="avatar avatar-sm" style={{ background: '#ef4444' }}>
                {getInitials(user?.fullName)}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>{user?.fullName || 'Admin User'}</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{user?.role || 'Super Admin'}</div>
              </div>
              <ChevronDown size={14} color="#94a3b8" />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <Outlet />
      </main>
    </div>
  );
}
