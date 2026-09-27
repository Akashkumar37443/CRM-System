import { useState, useEffect } from 'react';
import { dealsApi } from '../services/api';
import { AlertTriangle, TrendingDown, ExternalLink } from 'lucide-react';

const HEALTH_COLORS = {
  Critical: '#ef4444',
  'At Risk': '#f59e0b',
  Healthy: '#10b981',
};

const HEALTH_BG = {
  Critical: '#fee2e2',
  'At Risk': '#fef9c3',
  Healthy: '#dcfce7',
};

export default function DealsAtRiskPanel() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dealsApi.getHealthReport()
      .then(res => setDeals(res.data.filter(d => d.healthLabel !== 'Healthy').slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val) => val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : `$${val}`;

  if (loading) return (
    <div style={cardStyle}>
      <div className="spinner" style={{ margin: 'auto' }} />
    </div>
  );

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={18} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Deals at Risk
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              {deals.filter(d => d.healthLabel === 'Critical').length} critical · {deals.filter(d => d.healthLabel === 'At Risk').length} at risk
            </p>
          </div>
        </div>
      </div>

      {deals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
          <p style={{ fontSize: '0.875rem' }}>All deals are healthy!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {deals.map(deal => (
            <div key={deal.dealId} style={{
              padding: '0.75rem 1rem', borderRadius: 10,
              background: HEALTH_BG[deal.healthLabel] || '#f8fafc',
              border: `1px solid ${HEALTH_COLORS[deal.healthLabel] || '#e2e8f0'}22`,
              display: 'flex', alignItems: 'center', gap: '0.875rem',
            }}>
              {/* Score Badge */}
              <div style={{
                minWidth: 40, height: 40, borderRadius: 10,
                background: HEALTH_COLORS[deal.healthLabel] || '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0,
              }}>
                {deal.healthScore}
              </div>

              {/* Deal info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {deal.dealTitle}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                  {formatCurrency(deal.value)} · {deal.stage} · {deal.ownerName}
                </div>
                {deal.topRisk && (
                  <div style={{ fontSize: '0.7rem', color: HEALTH_COLORS[deal.healthLabel], marginTop: 2, fontWeight: 600 }}>
                    → {deal.topRisk}
                  </div>
                )}
              </div>

              {/* Label */}
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: HEALTH_COLORS[deal.healthLabel], color: '#fff', flexShrink: 0,
              }}>
                {deal.healthLabel}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18,
  padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};
