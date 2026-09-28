import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';
import Contacts from './pages/Contacts';
import Companies from './pages/Companies';
import Deals from './pages/Deals';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

// Only Admins can access this route
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'Admin') return <Navigate to="/" />;
  return children;
}

// Smart home page: Admin/Manager → full Dashboard, User → UserDashboard
function HomePage() {
  const { user } = useAuth();
  if (user?.role === 'Admin' || user?.role === 'Manager') {
    return <Dashboard />;
  }
  return <UserDashboard />;
}

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('crm_theme') || 'light';
    document.body.classList.remove('theme-dark', 'theme-glass');
    if (theme === 'dark') document.body.classList.add('theme-dark');
    if (theme === 'glass') document.body.classList.add('theme-glass');
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Smart home — role-based */}
            <Route index element={<HomePage />} />

            {/* CRM Modules — all roles */}
            <Route path="contacts" element={<Contacts />} />
            <Route path="companies" element={<Companies />} />
            <Route path="deals" element={<Deals />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="settings" element={<Settings />} />

            {/* Manager + Admin only */}
            <Route path="reports" element={<Reports />} />

            {/* Admin only */}
            <Route path="admin/team" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
