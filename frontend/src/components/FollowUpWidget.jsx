import { useState, useEffect } from 'react';
import { followUpApi } from '../services/api';
import { Flame, Clock, AlertTriangle, Phone, Mail, CheckCircle, RefreshCcw } from 'lucide-react';

export default function FollowUpWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await followUpApi.getToday();
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return <div style={cardStyle}><div className="spinner" style={{ margin: 'auto' }} /></div>;
  }

  const formatCurrency = (val) => val >= 1000 ? `$${(val / 1000).toFixed(1)}K` : `$${val}`;

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={18} color="#ef4444" />
          </div>
          <div>
            <h3 style={cardTitleStyle}>Today's Priority Follow-Ups</h3>
            <p style={cardSubStyle}>Smart recommendations</p>
          </div>
        </div>
        <button onClick={loadData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <RefreshCcw size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            <CheckCircle size={40} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
            <p>You're all caught up on follow-ups!</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.contactId} style={{
              border: `1px solid ${item.priority === 'High' ? '#fecaca' : item.priority === 'Medium' ? '#fde68a' : '#e2e8f0'}`,
              borderRadius: 12, padding: '1rem',
              background: item.priority === 'High' ? '#fef2f2' : item.priority === 'Medium' ? '#fffbeb' : '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {item.contactName}
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#475569' }}>
                    {item.jobTitle || ''} {item.companyName ? `• ${item.companyName}` : ''}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', borderRadius: 8,
                  background: item.priority === 'High' ? '#ef4444' : item.priority === 'Medium' ? '#f59e0b' : '#3b82f6',
                  color: '#fff'
                }}>
                  {item.priority} Priority
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.875rem' }}>
                {item.activeDealId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                    <span style={{ opacity: 0.7 }}>💼</span> {formatCurrency(item.activeDealValue)} {item.activeDealStage}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                  <Clock size={12} /> {item.daysSinceContact} days since contact
                </div>
                {item.hasOverdueTask && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                    <AlertTriangle size={12} /> Overdue task: {item.overdueTaskTitle}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button style={{
                  flex: 1, padding: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6,
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                  <Phone size={14} /> Call
                </button>
                <button style={{
                  flex: 1, padding: '0.5rem', background: '#fff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: 6,
                  fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                  <Mail size={14} /> Email
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18,
  padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};
const cardHeaderStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
};
const cardTitleStyle = {
  margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a',
};
const cardSubStyle = {
  margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b',
};
