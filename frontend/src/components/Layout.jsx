import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  LayoutDashboard, Users, Building2, TrendingUp,
  CheckSquare, BarChart3, Settings, LogOut, Flame,
  Search, Bell, Calendar, ChevronDown, Globe,
  ShieldCheck, UserCog, Eye, EyeOff, Lock, AlertCircle
} from 'lucide-react';

// Role-aware nav: admins and managers see everything; users see a focused view
const getNavItems = (role) => {
  const isAdmin = role === 'Admin';
  const isManager = role === 'Admin' || role === 'Manager';

  return [
    {
      section: 'My Workspace',
      items: [
        { path: '/', icon: LayoutDashboard, label: role === 'Admin' ? 'Admin Dashboard' : role === 'Manager' ? 'Manager Dashboard' : 'My Dashboard' },
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
  const { user, logout, checkAuth } = useAuth();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Force password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = getNavItems(user?.role || 'User');

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleColor = user?.role === 'Admin' ? '#ef4444' : user?.role === 'Manager' ? '#3b82f6' : '#10b981';
  const roleBg = user?.role === 'Admin' ? 'rgba(239,68,68,0.15)' : user?.role === 'Manager' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      await checkAuth(); // refresh user state
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  if (user?.requiresPasswordChange) {
    return (
      <div className="login-container">
        <div className="login-card" style={{ maxWidth: '450px' }}>
          <div className="login-logo">
            <div className="login-logo-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}><ShieldCheck size={24} /></div>
            <h1>Security First</h1>
          </div>
          <div className="login-title">
            <h2>Change Your Password</h2>
            <p>For your security, please change your temporary password before accessing your account.</p>
          </div>
          {pwdError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.8125rem' }}>
              <AlertCircle size={16} /> {pwdError}
            </div>
          )}
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Temporary Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input type={showCurrent ? "text" : "password"} className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input type={showNew ? "text" : "password"} className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={pwdLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {pwdLoading ? 'Updating...' : 'Change Password & Continue'}
            </button>
            <button type="button" onClick={logout} style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}>
              Logout
            </button>
          </form>
        </div>
      </div>
    );
  }

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

            <div className="user-profile-menu" onClick={() => setShowMenu(!showMenu)} ref={menuRef} style={{ position: 'relative' }}>
              <div className="avatar avatar-sm" style={{ background: roleColor }}>
                {getInitials(user?.fullName)}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>{user?.fullName || 'User'}</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{user?.role}</div>
              </div>
              <ChevronDown size={14} color="#94a3b8" />
              
              {showMenu && (
                <div className="profile-dropdown-menu" style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                  background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0', minWidth: '220px', zIndex: 100, overflow: 'hidden'
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{user?.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.email}</div>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <Link to="/settings" className="dropdown-item" onClick={() => setShowMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', color: '#334155', textDecoration: 'none', borderRadius: '6px', fontSize: '0.875rem' }}>
                      <UserCog size={16} color="#64748b" /> Profile & Settings
                    </Link>
                    <Link to="/tasks" className="dropdown-item" onClick={() => setShowMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', color: '#334155', textDecoration: 'none', borderRadius: '6px', fontSize: '0.875rem' }}>
                      <CheckSquare size={16} color="#64748b" /> My Tasks
                    </Link>
                  </div>
                  <div style={{ padding: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <button onClick={logout} className="dropdown-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', color: '#ef4444', textDecoration: 'none', borderRadius: '6px', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <Outlet />
      </main>
    </div>
  );
}
