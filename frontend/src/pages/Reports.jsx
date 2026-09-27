import { useState, useEffect } from 'react';
import { dashboardApi, dealsApi } from '../services/api';
import { BarChart3, TrendingUp, DollarSign, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [dashRes, dealsRes] = await Promise.all([
        dashboardApi.get(), dealsApi.getAll()
      ]);
      setDashboard(dashRes.data);
      setDeals(dealsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatCurrency = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!dashboard) return null;

  // Data for charts
  const stageData = dashboard.dealsByStage?.map(d => ({
    stage: d.stage, count: d.count, value: d.totalValue
  })) || [];

  const priorityData = ['Low', 'Medium', 'High'].map(p => ({
    priority: p,
    count: deals.filter(d => d.priority === p).length,
    value: deals.filter(d => d.priority === p).reduce((sum, d) => sum + d.value, 0)
  }));

  const ownerData = Object.entries(
    deals.reduce((acc, d) => {
      const owner = d.ownerName || 'Unassigned';
      if (!acc[owner]) acc[owner] = { deals: 0, value: 0, won: 0 };
      acc[owner].deals++;
      acc[owner].value += d.value;
      if (d.stage === 'Closed Won') acc[owner].won++;
      return acc;
    }, {})
  ).map(([name, data]) => ({ name, ...data, winRate: data.deals > 0 ? Math.round((data.won / data.deals) * 100) : 0 }));

  const conversionData = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'].map(stage => ({
    stage,
    count: deals.filter(d => {
      const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];
      return stages.indexOf(d.stage) >= stages.indexOf(stage);
    }).length
  }));

  const tooltipStyle = {
    contentStyle: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      fontSize: '0.75rem',
      color: '#0f172a'
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Reports</h2>
          <p>Analytics and performance insights</p>
        </div>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div className="tabs">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'pipeline', label: 'Pipeline Analysis', icon: TrendingUp },
            { key: 'performance', label: 'Team Performance', icon: Target },
          ].map(t => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <t.icon size={14} /> {t.label}
              </span>
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            {/* KPI Summary */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-card-icon"><DollarSign size={20} /></div>
                <div className="stat-card-label">Total Revenue</div>
                <div className="stat-card-value">{formatCurrency(dashboard.totalRevenue)}</div>
              </div>
              <div className="stat-card green">
                <div className="stat-card-icon"><TrendingUp size={20} /></div>
                <div className="stat-card-label">Pipeline Value</div>
                <div className="stat-card-value">{formatCurrency(dashboard.pipelineValue)}</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-card-icon"><Target size={20} /></div>
                <div className="stat-card-label">Win Rate</div>
                <div className="stat-card-value">
                  {deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'Closed Won').length / deals.length) * 100) : 0}%
                </div>
              </div>
              <div className="stat-card orange">
                <div className="stat-card-icon"><BarChart3 size={20} /></div>
                <div className="stat-card-label">Avg Deal Size</div>
                <div className="stat-card-value">{deals.length > 0 ? formatCurrency(deals.reduce((s, d) => s + d.value, 0) / deals.length) : '$0'}</div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="chart-card" style={{ marginBottom: '1rem' }}>
              <div className="chart-title">Revenue Trend</div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboard.revenueByMonth || []}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickFormatter={v => formatCurrency(v)} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [formatCurrency(v), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {tab === 'pipeline' && (
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">Deal Value by Stage</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickFormatter={v => formatCurrency(v)} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [formatCurrency(v), 'Value']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Conversion Funnel</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} width={90} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Deals by Priority</div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" outerRadius={100} dataKey="count" label={({ priority, count }) => `${priority}: ${count}`}>
                    {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Deal Count by Stage</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === 'performance' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Total Deals</th>
                  <th>Pipeline Value</th>
                  <th>Deals Won</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {ownerData.map((o, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{ background: COLORS[i % COLORS.length] }}>{o.name[0]}</div>
                        <span style={{ fontWeight: 600 }}>{o.name}</span>
                      </div>
                    </td>
                    <td>{o.deals}</td>
                    <td style={{ fontWeight: 600, color: '#6366f1' }}>{formatCurrency(o.value)}</td>
                    <td>{o.won}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 80, height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${o.winRate}%`, height: '100%', background: o.winRate >= 50 ? '#10b981' : o.winRate >= 25 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width 0.5s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: o.winRate >= 50 ? '#10b981' : o.winRate >= 25 ? '#f59e0b' : '#ef4444' }}>
                          {o.winRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
