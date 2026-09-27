import { useState, useEffect } from 'react';
import { usersApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, ShieldCheck, UserCog, UserX, UserCheck,
  Plus, Search, MoreHorizontal, Trash2, Crown,
  Activity, Mail, Phone, Building2, AlertTriangle,
} from 'lucide-react';

const ROLE_COLORS = {
  Admin: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  Manager: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  User: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
};

const DEPT_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ fullName: '', email: '', password: '', phone: '', role: 'User' });
  const [saving, setSaving] = useState(false);
  const [actionMenu, setActionMenu] = useState(null); // userId with open menu
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadUsers();
    // Close action menus on outside click
    const handler = () => setActionMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const loadUsers = async () => {
    try {
      const res = await usersApi.getAll();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Register via auth endpoint, then update role if not 'User'
      const res = await authApi.register({
        fullName: inviteForm.fullName,
        email: inviteForm.email,
        password: inviteForm.password,
        phone: inviteForm.phone || null,
      });
      // If role is not User, update role
      if (inviteForm.role !== 'User' && res.data?.user?.id) {
        await usersApi.updateRole(res.data.user.id, inviteForm.role);
      }
      setShowInvite(false);
      setInviteForm({ fullName: '', email: '', password: '', phone: '', role: 'User' });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersApi.updateRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
    }
    setActionMenu(null);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await usersApi.updateStatus(userId, !currentStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      console.error(err);
    }
    setActionMenu(null);
  };

  const handleDelete = async (userId) => {
    try {
      await usersApi.delete(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete user');
    }
    setConfirmDelete(null);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.department?.toLowerCase().includes(q);
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'Admin').length,
    managers: users.filter(u => u.role === 'Manager').length,
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldCheck size={28} color="#3b82f6" /> Team Management
          </h1>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Manage employees, assign roles, and control access
          </p>
        </div>
        <button onClick={() => setShowInvite(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: '#fff', border: 'none', borderRadius: 12,
          padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.9rem',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
        }}>
          <Plus size={18} /> Add Team Member
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Members', value: stats.total, icon: <Users size={20} />, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Active Now', value: stats.active, icon: <Activity size={20} />, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Admins', value: stats.admins, icon: <Crown size={20} />, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Managers', value: stats.managers, icon: <ShieldCheck size={20} />, color: '#1d4ed8', bg: '#eff6ff' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
            padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{stat.value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div style={{
          background: '#fff', border: '1.5px solid #3b82f6', borderRadius: 18,
          padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(59,130,246,0.12)',
        }}>
          <h3 style={{ margin: '0 0 1.25rem', color: '#1e40af', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCog size={20} /> Add New Team Member
          </h3>
          <form onSubmit={handleInvite} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <input style={inputStyle} placeholder="Full Name *" required
              value={inviteForm.fullName} onChange={e => setInviteForm(p => ({ ...p, fullName: e.target.value }))} />
            <input style={inputStyle} placeholder="Email *" type="email" required
              value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} />
            <input style={inputStyle} placeholder="Password *" type="password" required minLength={6}
              value={inviteForm.password} onChange={e => setInviteForm(p => ({ ...p, password: e.target.value }))} />
            <input style={inputStyle} placeholder="Phone"
              value={inviteForm.phone} onChange={e => setInviteForm(p => ({ ...p, phone: e.target.value }))} />
            <select style={inputStyle} value={inviteForm.role}
              onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}>
              <option value="User">User (Sales Rep)</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="submit" style={{
                flex: 1, padding: '0.625rem', background: '#3b82f6', color: '#fff',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
              }} disabled={saving}>{saving ? 'Creating…' : 'Create Account'}</button>
              <button type="button" style={{
                padding: '0.625rem 1rem', background: '#f1f5f9', color: '#64748b',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
              }} onClick={() => setShowInvite(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            style={{ ...inputStyle, paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
            placeholder="Search by name, email, department…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        {['All', 'Admin', 'Manager', 'User'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} style={{
            padding: '0.5rem 1.25rem', border: '1.5px solid', borderRadius: 10,
            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.15s',
            background: roleFilter === r ? '#3b82f6' : '#fff',
            color: roleFilter === r ? '#fff' : '#64748b',
            borderColor: roleFilter === r ? '#3b82f6' : '#e2e8f0',
          }}>{r}</button>
        ))}
      </div>

      {/* User Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Team Member', 'Contact', 'Department', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '1rem 1.25rem', textAlign: 'left',
                    fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1px solid #e2e8f0',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, idx) => {
                const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.User;
                const avatarColor = DEPT_COLORS[u.id % DEPT_COLORS.length];
                const isMe = u.id === currentUser?.id;

                return (
                  <tr key={u.id} style={{
                    borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                    opacity: u.isActive ? 1 : 0.55,
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Name + Avatar */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12, background: avatarColor,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0,
                        }}>{getInitials(u.fullName)}</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                            {u.fullName} {isMe && <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>(you)</span>}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {u.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} /> {u.phone}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}><Mail size={12} /> {u.email}</div>
                      </div>
                    </td>

                    {/* Department */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Building2 size={13} /> {u.department || '—'}
                      </span>
                    </td>

                    {/* Role Badge */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
                        background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`,
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                      }}>
                        {u.role === 'Admin' ? <Crown size={11} /> : u.role === 'Manager' ? <ShieldCheck size={11} /> : <Users size={11} />}
                        {u.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
                        background: u.isActive ? '#f0fdf4' : '#f8fafc',
                        color: u.isActive ? '#15803d' : '#94a3b8',
                        border: `1px solid ${u.isActive ? '#bbf7d0' : '#e2e8f0'}`,
                      }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: u.isActive ? '#10b981' : '#94a3b8' }} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.25rem', position: 'relative' }}>
                      {!isMe && (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button onClick={e => { e.stopPropagation(); setActionMenu(actionMenu === u.id ? null : u.id); }} style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                            padding: '6px 10px', cursor: 'pointer', color: '#64748b',
                            display: 'flex', alignItems: 'center',
                          }}>
                            <MoreHorizontal size={16} />
                          </button>

                          {actionMenu === u.id && (
                            <div onClick={e => e.stopPropagation()} style={{
                              position: 'absolute', right: 0, top: '110%', zIndex: 100,
                              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 200, overflow: 'hidden',
                            }}>
                              <div style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', padding: '0.25rem 0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change Role</p>
                                {['User', 'Manager', 'Admin'].filter(r => r !== u.role).map(role => (
                                  <button key={role} onClick={() => handleRoleChange(u.id, role)} style={menuItemStyle}>
                                    {role === 'Admin' ? <Crown size={14} /> : role === 'Manager' ? <ShieldCheck size={14} /> : <Users size={14} />}
                                    Make {role}
                                  </button>
                                ))}
                              </div>
                              <div style={{ padding: '0.5rem' }}>
                                <button onClick={() => handleToggleStatus(u.id, u.isActive)} style={menuItemStyle}>
                                  {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                  {u.isActive ? 'Deactivate' : 'Activate'} Account
                                </button>
                                <button onClick={() => { setConfirmDelete(u); setActionMenu(null); }} style={{ ...menuItemStyle, color: '#ef4444' }}>
                                  <Trash2 size={14} /> Delete User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {isMe && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ margin: 0 }}>No team members match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setConfirmDelete(null)}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '2rem', maxWidth: 420, width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={28} color="#ef4444" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontWeight: 800 }}>Delete {confirmDelete.fullName}?</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
              This will permanently remove the account. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{
                padding: '0.625rem 1.75rem', background: '#ef4444', color: '#fff',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
              }}>Yes, Delete</button>
              <button onClick={() => setConfirmDelete(null)} style={{
                padding: '0.625rem 1.75rem', background: '#f1f5f9', color: '#64748b',
                border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: '0.625rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: 10,
  fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 9, width: '100%',
  padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', fontWeight: 600, color: '#374151', borderRadius: 8, textAlign: 'left',
};
