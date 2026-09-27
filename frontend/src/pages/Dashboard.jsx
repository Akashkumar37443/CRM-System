import { useState, useEffect } from 'react';
import { dashboardApi, dealsApi } from '../services/api';
import {
  Users, Building2, TrendingUp, DollarSign,
  Briefcase, ArrowUpRight, ArrowDownRight,
  Filter, MoreHorizontal, ChevronRight, CheckCircle2,
  Clock, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const STAGE_COLORS = {
  'Lead': '#f59e0b',
  'Qualified': '#3b82f6',
  'Proposal': '#8b5cf6',
  'Negotiation': '#06b6d4',
  'Closed Won': '#10b981',
  'Closed Lost': '#ef4444',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState('Monthly');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [dashRes, dealsRes] = await Promise.all([
        dashboardApi.get(),
        dealsApi.getAll()
      ]);
      setData(dashRes.data);
      setDeals(dealsRes.data || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${Number(val).toLocaleString()}`;
  };

  if (loading) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }

  // Monthly revenue analytics mock or dynamic data
  const revenueChartData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 72000 },
    { month: 'Mar', revenue: 175000 },
    { month: 'Apr', revenue: 200000 },
    { month: 'May', revenue: 140000 },
    { month: 'Jun', revenue: 110000 },
    { month: 'Jul', revenue: 65000 },
    { month: 'Aug', revenue: 195000 },
    { month: 'Sep', revenue: 95000 },
    { month: 'Oct', revenue: 80000 },
    { month: 'Nov', revenue: 125000 },
    { month: 'Dec', revenue: 155000 },
  ];

  // Stage distribution data for donut
  const pieData = data?.dealsByStage?.map(d => ({
    name: d.stage,
    value: d.count,
    totalValue: d.totalValue,
  })) || [
    { name: 'Lead', value: 4, totalValue: 65000 },
    { name: 'Qualified', value: 3, totalValue: 125000 },
    { name: 'Proposal', value: 2, totalValue: 240000 },
    { name: 'Negotiation', value: 2, totalValue: 180000 },
    { name: 'Closed Won', value: 3, totalValue: 375000 },
  ];

  const totalDealsCount = pieData.reduce((acc, curr) => acc + curr.value, 0);

  // Top Deals sorted by value
  const topDeals = [...deals]
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 5);

  // Recent Deals
  const recentDeals = [...deals].slice(0, 5);

  const getStageBadgeClass = (stage) => {
    switch (stage) {
      case 'Closed Won': return 'badge-success';
      case 'Closed Lost': return 'badge-danger';
      case 'Proposal': return 'badge-purple';
      case 'Qualified': return 'badge-info';
      default: return 'badge-warning';
    }
  };

  const getStatusBadge = (stage) => {
    if (stage === 'Closed Won') {
      return <span className="badge badge-success">Won</span>;
    }
    if (stage === 'Closed Lost') {
      return <span className="badge badge-danger">Lost</span>;
    }
    return <span className="badge badge-info">In Progress</span>;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's an overview of your sales performance and pipeline.</p>
        </div>
      </div>

      <div className="page-content">
        {/* ROW 1: Revenue Analytics & Deals by Stage */}
        <div className="charts-grid-top">
          {/* Revenue Analytics */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Revenue Analytics</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                    {formatCurrency(data?.totalRevenue || 954000)}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    <ArrowUpRight size={14} /> +18.4% vs last period
                  </span>
                </div>
              </div>

              {/* Time toggles */}
              <div className="chart-pills">
                {['Monthly', 'Weekly', 'Yearly'].map(period => (
                  <button
                    key={period}
                    className={`chart-pill ${revenuePeriod === period ? 'active' : ''}`}
                    onClick={() => setRevenuePeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '0.8125rem'
                  }}
                  formatter={(v) => [formatCurrency(v), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Deals by Stage Donut */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Deals by Stage</h3>
              <button className="btn-icon" style={{ padding: '0.25rem 0.5rem', border: 'none' }}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div style={{ position: 'relative', height: 170 }}>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={STAGE_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '0.75rem'
                    }}
                    formatter={(val, name, props) => [`${val} deals (${formatCurrency(props.payload.totalValue)})`, props.payload.name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Total */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                textAlign: 'center', pointerEvents: 'none'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{totalDealsCount}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Total Deals</div>
              </div>
            </div>

            {/* Stage legend breakdown */}
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {pieData.slice(0, 4).map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: STAGE_COLORS[d.name] || '#64748b' }} />
                    <span style={{ color: '#475569', fontWeight: 500 }}>{d.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{d.value}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.6875rem' }}>{formatCurrency(d.totalValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 2: 4 KPI Stat Cards */}
        <div className="stats-grid">
          {/* Card 1: Revenue */}
          <div className="stat-card red">
            <div className="stat-card-left">
              <span className="stat-card-label">Revenue</span>
              <span className="stat-card-value">{formatCurrency(data?.totalRevenue || 375000)}</span>
              <span className="stat-card-change up">
                <ArrowUpRight size={14} /> +12% from last week
              </span>
            </div>
            <div className="stat-card-icon-circle">
              <DollarSign size={22} />
            </div>
          </div>

          {/* Card 2: Active Leads */}
          <div className="stat-card blue">
            <div className="stat-card-left">
              <span className="stat-card-label">Active Leads</span>
              <span className="stat-card-value">{data?.totalContacts || 147}</span>
              <span className="stat-card-change down">
                <ArrowDownRight size={14} /> -5% from last week
              </span>
            </div>
            <div className="stat-card-icon-circle">
              <Users size={22} />
            </div>
          </div>

          {/* Card 3: Conversion Rate */}
          <div className="stat-card purple">
            <div className="stat-card-left">
              <span className="stat-card-label">Conversion Rate</span>
              <span className="stat-card-value">68.8%</span>
              <span className="stat-card-change up">
                <ArrowUpRight size={14} /> +3.2% vs target
              </span>
            </div>
            <div className="stat-card-icon-circle">
              <TrendingUp size={22} />
            </div>
          </div>

          {/* Card 4: Total Deals */}
          <div className="stat-card green">
            <div className="stat-card-left">
              <span className="stat-card-label">Deals in Pipeline</span>
              <span className="stat-card-value">{data?.activeDeals || 10}</span>
              <span className="stat-card-change up">
                <ArrowUpRight size={14} /> +8% from last week
              </span>
            </div>
            <div className="stat-card-icon-circle">
              <Briefcase size={22} />
            </div>
          </div>
        </div>

        {/* ROW 3: Top Deals | Pipeline Distribution | Deals Overview */}
        <div className="dashboard-tri-grid">
          {/* 1. Top Deals */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Top Deals</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>Sort by: Value</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {topDeals.map((deal, idx) => (
                <div key={deal.id || idx} className="top-deal-item">
                  <div className="top-deal-info">
                    <div className="top-deal-logo">
                      {deal.title ? deal.title.slice(0, 2).toUpperCase() : 'DL'}
                    </div>
                    <div>
                      <div className="top-deal-title">{deal.title}</div>
                      <div className="top-deal-company">{deal.companyName || 'Enterprise Client'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="top-deal-val">{formatCurrency(deal.value)}</div>
                    <span className={`badge ${getStageBadgeClass(deal.stage)}`} style={{ fontSize: '0.625rem' }}>
                      {deal.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Pipeline Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Pipeline Stages</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Weekly Trend</span>
            </div>

            <div className="pipeline-stage-boxes">
              <div className="pipeline-stage-box lead">
                <h5>Lead</h5>
                <span>147</span>
              </div>
              <div className="pipeline-stage-box qualified">
                <h5>Qualified</h5>
                <span>86</span>
              </div>
              <div className="pipeline-stage-box proposal">
                <h5>Proposal</h5>
                <span>52</span>
              </div>
              <div className="pipeline-stage-box won">
                <h5>Won</h5>
                <span>38</span>
              </div>
            </div>

            {/* Sparkline mini bars */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <span>Pipeline Health: <strong>88%</strong></span>
                <span style={{ color: '#10b981' }}>+4.5%</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', height: 24, alignItems: 'flex-end' }}>
                {[30, 45, 60, 50, 75, 90, 85, 95, 70, 80, 100, 85].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: '#ef4444', borderRadius: 2 }} />
                ))}
              </div>
            </div>
          </div>

          {/* 3. Deals Overview & Target */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Deals Overview</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Q4 Target</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>2,650</span>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Target Deals</span>
            </div>

            {/* Multi-segmented target progress bar */}
            <div className="target-progress-bar">
              <div className="target-seg-won" style={{ width: '45%' }} title="Won (45%)" />
              <div className="target-seg-lead" style={{ width: '25%' }} title="Qualified (25%)" />
              <div className="target-seg-proposal" style={{ width: '18%' }} title="Proposal (18%)" />
              <div className="target-seg-other" style={{ width: '12%' }} title="Other (12%)" />
            </div>

            {/* Breakdown stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: '#64748b' }}>Won Deals</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>840</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: '#64748b' }}>Lost Deals</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>120</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: '#64748b' }}>Open Deals</span>
                <span style={{ fontWeight: 700, color: '#3b82f6' }}>420</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: '#64748b' }}>Current Pipeline</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(data?.pipelineValue || 1000000)}</span>
              </div>
            </div>

            {/* Team Assigned */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Team</span>
              <div className="team-avatars">
                <div className="team-avatar" style={{ background: '#3b82f6', width: 26, height: 26 }}>ST</div>
                <div className="team-avatar" style={{ background: '#10b981', width: 26, height: 26 }}>MJ</div>
                <div className="team-avatar" style={{ background: '#f59e0b', width: 26, height: 26 }}>AK</div>
                <div className="team-avatar" style={{ background: '#8b5cf6', width: 26, height: 26 }}>+4</div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: Recent Deals Table */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eaecf0' }}>
            <h3 className="card-title">Recent Deals</h3>
            <button className="btn btn-secondary btn-sm">View All Deals</button>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Deal Name</th>
                  <th>Stage</th>
                  <th>Deal Value</th>
                  <th>Type</th>
                  <th>Owner</th>
                  <th>Probability</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal, idx) => (
                  <tr key={deal.id || idx}>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>
                      {deal.title}
                    </td>
                    <td>
                      <span className={`badge ${getStageBadgeClass(deal.stage)}`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {formatCurrency(deal.value)}
                    </td>
                    <td>
                      <span className="badge badge-default" style={{ fontSize: '0.6875rem' }}>
                        {idx % 2 === 0 ? 'New' : 'Renewal'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="avatar avatar-sm" style={{ background: '#ef4444' }}>
                          {deal.ownerName ? deal.ownerName.slice(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <span>{deal.ownerName || 'Admin User'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 100 }}>
                        <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${deal.probability || 60}%`,
                              height: '100%',
                              background: (deal.probability || 60) >= 70 ? '#10b981' : (deal.probability || 60) >= 40 ? '#3b82f6' : '#ef4444',
                              borderRadius: 3
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                          {deal.probability || 60}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(deal.stage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
