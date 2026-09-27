import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Bell, Palette, Save, Check } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || '',
  });

  const [notifications, setNotifications] = useState({
    emailDeals: true,
    emailTasks: true,
    emailContacts: false,
    pushDeals: true,
    pushTasks: true,
    pushContacts: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none',
        background: checked ? '#6366f1' : '#334155',
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Manage your account and preferences</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="page-content">
        <div className="tabs">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'security', label: 'Security', icon: Shield },
            { key: 'appearance', label: 'Appearance', icon: Palette },
          ].map(t => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <t.icon size={14} /> {t.label}
              </span>
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>Profile Information</h3>
              <p>Update your account details and personal information</p>
            </div>
            <div className="settings-section-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="avatar avatar-lg" style={{
                  width: 80, height: 80, fontSize: '1.5rem',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                }}>
                  {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e2e8f0' }}>{user?.fullName}</h4>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>{user?.email}</p>
                  <span className="badge badge-info" style={{ marginTop: '0.375rem' }}>{user?.role}</span>
                </div>
              </div>

              <div className="settings-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                </div>
              </div>
              <div className="settings-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={profile.department} onChange={(e) => setProfile({...profile, department: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>Notification Preferences</h3>
              <p>Choose how you want to be notified</p>
            </div>
            <div className="settings-section-body">
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '1rem' }}>Email Notifications</h4>
              {[
                { key: 'emailDeals', label: 'Deal updates', desc: 'When deals change stage or are closed' },
                { key: 'emailTasks', label: 'Task reminders', desc: 'Due date reminders and assignments' },
                { key: 'emailContacts', label: 'New contacts', desc: 'When new contacts are added' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid #1e293b' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#e2e8f0' }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
                  </div>
                  <Toggle checked={notifications[item.key]} onChange={(val) => setNotifications({...notifications, [item.key]: val})} />
                </div>
              ))}

              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', margin: '1.5rem 0 1rem' }}>Push Notifications</h4>
              {[
                { key: 'pushDeals', label: 'Deal alerts', desc: 'Real-time deal stage changes' },
                { key: 'pushTasks', label: 'Task alerts', desc: 'When tasks are assigned to you' },
                { key: 'pushContacts', label: 'Contact activity', desc: 'When contacts interact with emails' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 0', borderBottom: '1px solid #1e293b' }}>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#e2e8f0' }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
                  </div>
                  <Toggle checked={notifications[item.key]} onChange={(val) => setNotifications({...notifications, [item.key]: val})} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>Security Settings</h3>
              <p>Manage your password and security preferences</p>
            </div>
            <div className="settings-section-body">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" placeholder="Enter current password" />
              </div>
              <div className="settings-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="Enter new password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" placeholder="Confirm new password" />
                </div>
              </div>
              <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(10px)' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>Two-Factor Authentication</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>Add an extra layer of security to your account</p>
                <button className="btn btn-secondary">Enable 2FA</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'appearance' && (
          <div className="settings-section">
            <div className="settings-section-header">
              <h3>Appearance</h3>
              <p>Customize the look and feel of your CRM</p>
            </div>
            <div className="settings-section-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>Theme Mode</label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Glassmorphism', bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.6) 0%, rgba(168, 85, 247, 0.5) 50%, rgba(56, 189, 248, 0.4) 100%)', selected: true },
                    { label: 'Deep Dark', bg: '#0b1120', selected: false },
                    { label: 'Light Glass', bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', selected: false },
                  ].map(theme => (
                    <div key={theme.label} style={{
                      padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                      border: `2px solid ${theme.selected ? 'rgba(168, 85, 247, 0.7)' : 'rgba(255, 255, 255, 0.12)'}`,
                      background: theme.selected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      textAlign: 'center', minWidth: 120,
                      boxShadow: theme.selected ? '0 8px 24px rgba(99, 102, 241, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{
                        width: 52, height: 34, borderRadius: 8, margin: '0 auto 0.5rem',
                        background: theme.bg, border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                      }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.selected ? '#ffffff' : '#94a3b8' }}>
                        {theme.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Accent Color</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'].map(color => (
                    <button
                      key={color}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', background: color,
                        border: color === '#6366f1' ? '3px solid white' : '2px solid transparent',
                        cursor: 'pointer', transition: 'transform 0.2s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
