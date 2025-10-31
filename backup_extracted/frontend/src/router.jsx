import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Categories from './pages/admin/Categories'
import Competencies from './pages/admin/Competencies'
import EmployeesAdmin from './pages/admin/Employees'
import Departments from './pages/admin/Departments'
import PositionsAdmin from './pages/admin/Positions'
import SelectOrganization from './pages/SelectOrganization'
import RequireOrganization from './pages/RequireOrganization'
import RequireAuth from './pages/RequireAuth'
import Employees from './pages/Employees'
import EmployeeProfile from './pages/EmployeeProfile'
import Positions from './pages/Positions'
import Observations from './pages/Observations'
import Interviews from './pages/Interviews'
import JobAnalyses from './pages/JobAnalyses'
import DevelopmentPlans from './pages/DevelopmentPlans'
import Analytics from './pages/Analytics'
import LeaveRequests from './pages/LeaveRequests'
import Attendance from './pages/Attendance'
import Payroll from './pages/Payroll'
import Recruitment from './pages/Recruitment'
import Training from './pages/Training'

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/select-organization" replace />} />

      {/* Organización: pública para seleccionar/crear */}
      <Route path="/select-organization" element={<SelectOrganization />} />

      {/* Auth públicas pero requieren org seleccionada para conocer el tenant */}
      <Route
        path="/login"
        element={
          <RequireOrganization>
            <Login />
          </RequireOrganization>
        }
      />
      <Route
        path="/register"
        element={
          <RequireOrganization>
            <Register />
          </RequireOrganization>
        }
      />

      {/* Rutas protegidas: requieren org + token */}
      <Route
        path="/dashboard"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/employees"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Employees />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <RequireOrganization>
            <RequireAuth>
              <EmployeeProfile />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/positions"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Positions />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/observations"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Observations />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/interviews"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Interviews />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/job-analyses"
        element={
          <RequireOrganization>
            <RequireAuth>
              <JobAnalyses />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/development-plans"
        element={
          <RequireOrganization>
            <RequireAuth>
              <DevelopmentPlans />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/analytics"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Analytics />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Categories />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/admin/competencies"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Competencies />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Employees />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Departments />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/admin/positions"
        element={
          <RequireOrganization>
            <RequireAuth>
              <PositionsAdmin />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/leave-requests"
        element={
          <RequireOrganization>
            <RequireAuth>
              <LeaveRequests />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/attendance"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Attendance />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/payroll"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Payroll />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/recruitment"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Recruitment />
            </RequireAuth>
          </RequireOrganization>
        }
      />
      <Route
        path="/training"
        element={
          <RequireOrganization>
            <RequireAuth>
              <Training />
            </RequireAuth>
          </RequireOrganization>
        }
      />
    </Routes>
  )
}
