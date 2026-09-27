import { useState } from 'react';

const HEALTH_CONFIG = {
  Healthy: { color: '#10b981', bg: '#dcfce7', border: '#bbf7d0', dot: '🟢' },
  'At Risk': { color: '#f59e0b', bg: '#fef9c3', border: '#fde68a', dot: '🟡' },
  Critical: { color: '#ef4444', bg: '#fee2e2', border: '#fecaca', dot: '🔴' },
};

export default function DealHealthBadge({ score, label, topRisk, daysSinceActivity, overdueTaskCount }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cfg = HEALTH_CONFIG[label] || HEALTH_CONFIG['At Risk'];

  if (score == null) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '2px 7px', borderRadius: 6,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          fontSize: '0.625rem', fontWeight: 700, color: cfg.color,
          cursor: 'default', userSelect: 'none',
        }}
      >
        <span>{cfg.dot}</span>
        {score}
      </div>

      {showTooltip && (
        <div style={{
          position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#e2e8f0', borderRadius: 10,
          padding: '0.75rem 1rem', width: 220, zIndex: 9999,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          fontSize: '0.75rem', lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 800, marginBottom: '0.5rem', color: cfg.color, fontSize: '0.8rem' }}>
            Deal Health: {score}/100 — {label}
          </div>
          <div style={{ borderTop: '1px solid #334155', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>⏱ {daysSinceActivity ?? '?'} days since last activity</div>
            {overdueTaskCount > 0 && (
              <div style={{ color: '#fca5a5' }}>⚠️ {overdueTaskCount} overdue task{overdueTaskCount > 1 ? 's' : ''}</div>
            )}
            {topRisk && (
              <div style={{ color: cfg.color, marginTop: 4, fontWeight: 600 }}>
                Top risk: {topRisk}
              </div>
            )}
          </div>
          {/* Tooltip arrow */}
          <div style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            width: 12, height: 12, background: '#1e293b', borderRadius: 2,
            transform: 'translateX(-50%) rotate(45deg)', bottom: -5, left: '50%', position: 'absolute',
          }} />
        </div>
      )}
    </div>
  );
}
