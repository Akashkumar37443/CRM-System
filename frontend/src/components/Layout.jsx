import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, TrendingUp,
  CheckSquare, BarChart3, Settings, LogOut, Flame,
  Search, Bell, Calendar, ChevronDown, Globe,
  ShieldCheck, UserCog,
} from 'lucide-react';

// Role-aware nav: admins and managers see everything; users see a focused view
const getNavItems = (role) => {
  const isAdmin = role === 'Admin';
  const isManager = role === 'Admin' || role === 'Manager';

  return [
    {
      section: 'My Workspace',
      items: [
        { path: '/', icon: LayoutDashboard, label: role === 'Admin' || role === 'Manager' ? 'Admin Dashboard' : 'My Dashboard' },
      ],
    },
    {
      section: 'CRM',
      items: [
        { path: '/contacts', icon: Users, label: 'Contacts' },
        { path: '/companies', icon: Building2, label: 'Companies' },
        { path: '/deals', icon: TrendingUp, label: 'Deals' },
      ],
    },
    {
      section: 'Productivity',
      items: [
        { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
        ...(isManager ? [{ path: '/reports', icon: BarChart3, label: 'Reports' }] : []),
      ],
    },
    ...(isAdmin
      ? [{
          section: 'Administration',
          items: [
            { path: '/admin/team', icon: UserCog, label: 'Team Management' },
            { path: '/settings', icon: Settings, label: 'Settings' },
          ],
        }]
      : [{ section: 'System', items: [{ path: '/settings', icon: Settings, label: 'Settings' }] }]
    ),
  ];
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = getNavItems(user?.role || 'User');

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleColor = user?.role === 'Admin' ? '#ef4444' : user?.role === 'Manager' ? '#3b82f6' : '#10b981';
  const roleBg = user?.role === 'Admin' ? 'rgba(239,68,68,0.15)' : user?.role === 'Manager' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)';

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

        {/* Role Badge in sidebar */}
        <div style={{
          margin: '0 1rem 1rem', padding: '8px 12px', borderRadius: 10,
          background: roleBg, border: `1px solid ${roleColor}30`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {user?.role === 'Admin' ? <ShieldCheck size={14} color={roleColor} /> : <Users size={14} color={roleColor} />}
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: roleColor }}>
            {user?.role} Account
          </span>
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
          <div className="sidebar-avatar" style={{ background: roleColor }}>
            {getInitials(user?.fullName)}
          </div>
          <div className="sidebar-user-info" style={{ flex: 1 }}>
            <h4>{user?.fullName || 'User'}</h4>
            <span>{user?.department || user?.role || 'Staff'}</span>
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
            <div className="team-avatars" title="Team members">
              <div className="team-avatar" style={{ background: '#3b82f6' }}>ST</div>
              <div className="team-avatar" style={{ background: '#10b981' }}>MJ</div>
              <div className="team-avatar" style={{ background: '#f59e0b' }}>AK</div>
              <div className="team-avatar" style={{ background: '#8b5cf6' }}>EL</div>
            </div>

            <button className="nav-icon-btn" title="Global Region">
              <Globe size={18} />
            </button>
            <button className="nav-icon-btn" title="Schedule">
              <Calendar size={18} />
            </button>
            <button className="nav-icon-btn" title="Notifications">
              <Bell size={18} />
              <span className="nav-badge-dot" />
            </button>

            <div className="user-profile-menu" onClick={logout} title="Click to logout">
              <div className="avatar avatar-sm" style={{ background: roleColor }}>
                {getInitials(user?.fullName)}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>{user?.fullName || 'User'}</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{user?.role}</div>
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
