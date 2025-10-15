const API_BASE = '/api';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

// Leave Requests API
export const leaveRequestsApi = {
  getAll: () => fetch(`${API_BASE}/leave-requests`, { headers: getAuthHeaders() }),
  create: (data) => fetch(`${API_BASE}/leave-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  updateStatus: (id, status, rejectionReason) => fetch(`${API_BASE}/leave-requests/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, rejectionReason })
  }),
  getBalances: (year) => fetch(`${API_BASE}/leave-requests/balances?year=${year}`, { headers: getAuthHeaders() }),
  updateBalance: (employeeId, data) => fetch(`${API_BASE}/leave-requests/balances/${employeeId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
};

// Attendance API
export const attendanceApi = {
  getRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/attendance?${query}`, { headers: getAuthHeaders() });
  },
  clock: (employeeId, type) => fetch(`${API_BASE}/attendance/clock`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ employeeId, type })
  }),
  createRecord: (data) => fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  getSummary: (employeeId, month, year) => 
    fetch(`${API_BASE}/attendance/summary?employeeId=${employeeId}&month=${month}&year=${year}`, { headers: getAuthHeaders() })
};

// Payroll API
export const payrollApi = {
  getPeriods: () => fetch(`${API_BASE}/payroll/periods`, { headers: getAuthHeaders() }),
  createPeriod: (data) => fetch(`${API_BASE}/payroll/periods`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  getPayslips: (periodId) => fetch(`${API_BASE}/payroll/periods/${periodId}/payslips`, { headers: getAuthHeaders() }),
  generatePayslips: (periodId) => fetch(`${API_BASE}/payroll/periods/${periodId}/generate`, {
    method: 'POST',
    headers: getAuthHeaders()
  }),
  getEmployeePayslips: (employeeId) => fetch(`${API_BASE}/payroll/employee/${employeeId}`, { headers: getAuthHeaders() })
};

// Recruitment API
export const recruitmentApi = {
  getJobs: () => fetch(`${API_BASE}/recruitment/jobs`, { headers: getAuthHeaders() }),
  createJob: (data) => fetch(`${API_BASE}/recruitment/jobs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  updateJob: (id, data) => fetch(`${API_BASE}/recruitment/jobs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  getCandidates: () => fetch(`${API_BASE}/recruitment/candidates`, { headers: getAuthHeaders() }),
  createCandidate: (data) => fetch(`${API_BASE}/recruitment/candidates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/recruitment/applications?${query}`, { headers: getAuthHeaders() });
  },
  createApplication: (data) => fetch(`${API_BASE}/recruitment/applications`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  updateApplicationStatus: (id, status, notes) => fetch(`${API_BASE}/recruitment/applications/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, notes })
  })
};

// Training API
export const trainingApi = {
  getCourses: () => fetch(`${API_BASE}/training/courses`, { headers: getAuthHeaders() }),
  createCourse: (data) => fetch(`${API_BASE}/training/courses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  updateCourse: (id, data) => fetch(`${API_BASE}/training/courses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  getEnrollments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/training/enrollments?${query}`, { headers: getAuthHeaders() });
  },
  createEnrollment: (data) => fetch(`${API_BASE}/training/enrollments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  updateEnrollment: (id, data) => fetch(`${API_BASE}/training/enrollments/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  }),
  getStats: () => fetch(`${API_BASE}/training/stats`, { headers: getAuthHeaders() })
};