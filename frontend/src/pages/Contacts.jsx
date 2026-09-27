import { useState, useEffect } from 'react';
import { contactsApi, companiesApi } from '../services/api';
import { Search, Plus, Mail, Phone, Building2, Edit2, Trash2, X, User } from 'lucide-react';

const STATUS_BADGES = {
  Active: 'badge-success',
  Inactive: 'badge-default',
  Lead: 'badge-info',
};

const AVATAR_COLORS = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    jobTitle: '', status: 'Active', companyId: '', notes: '',
    address: '', city: '', country: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        contactsApi.getAll(), companiesApi.getAll()
      ]);
      setContacts(contactsRes.data);
      setCompanies(companiesRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await contactsApi.getAll(search);
      setContacts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { if (search !== undefined) handleSearch(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreate = () => {
    setEditContact(null);
    setForm({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', status: 'Active', companyId: '', notes: '', address: '', city: '', country: '' });
    setShowModal(true);
  };

  const openEdit = (contact) => {
    setEditContact(contact);
    setForm({
      firstName: contact.firstName, lastName: contact.lastName,
      email: contact.email, phone: contact.phone || '',
      jobTitle: contact.jobTitle || '', status: contact.status,
      companyId: contact.companyId || '', notes: contact.notes || '',
      address: contact.address || '', city: contact.city || '',
      country: contact.country || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, companyId: form.companyId ? parseInt(form.companyId) : null };
      if (editContact) {
        await contactsApi.update(editContact.id, payload);
      } else {
        await contactsApi.create(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await contactsApi.delete(id);
      loadData();
    } catch (err) { console.error(err); }
  };

  const getColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Contacts</h2>
          <p>Manage your customer relationships</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-bar">
            <Search />
            <input
              className="form-input"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
            />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Status</th>
                <th>Owner</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ background: getColor(c.firstName + c.lastName) }}>
                        {c.firstName[0]}{c.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.firstName} {c.lastName}</div>
                        <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{c.jobTitle || 'No title'}</div>
                      </div>
                    </div>
                  </td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Mail size={13} style={{ color: '#64748b' }} />{c.email}</div></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Phone size={13} style={{ color: '#64748b' }} />{c.phone || '—'}</div></td>
                  <td>
                    {c.companyName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Building2 size={13} style={{ color: '#64748b' }} />{c.companyName}</div>
                    ) : <span style={{ color: '#475569' }}>—</span>}
                  </td>
                  <td><span className={`badge ${STATUS_BADGES[c.status] || 'badge-default'}`}>{c.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <div className="avatar avatar-sm" style={{ background: '#4f46e5' }}>{c.ownerName?.[0] || '?'}</div>
                      <span style={{ fontSize: '0.75rem' }}>{c.ownerName || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn-icon" onClick={() => openEdit(c)}><Edit2 size={14} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(c.id)} style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <User size={40} />
                      <h3>No contacts found</h3>
                      <p>Add your first contact to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editContact ? 'Edit Contact' : 'New Contact'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-input" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-input" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="form-input" value={form.jobTitle} onChange={(e) => setForm({...form, jobTitle: e.target.value})} />
                  </div>
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <select className="form-input" value={form.companyId} onChange={(e) => setForm({...form, companyId: e.target.value})}>
                      <option value="">No company</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-input" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-input" rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editContact ? 'Save Changes' : 'Create Contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
