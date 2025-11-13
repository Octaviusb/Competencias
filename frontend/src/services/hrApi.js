import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://competency-manager.fly.dev';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'X-Organization-Id': localStorage.getItem('organizationId'),
  'Content-Type': 'application/json'
});

export const hrApi = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

hrApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const orgId = localStorage.getItem('organizationId');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (orgId) config.headers['X-Organization-Id'] = orgId;
  return config;
});

// Leave Requests API
export const leaveRequestsApi = {
  getAll: () => hrApi.get('/leave-requests'),
  create: (data) => hrApi.post('/leave-requests', data),
  updateStatus: (id, status, rejectionReason) => hrApi.patch(`/leave-requests/${id}/status`, { status, rejectionReason }),
  getBalances: (year) => hrApi.get(`/leave-requests/balances?year=${year}`),
  updateBalance: (employeeId, data) => hrApi.put(`/leave-requests/balances/${employeeId}`, data)
};

// Attendance API
export const attendanceApi = {
  getRecords: (params = {}) => hrApi.get('/attendance', { params }),
  clock: (employeeId, type) => hrApi.post('/attendance/clock', { employeeId, type }),
  createRecord: (data) => hrApi.post('/attendance', data),
  getSummary: (employeeId, month, year) => hrApi.get(`/attendance/summary?employeeId=${employeeId}&month=${month}&year=${year}`)
};

// Payroll API
export const payrollApi = {
  getPeriods: () => hrApi.get('/payroll/periods'),
  createPeriod: (data) => hrApi.post('/payroll/periods', data),
  getPayslips: (periodId) => hrApi.get(`/payroll/periods/${periodId}/payslips`),
  generatePayslips: (periodId) => hrApi.post(`/payroll/periods/${periodId}/generate`),
  getEmployeePayslips: (employeeId) => hrApi.get(`/payroll/employee/${employeeId}`)
};

// Recruitment API
export const recruitmentApi = {
  getJobs: () => hrApi.get('/recruitment/jobs'),
  createJob: (data) => hrApi.post('/recruitment/jobs', data),
  updateJob: (id, data) => hrApi.put(`/recruitment/jobs/${id}`, data),
  getCandidates: () => hrApi.get('/recruitment/candidates'),
  createCandidate: (data) => hrApi.post('/recruitment/candidates', data),
  getApplications: (params = {}) => hrApi.get('/recruitment/applications', { params }),
  createApplication: (data) => hrApi.post('/recruitment/applications', data),
  updateApplicationStatus: (id, status, notes) => hrApi.patch(`/recruitment/applications/${id}/status`, { status, notes })
};

// Training API
export const trainingApi = {
  getCourses: () => hrApi.get('/training/courses'),
  createCourse: (data) => hrApi.post('/training/courses', data),
  updateCourse: (id, data) => hrApi.put(`/training/courses/${id}`, data),
  getEnrollments: (params = {}) => hrApi.get('/training/enrollments', { params }),
  createEnrollment: (data) => hrApi.post('/training/enrollments', data),
  updateEnrollment: (id, data) => hrApi.patch(`/training/enrollments/${id}`, data),
  getStats: () => hrApi.get('/training/stats')
};