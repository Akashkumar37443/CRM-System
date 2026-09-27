import { useState, useEffect } from 'react';
import { dealsApi, contactsApi, companiesApi } from '../services/api';
import { Plus, DollarSign, Calendar, User, X, TrendingUp } from 'lucide-react';

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const STAGE_COLORS = {
  'Lead': { bg: '#64748b20', border: '#64748b40', dot: '#64748b' },
  'Qualified': { bg: '#3b82f620', border: '#3b82f640', dot: '#3b82f6' },
  'Proposal': { bg: '#8b5cf620', border: '#8b5cf640', dot: '#8b5cf6' },
  'Negotiation': { bg: '#f59e0b20', border: '#f59e0b40', dot: '#f59e0b' },
  'Closed Won': { bg: '#10b98120', border: '#10b98140', dot: '#10b981' },
  'Closed Lost': { bg: '#ef444420', border: '#ef444440', dot: '#ef4444' },
};

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', value: '', stage: 'Lead', probability: 10,
    description: '', priority: 'Medium', expectedCloseDate: '',
    contactId: '', companyId: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dealsRes, contactsRes, companiesRes] = await Promise.all([
        dealsApi.getAll(), contactsApi.getAll(), companiesApi.getAll()
      ]);
      setDeals(dealsRes.data);
      setContacts(contactsRes.data);
      setCompanies(companiesRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      await dealsApi.update(dealId, { stage: newStage });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dealsApi.create({
        ...form,
        value: parseFloat(form.value),
        probability: parseInt(form.probability),
        contactId: form.contactId ? parseInt(form.contactId) : null,
        companyId: form.companyId ? parseInt(form.companyId) : null,
        expectedCloseDate: form.expectedCloseDate || null,
      });
      setShowModal(false);
      loadData();
    } catch (err) { console.error(err); }
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {});

  const totalByStage = (stage) => {
    return dealsByStage[stage].reduce((sum, d) => sum + d.value, 0);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Deals Pipeline</h2>
          <p>Track and manage your sales opportunities</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setForm({ title: '', value: '', stage: 'Lead', probability: 10, description: '', priority: 'Medium', expectedCloseDate: '', contactId: '', companyId: '' });
          setShowModal(true);
        }}>
          <Plus size={16} /> New Deal
        </button>
      </div>

      <div className="page-content">
        <div className="pipeline-container">
          {STAGES.map(stage => {
            const colors = STAGE_COLORS[stage];
            return (
              <div key={stage} className="pipeline-column">
                <div className="pipeline-column-header">
                  <div className="pipeline-column-title">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.dot, display: 'inline-block' }} />
                    {stage}
                    <span className="pipeline-count">{dealsByStage[stage].length}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.dot }}>
                    {formatCurrency(totalByStage(stage))}
                  </span>
                </div>
                <div className="pipeline-column-body">
                  {dealsByStage[stage].map(deal => (
                    <div key={deal.id} className="pipeline-card">
                      <div className="pipeline-card-title">{deal.title}</div>
                      <div className="pipeline-card-value">{formatCurrency(deal.value)}</div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${deal.priority === 'High' ? 'badge-danger' : deal.priority === 'Medium' ? 'badge-warning' : 'badge-default'}`} style={{ fontSize: '0.625rem' }}>
                          {deal.priority}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '0.625rem' }}>
                          {deal.probability}% likely
                        </span>
                      </div>
                      <div className="pipeline-card-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={11} /> {deal.ownerName || 'Unassigned'}
                        </div>
                        {deal.expectedCloseDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={11} /> {new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                      {deal.contactName && (
                        <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={10} /> {deal.contactName}
                          {deal.companyName && <span> • {deal.companyName}</span>}
                        </div>
                      )}
                      {stage !== 'Closed Won' && stage !== 'Closed Lost' && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                          {STAGES.filter(s => s !== stage && s !== 'Closed Lost').slice(0, 3).map(s => (
                            <button
                              key={s}
                              className="btn btn-sm btn-secondary"
                              style={{ fontSize: '0.5625rem', padding: '0.25rem 0.375rem' }}
                              onClick={() => handleStageChange(deal.id, s)}
                            >
                              → {s.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {dealsByStage[stage].length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: '#475569', fontSize: '0.75rem' }}>
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Deal</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Deal Title *</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Value ($) *</label>
                    <input type="number" className="form-input" value={form.value} onChange={(e) => setForm({...form, value: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Probability (%)</label>
                    <input type="number" min="0" max="100" className="form-input" value={form.probability} onChange={(e) => setForm({...form, probability: e.target.value})} />
                  </div>
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Stage</label>
                    <select className="form-input" value={form.stage} onChange={(e) => setForm({...form, stage: e.target.value})}>
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Contact</label>
                    <select className="form-input" value={form.contactId} onChange={(e) => setForm({...form, contactId: e.target.value})}>
                      <option value="">No contact</option>
                      {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <select className="form-input" value={form.companyId} onChange={(e) => setForm({...form, companyId: e.target.value})}>
                      <option value="">No company</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Close Date</label>
                  <input type="date" className="form-input" value={form.expectedCloseDate} onChange={(e) => setForm({...form, expectedCloseDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={2} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
