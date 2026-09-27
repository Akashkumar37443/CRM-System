import { useState, useEffect } from 'react';
import { companiesApi } from '../services/api';
import { Search, Plus, Globe, Phone, Mail, Users, TrendingUp, Edit2, Trash2, X, Building2 } from 'lucide-react';

const SIZE_BADGES = {
  '1-10': 'badge-default',
  '11-50': 'badge-info',
  '51-200': 'badge-purple',
  '201-500': 'badge-warning',
  '500+': 'badge-success',
};

const INDUSTRY_COLORS = {
  Technology: '#6366f1', Manufacturing: '#f59e0b', Healthcare: '#10b981',
  Energy: '#14b8a6', Finance: '#3b82f6', Education: '#8b5cf6',
  Retail: '#ec4899', 'Real Estate': '#f97316',
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [form, setForm] = useState({
    name: '', industry: '', website: '', phone: '', email: '',
    address: '', city: '', country: '', size: '', annualRevenue: '', description: ''
  });

  useEffect(() => { loadCompanies(); }, []);

  const loadCompanies = async () => {
    try {
      const res = await companiesApi.getAll(search || undefined);
      setCompanies(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadCompanies(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreate = () => {
    setEditCompany(null);
    setForm({ name: '', industry: '', website: '', phone: '', email: '', address: '', city: '', country: '', size: '', annualRevenue: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (company) => {
    setEditCompany(company);
    setForm({
      name: company.name, industry: company.industry || '', website: company.website || '',
      phone: company.phone || '', email: company.email || '', address: company.address || '',
      city: company.city || '', country: company.country || '', size: company.size || '',
      annualRevenue: company.annualRevenue || '', description: company.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, annualRevenue: form.annualRevenue ? parseFloat(form.annualRevenue) : null };
      if (editCompany) await companiesApi.update(editCompany.id, payload);
      else await companiesApi.create(payload);
      setShowModal(false);
      loadCompanies();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this company?')) return;
    try { await companiesApi.delete(id); loadCompanies(); } catch (err) { console.error(err); }
  };

  const formatRevenue = (val) => {
    if (!val) return '—';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Companies</h2>
          <p>Manage your business accounts</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-bar">
            <Search />
            <input className="form-input" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 240 }} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Company</button>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {companies.map((c) => (
            <div key={c.id} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className="avatar avatar-lg" style={{ background: INDUSTRY_COLORS[c.industry] || '#64748b', borderRadius: '10px' }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#e2e8f0' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.industry || 'No industry'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn-icon" onClick={() => openEdit(c)}><Edit2 size={13} /></button>
                  <button className="btn-icon" onClick={() => handleDelete(c.id)} style={{ color: '#ef4444' }}><Trash2 size={13} /></button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#94a3b8' }}>
                  <Users size={13} /> {c.contactCount} contacts
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#94a3b8' }}>
                  <TrendingUp size={13} /> {c.dealCount} deals
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#94a3b8' }}>
                  <Globe size={13} /> {c.website ? new URL(c.website).hostname : '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#94a3b8' }}>
                  <TrendingUp size={13} /> {formatRevenue(c.annualRevenue)}
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {c.size && <span className={`badge ${SIZE_BADGES[c.size] || 'badge-default'}`}>{c.size} employees</span>}
                {c.city && <span className="badge badge-default">{c.city}, {c.country}</span>}
              </div>
            </div>
          ))}
          {companies.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state">
                <Building2 size={40} />
                <h3>No companies found</h3>
                <p>Add your first company to start tracking accounts</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editCompany ? 'Edit Company' : 'New Company'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <select className="form-input" value={form.industry} onChange={(e) => setForm({...form, industry: e.target.value})}>
                      <option value="">Select industry</option>
                      {['Technology','Manufacturing','Healthcare','Energy','Finance','Education','Retail','Real Estate'].map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Size</label>
                    <select className="form-input" value={form.size} onChange={(e) => setForm({...form, size: e.target.value})}>
                      <option value="">Select size</option>
                      {['1-10','11-50','51-200','201-500','500+'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input className="form-input" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} placeholder="https://" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Annual Revenue</label>
                    <input type="number" className="form-input" value={form.annualRevenue} onChange={(e) => setForm({...form, annualRevenue: e.target.value})} />
                  </div>
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editCompany ? 'Save Changes' : 'Create Company'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
