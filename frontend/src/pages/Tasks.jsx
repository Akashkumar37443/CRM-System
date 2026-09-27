import { useState, useEffect } from 'react';
import { tasksApi } from '../services/api';
import { Plus, Check, Calendar, AlertTriangle, Clock, X, Filter, CheckSquare } from 'lucide-react';

const PRIORITY_BADGES = { Urgent: 'badge-danger', High: 'badge-warning', Medium: 'badge-info', Low: 'badge-default' };
const TYPE_BADGES = { Task: 'badge-default', Call: 'badge-success', Email: 'badge-info', Meeting: 'badge-purple' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'Medium',
    status: 'Todo', type: 'Task', dueDate: ''
  });

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const res = await tasksApi.getAll();
      setTasks(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleComplete = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
    try {
      await tasksApi.update(task.id, { status: newStatus });
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await tasksApi.create({ ...form, dueDate: form.dueDate || null });
      setShowModal(false);
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await tasksApi.delete(id); loadTasks(); } catch (err) { console.error(err); }
  };

  const filtered = tasks.filter(t => {
    if (filter === 'active') return t.status !== 'Completed' && t.status !== 'Cancelled';
    if (filter === 'completed') return t.status === 'Completed';
    if (filter === 'overdue') return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed';
    return true;
  });

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const counts = {
    all: tasks.length,
    active: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => isOverdue(t)).length,
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Tasks</h2>
          <p>Manage your to-dos and assignments</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setForm({ title: '', description: '', priority: 'Medium', status: 'Todo', type: 'Task', dueDate: '' });
          setShowModal(true);
        }}>
          <Plus size={16} /> New Task
        </button>
      </div>

      <div className="page-content">
        {/* Filters */}
        <div className="tabs">
          {[
            { key: 'all', label: 'All Tasks' },
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' },
            { key: 'overdue', label: 'Overdue' },
          ].map(f => (
            <button
              key={f.key}
              className={`tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="table-container">
          {filtered.map(task => (
            <div key={task.id} className="task-item">
              <button
                className={`task-checkbox ${task.status === 'Completed' ? 'completed' : ''}`}
                onClick={() => toggleComplete(task)}
              >
                {task.status === 'Completed' && <Check size={12} color="white" />}
              </button>

              <div className="task-info">
                <div className={`task-title ${task.status === 'Completed' ? 'completed' : ''}`}>
                  {task.title}
                </div>
                <div className="task-meta">
                  <span className={`badge ${PRIORITY_BADGES[task.priority]}`}>{task.priority}</span>
                  <span className={`badge ${TYPE_BADGES[task.type]}`}>{task.type}</span>
                  {task.dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isOverdue(task) ? '#ef4444' : '#64748b' }}>
                      {isOverdue(task) ? <AlertTriangle size={11} /> : <Calendar size={11} />}
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  {task.assigneeName && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span className="avatar avatar-sm" style={{ background: '#4f46e5', width: 18, height: 18, fontSize: '0.5625rem' }}>
                        {task.assigneeName[0]}
                      </span>
                      {task.assigneeName}
                    </span>
                  )}
                </div>
              </div>

              {task.dealTitle && (
                <span className="badge badge-purple" style={{ fontSize: '0.625rem' }}>
                  {task.dealTitle}
                </span>
              )}

              <button className="btn-icon" onClick={() => handleDelete(task.id)} style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                <X size={14} />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <CheckSquare size={40} />
              <h3>No tasks found</h3>
              <p>{filter === 'overdue' ? 'No overdue tasks — great job!' : 'Create a task to get started'}</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Task</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                      <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                      <option>Task</option><option>Call</option><option>Email</option><option>Meeting</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-input" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
