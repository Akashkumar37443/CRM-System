import { useState } from 'react';
import { whatsappApi } from '../services/api';
import { MessageCircle, CheckCircle, X, Check, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

const OUTCOMES = [
  { value: 'Positive', label: 'Positive', icon: CheckCircle, color: '#10b981' },
  { value: 'Neutral', label: 'Neutral', icon: HelpCircle, color: '#64748b' },
  { value: 'Objection', label: 'Objection', icon: AlertCircle, color: '#f59e0b' },
  { value: 'NoResponse', label: 'No Response', icon: XCircle, color: '#ef4444' }
];

const TEMPLATES = [
  { id: 1, icon: '📞', label: 'Follow-up call', template: 'Follow-up call with {name}. Discussed next steps.' },
  { id: 2, icon: '💰', label: 'Sent pricing', template: 'Sent pricing/proposal to {name} on WhatsApp.' },
  { id: 3, icon: '📅', label: 'Demo scheduled', template: 'Scheduled product demo with {name}.' },
  { id: 4, icon: '⚠️', label: 'Objection raised', template: 'Client raised objection: [add details]. Plan to address next call.' },
  { id: 5, icon: '✅', label: 'Contract discussion', template: 'Discussed contract terms with {name}. Positive response.' },
  { id: 6, icon: '🔇', label: 'No response', template: 'Sent follow-up message to {name}. No response yet.' },
];

export default function WhatsAppLogModal({ isOpen, onClose, contactId, dealId, contactName, onSaved }) {
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState('Positive');
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleTemplateClick = (t) => {
    let txt = t.template.replace('{name}', contactName || 'client');
    setSummary(txt);
    if (t.label === 'No response') setOutcome('NoResponse');
    if (t.label === 'Objection raised') setOutcome('Objection');
    if (t.label === 'Contract discussion') setOutcome('Positive');
  };

  const handleSave = async () => {
    if (!summary.trim()) return;
    setSaving(true);
    try {
      await whatsappApi.log({
        summary,
        outcome,
        contactId,
        dealId,
        occurredAt: date ? new Date(date).toISOString() : new Date().toISOString()
      });
      setSummary('');
      setOutcome('Positive');
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to log whatsapp', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#f0fdf4'
        }}>
          <h2 style={{
            margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#166534',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <MessageCircle size={20} color="#22c55e" />
            Log WhatsApp Chat
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'
          }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Templates */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>
              Quick Templates
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => handleTemplateClick(t)} style={{
                  padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', color: '#334155',
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>
              Conversation Summary <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="What was discussed?"
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '0.75rem',
                border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.875rem',
                resize: 'vertical', fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Outcome */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                Outcome
              </label>
              <select value={outcome} onChange={e => setOutcome(e.target.value)} style={{
                width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1',
                borderRadius: 8, fontSize: '0.875rem'
              }}>
                {OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                Date
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{
                width: '100%', boxSizing: 'border-box', padding: '0.625rem',
                border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.875rem'
              }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#f8fafc'
        }}>
          <button onClick={onClose} style={{
            padding: '0.625rem 1.25rem', background: '#fff', border: '1px solid #cbd5e1',
            borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#475569'
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !summary.trim()} style={{
            padding: '0.625rem 1.25rem', background: '#22c55e', border: 'none',
            borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#fff',
            display: 'flex', alignItems: 'center', gap: 6, opacity: (saving || !summary.trim()) ? 0.6 : 1
          }}>
            {saving ? 'Saving...' : <><Check size={16} /> Log Conversation</>}
          </button>
        </div>
      </div>
    </div>
  );
}
