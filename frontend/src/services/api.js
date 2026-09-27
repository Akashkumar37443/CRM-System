import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Contacts
export const contactsApi = {
  getAll: (search) => api.get('/contacts', { params: { search } }),
  getById: (id) => api.get(`/contacts/${id}`),
  getByCompany: (companyId) => api.get(`/contacts/company/${companyId}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

// Companies
export const companiesApi = {
  getAll: (search) => api.get('/companies', { params: { search } }),
  getById: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  update: (id, data) => api.put(`/companies/${id}`, data),
  delete: (id) => api.delete(`/companies/${id}`),
};

// Deals
export const dealsApi = {
  getAll: (stage) => api.get('/deals', { params: { stage } }),
  getById: (id) => api.get(`/deals/${id}`),
  create: (data) => api.post('/deals', data),
  update: (id, data) => api.put(`/deals/${id}`, data),
  delete: (id) => api.delete(`/deals/${id}`),
};

// Tasks
export const tasksApi = {
  getAll: () => api.get('/tasks'),
  getById: (id) => api.get(`/tasks/${id}`),
  getOverdue: () => api.get('/tasks/overdue'),
  getToday: () => api.get('/tasks/today'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Dashboard (Admin)
export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

// User Dashboard (Employee-scoped)
export const userDashboardApi = {
  get: () => api.get('/user-dashboard'),
};

// Follow-Up (Smart Nudge)
export const followUpApi = {
  getToday: () => api.get('/followup/today'),
};

// Activities
export const activitiesApi = {
  getRecent: (count = 20) => api.get('/activities', { params: { count } }),
  getByEntity: (entityType, entityId) => api.get(`/activities/${entityType}/${entityId}`),
};

// Users (Admin management)
export const usersApi = {
  getAll: () => api.get('/users'),
  getMe: () => api.get('/users/me'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  updateStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
