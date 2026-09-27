import { useState, useEffect } from 'react';
import { userDashboardApi, contactsApi, dealsApi, tasksApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, TrendingUp, CheckSquare, DollarSign,
  Clock, AlertCircle, Plus, ChevronRight, Target,
  Briefcase, Phone, Mail, ArrowUpRight, Star,
  CheckCircle2, Circle, MoreHorizontal, Flame,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import FollowUpWidget from '../components/FollowUpWidget';

const STAGE_COLORS = {
  'Lead': '#f59e0b',
  'Qualified': '#3b82f6',
  'Proposal': '#8b5cf6',
  'Negotiation': '#06b6d4',
  'Closed Won': '#10b981',
  'Closed Lost': '#ef4444',
};

const PRIORITY_COLORS = {
  'Urgent': '#ef4444',
  'High': '#f97316',
  'Medium': '#3b82f6',
  'Low': '#6b7280',
};

const PRIORITY_BG = {
  'Urgent': '#fef2f2',
  'High': '#fff7ed',
  'Medium': '#eff6ff',
  'Low': '#f9fafb',
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Quick-add state
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [quickForm, setQuickForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await userDashboardApi.get();
      setData(res.data);
    } catch (err) {
      console.error('User dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${Number(val).toLocaleString()}`;
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    const today = new Date();
    const diff = Math.round((date - today) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    return `In ${diff}d`;
  };

  const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString();

  const greetingMsg = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Quick-save handlers
  const handleQuickAddContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const [firstName, ...rest] = (quickForm.name || '').trim().split(' ');
      await contactsApi.create({
        firstName: firstName || 'Unknown',
        lastName: rest.join(' ') || 'Contact',
        email: quickForm.email || `contact${Date.now()}@placeholder.com`,
        phone: quickForm.phone || null,
        jobTitle: quickForm.jobTitle || null,
        status: 'Lead',
      });
      setShowAddContact(false);
      setQuickForm({});
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAddDeal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dealsApi.create({
        title: quickForm.title,
        value: parseFloat(quickForm.value) || 0,
        stage: 'Lead',
        priority: quickForm.priority || 'Medium',
        probability: 20,
      });
      setShowAddDeal(false);
      setQuickForm({});
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tasksApi.create({
        title: quickForm.taskTitle,
        priority: quickForm.taskPriority || 'Medium',
        dueDate: quickForm.taskDue || null,
        type: quickForm.taskType || 'Task',
        status: 'Todo',
      });
      setShowAddTask(false);
      setQuickForm({});
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksApi.update(taskId, { status: 'Completed' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const pieData = (data?.dealsByStage || []).map(d => ({
    name: d.stage, value: d.count, totalValue: d.totalValue,
  }));

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
        borderRadius: 20, padding: '2rem 2.5rem', marginBottom: '2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(59,130,246,0.3)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200,
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -60, width: 160, height: 160,
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginBottom: 4 }}>
            {greetingMsg()}, 👋
          </p>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px' }}>
            {user?.fullName}
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff',
              padding: '3px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600,
            }}>{user?.role}</span>
            {user?.department && (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                {user.department}
              </span>
            )}
          </div>
        </div>
        {/* Quick Stats in banner */}
        <div style={{ display: 'flex', gap: '1.5rem', zIndex: 1 }}>
          {[
            { label: 'Tasks Today', value: data?.tasksDueToday || 0, warn: data?.tasksDueToday > 0 },
            { label: 'Overdue', value: data?.overdueTasks || 0, warn: data?.overdueTasks > 0 },
            { label: 'Active Deals', value: data?.myActiveDeals || 0 },
          ].map(s => (
            <div key={s.label} style={{
              background: s.warn && s.value > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)', borderRadius: 14,
              padding: '1rem 1.5rem', textAlign: 'center', minWidth: 100,
              border: s.warn && s.value > 0 ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Action Buttons ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: '+ New Contact', action: () => { setShowAddContact(true); setShowAddDeal(false); setShowAddTask(false); setQuickForm({}); }, color: '#3b82f6', bg: '#eff6ff' },
          { label: '+ New Deal', action: () => { setShowAddDeal(true); setShowAddContact(false); setShowAddTask(false); setQuickForm({}); }, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: '+ New Task', action: () => { setShowAddTask(true); setShowAddContact(false); setShowAddDeal(false); setQuickForm({}); }, color: '#10b981', bg: '#f0fdf4' },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action} style={{
            background: btn.bg, color: btn.color, border: `1.5px solid ${btn.color}22`,
            borderRadius: 10, padding: '0.625rem 1.25rem', fontWeight: 700,
            fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = btn.color; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = btn.bg; e.currentTarget.style.color = btn.color; }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* ── Quick Add Forms ── */}
      {showAddContact && (
        <div style={formCardStyle}>
          <h3 style={formTitleStyle}><Users size={18} /> Quick Add Contact</h3>
          <form onSubmit={handleQuickAddContact} style={formGridStyle}>
            <input style={inputStyle} placeholder="Full Name *" required
              value={quickForm.name || ''} onChange={e => setQuickForm(p => ({ ...p, name: e.target.value }))} />
            <input style={inputStyle} placeholder="Email *" type="email" required
              value={quickForm.email || ''} onChange={e => setQuickForm(p => ({ ...p, email: e.target.value }))} />
            <input style={inputStyle} placeholder="Phone"
              value={quickForm.phone || ''} onChange={e => setQuickForm(p => ({ ...p, phone: e.target.value }))} />
            <input style={inputStyle} placeholder="Job Title"
              value={quickForm.jobTitle || ''} onChange={e => setQuickForm(p => ({ ...p, jobTitle: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
              <button type="submit" style={btnPrimaryStyle} disabled={saving}>{saving ? 'Saving…' : 'Add Contact'}</button>
              <button type="button" style={btnSecondaryStyle} onClick={() => setShowAddContact(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showAddDeal && (
        <div style={formCardStyle}>
          <h3 style={formTitleStyle}><TrendingUp size={18} /> Quick Add Deal</h3>
          <form onSubmit={handleQuickAddDeal} style={formGridStyle}>
            <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder="Deal Title *" required
              value={quickForm.title || ''} onChange={e => setQuickForm(p => ({ ...p, title: e.target.value }))} />
            <input style={inputStyle} placeholder="Value ($) *" type="number" required
              value={quickForm.value || ''} onChange={e => setQuickForm(p => ({ ...p, value: e.target.value }))} />
            <select style={inputStyle} value={quickForm.priority || 'Medium'}
              onChange={e => setQuickForm(p => ({ ...p, priority: e.target.value }))}>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent</option>
            </select>
            <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
              <button type="submit" style={btnPrimaryStyle} disabled={saving}>{saving ? 'Saving…' : 'Add Deal'}</button>
              <button type="button" style={btnSecondaryStyle} onClick={() => setShowAddDeal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showAddTask && (
        <div style={formCardStyle}>
          <h3 style={formTitleStyle}><CheckSquare size={18} /> Quick Add Task</h3>
          <form onSubmit={handleQuickAddTask} style={formGridStyle}>
            <input style={{ ...inputStyle, gridColumn: '1 / -1' }} placeholder="Task Title *" required
              value={quickForm.taskTitle || ''} onChange={e => setQuickForm(p => ({ ...p, taskTitle: e.target.value }))} />
            <select style={inputStyle} value={quickForm.taskType || 'Task'}
              onChange={e => setQuickForm(p => ({ ...p, taskType: e.target.value }))}>
              <option value="Task">Task</option>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
            </select>
            <select style={inputStyle} value={quickForm.taskPriority || 'Medium'}
              onChange={e => setQuickForm(p => ({ ...p, taskPriority: e.target.value }))}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
            <input style={inputStyle} type="date" placeholder="Due Date"
              value={quickForm.taskDue || ''} onChange={e => setQuickForm(p => ({ ...p, taskDue: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
              <button type="submit" style={btnPrimaryStyle} disabled={saving}>{saving ? 'Saving…' : 'Add Task'}</button>
              <button type="button" style={btnSecondaryStyle} onClick={() => setShowAddTask(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'My Contacts', value: data?.myContacts || 0, icon: <Users size={22} />, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'My Deals', value: data?.myDeals || 0, icon: <Briefcase size={22} />, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'My Revenue', value: formatCurrency(data?.myRevenue), icon: <DollarSign size={22} />, color: '#10b981', bg: '#f0fdf4', isCurrency: true },
          { label: 'Pipeline Value', value: formatCurrency(data?.myPipeline), icon: <Target size={22} />, color: '#f59e0b', bg: '#fffbeb', isCurrency: true },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
            padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{card.value}</p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid: Follow-Ups + Tasks + Deals + Chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Smart Follow-Up Nudge */}
        <FollowUpWidget />

        {/* My Tasks */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare size={18} color="#10b981" />
              </div>
              <div>
                <h3 style={cardTitleStyle}>My Tasks</h3>
                <p style={cardSubStyle}>{data?.myTasks?.length || 0} pending</p>
              </div>
            </div>
            <button onClick={() => setShowAddTask(true)} style={addBtnStyle}><Plus size={14} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data?.myTasks || []).length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <CheckCircle2 size={40} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>All caught up! No pending tasks.</p>
              </div>
            )}
            {(data?.myTasks || []).map(task => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '0.875rem',
                background: isOverdue(task.dueDate) ? '#fef2f2' : '#f8fafc',
                borderRadius: 12, border: `1px solid ${isOverdue(task.dueDate) ? '#fecaca' : '#e2e8f0'}`,
                transition: 'all 0.15s',
              }}>
                <button onClick={() => handleCompleteTask(task.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#10b981',
                  padding: 0, marginTop: 2, flexShrink: 0,
                }}>
                  <Circle size={18} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: PRIORITY_BG[task.priority] || '#f9fafb',
                      color: PRIORITY_COLORS[task.priority] || '#6b7280',
                    }}>{task.priority}</span>
                    {task.contactName && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>👤 {task.contactName}</span>}
                    {task.dueDate && (
                      <span style={{ fontSize: '0.7rem', color: isOverdue(task.dueDate) ? '#ef4444' : '#64748b', fontWeight: isOverdue(task.dueDate) ? 700 : 400 }}>
                        {isOverdue(task.dueDate) ? <AlertCircle size={10} style={{ display: 'inline' }} /> : <Clock size={10} style={{ display: 'inline' }} />}
                        {' '}{formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: 8,
                  background: task.type === 'Call' ? '#eff6ff' : task.type === 'Email' ? '#f5f3ff' : '#f8fafc',
                  color: task.type === 'Call' ? '#3b82f6' : task.type === 'Email' ? '#8b5cf6' : '#64748b',
                  fontWeight: 600, flexShrink: 0,
                }}>{task.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Top Deals */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} color="#8b5cf6" />
              </div>
              <div>
                <h3 style={cardTitleStyle}>My Top Deals</h3>
                <p style={cardSubStyle}>Ranked by value</p>
              </div>
            </div>
            <button onClick={() => setShowAddDeal(true)} style={addBtnStyle}><Plus size={14} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data?.topDeals || []).length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                <Briefcase size={40} style={{ marginBottom: 8, opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>No deals yet. Create your first!</p>
              </div>
            )}
            {(data?.topDeals || []).map((deal, i) => (
              <div key={deal.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem',
                background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i === 0 ? '#fef9c3' : '#f8fafc', color: i === 0 ? '#ca8a04' : '#94a3b8',
                  fontSize: '0.875rem', fontWeight: 800, flexShrink: 0,
                }}>
                  {i === 0 ? <Star size={16} /> : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {deal.title}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                    {deal.contactName || deal.companyName || 'No contact linked'}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{formatCurrency(deal.value)}</p>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                    background: STAGE_COLORS[deal.stage] + '20', color: STAGE_COLORS[deal.stage],
                  }}>{deal.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pipeline Chart + Recent Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>

        {/* Deal Stage Donut */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div>
              <h3 style={cardTitleStyle}>My Pipeline Breakdown</h3>
              <p style={cardSubStyle}>Deals by stage</p>
            </div>
          </div>
          {pieData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <Target size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ fontSize: '0.875rem' }}>No deals in pipeline yet</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={STAGE_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val + ' deals', name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#475569' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: STAGE_COLORS[d.name] || '#94a3b8' }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <div>
              <h3 style={cardTitleStyle}>Team Activity Feed</h3>
              <p style={cardSubStyle}>Latest across the team</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(data?.recentActivities || []).slice(0, 8).map((act, i) => (
              <div key={act.id} style={{
                display: 'flex', gap: 12, padding: '0.75rem 0',
                borderBottom: i < 7 ? '1px solid #f1f5f9' : 'none',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: act.type === 'Call' ? '#eff6ff' : act.type === 'Email' ? '#f5f3ff' : act.type === 'Meeting' ? '#f0fdf4' : '#fef9c3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem',
                }}>
                  {act.type === 'Call' ? '📞' : act.type === 'Email' ? '✉️' : act.type === 'Meeting' ? '🤝' : act.type === 'Created' ? '✨' : act.type === 'Note' ? '📝' : '🔄'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#0f172a', fontWeight: 500 }}>
                    {act.description}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                    by {act.userName} · {new Date(act.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared Styles ──
const cardStyle = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18,
  padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};
const cardHeaderStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem',
};
const cardTitleStyle = { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' };
const cardSubStyle = { margin: 0, fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 };
const addBtnStyle = {
  width: 32, height: 32, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
};
const formCardStyle = {
  background: '#fff', border: '1.5px solid #3b82f6', borderRadius: 16,
  padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(59,130,246,0.1)',
};
const formTitleStyle = {
  margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#1e40af',
  display: 'flex', alignItems: 'center', gap: 8,
};
const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const inputStyle = {
  padding: '0.625rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: 10,
  fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', outline: 'none',
};
const btnPrimaryStyle = {
  padding: '0.625rem 1.5rem', background: '#3b82f6', color: '#fff',
  border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
};
const btnSecondaryStyle = {
  padding: '0.625rem 1.5rem', background: '#f1f5f9', color: '#64748b',
  border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
};
