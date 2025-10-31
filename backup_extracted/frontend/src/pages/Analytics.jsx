import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Spin,
  Alert
} from 'antd'
import {
  BarChartOutlined,
  TeamOutlined,
  EyeOutlined,
  PhoneOutlined,
  TrophyOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons'
import api from '../services/api'

const { Title } = Typography

export default function Analytics() {
  // Queries for analytics data
  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data,
  })

  const { data: observations, isLoading: loadingObservations } = useQuery({
    queryKey: ['observations'],
    queryFn: async () => (await api.get('/observations')).data,
  })

  const { data: interviews, isLoading: loadingInterviews } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => (await api.get('/interviews')).data,
  })

  const { data: developmentPlans, isLoading: loadingPlans } = useQuery({
    queryKey: ['development-plans-analytics'],
    queryFn: async () => {
      const orgId = localStorage.getItem('organizationId')
      return (await api.get('/development-plans', { params: { organizationId: orgId } })).data
    },
  })

  const { data: jobAnalyses, isLoading: loadingAnalyses } = useQuery({
    queryKey: ['job-analyses'],
    queryFn: async () => (await api.get('/job-analyses')).data,
  })

  const isLoading = loadingEmployees || loadingObservations || loadingInterviews || loadingPlans || loadingAnalyses

  // Calculate statistics
  const stats = {
    employees: employees?.length || 0,
    observations: observations?.length || 0,
    interviews: interviews?.length || 0,
    developmentPlans: developmentPlans?.length || 0,
    jobAnalyses: jobAnalyses?.length || 0,
  }

  // Department distribution
  const departmentStats = employees?.reduce((acc, emp) => {
    const dept = emp.department?.name || 'Sin Departamento'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {}) || {}

  const departmentData = Object.entries(departmentStats).map(([name, count]) => ({
    department: name,
    employees: count,
    percentage: ((count / stats.employees) * 100).toFixed(1)
  }))

  // Status distributions
  const interviewStatusStats = interviews?.reduce((acc, interview) => {
    acc[interview.status] = (acc[interview.status] || 0) + 1
    return acc
  }, {}) || {}

  const planStatusStats = developmentPlans?.reduce((acc, plan) => {
    acc[plan.status] = (acc[plan.status] || 0) + 1
    return acc
  }, {}) || {}

  const departmentColumns = [
    {
      title: 'Departamento',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Empleados',
      dataIndex: 'employees',
      key: 'employees',
    },
    {
      title: 'Porcentaje',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => `${percentage}%`,
    },
  ]

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <BarChartOutlined style={{ marginRight: 8 }} />
        Analítica y Reportes
      </Title>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Empleados"
              value={stats.employees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Observaciones"
              value={stats.observations}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Entrevistas"
              value={stats.interviews}
              prefix={<PhoneOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Planes de Desarrollo"
              value={stats.developmentPlans}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Department Distribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <Card title="Distribución por Departamento" style={{ height: '100%' }}>
            <Table
              dataSource={departmentData}
              columns={departmentColumns}
              pagination={false}
              size="small"
              rowKey="department"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Análisis de Puestos" style={{ height: '100%' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Statistic
                title="Puestos Analizados"
                value={stats.jobAnalyses}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#13c2c2', fontSize: '36px' }}
              />
              <Progress
                percent={stats.jobAnalyses > 0 ? Math.min((stats.jobAnalyses / stats.employees) * 100, 100) : 0}
                status="active"
                style={{ marginTop: 16 }}
              />
              <div style={{ marginTop: 8, color: '#666' }}>
                {stats.jobAnalyses > 0 ?
                  `${((stats.jobAnalyses / stats.employees) * 100).toFixed(1)}% de puestos analizados` :
                  'Sin análisis de puestos'
                }
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Status Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Estado de Entrevistas">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(interviewStatusStats).map(([status, count]) => {
                const statusLabels = {
                  scheduled: 'Programadas',
                  in_progress: 'En Progreso',
                  completed: 'Completadas',
                  cancelled: 'Canceladas',
                  postponed: 'Pospuestas'
                }
                const colors = {
                  scheduled: '#faad14',
                  in_progress: '#1890ff',
                  completed: '#52c41a',
                  cancelled: '#ff4d4f',
                  postponed: '#722ed1'
                }
                return (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: colors[status] || '#d9d9d9'
                    }} />
                    <span style={{ flex: 1 }}>{statusLabels[status] || status}</span>
                    <span style={{ fontWeight: 'bold' }}>{count}</span>
                    <Progress
                      percent={(count / stats.interviews) * 100}
                      showInfo={false}
                      strokeColor={colors[status]}
                      style={{ width: '60px' }}
                    />
                  </div>
                )
              })}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Estado de Planes de Desarrollo">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(planStatusStats).map(([status, count]) => {
                const statusLabels = {
                  draft: 'Borradores',
                  active: 'Activos',
                  completed: 'Completados',
                  cancelled: 'Cancelados',
                  on_hold: 'En Espera'
                }
                const colors = {
                  draft: '#faad14',
                  active: '#52c41a',
                  completed: '#1890ff',
                  cancelled: '#ff4d4f',
                  on_hold: '#722ed1'
                }
                return (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: colors[status] || '#d9d9d9'
                    }} />
                    <span style={{ flex: 1 }}>{statusLabels[status] || status}</span>
                    <span style={{ fontWeight: 'bold' }}>{count}</span>
                    <Progress
                      percent={(count / stats.developmentPlans) * 100}
                      showInfo={false}
                      strokeColor={colors[status]}
                      style={{ width: '60px' }}
                    />
                  </div>
                )
              })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Insights */}
      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Alert
            message="Insights del Sistema"
            description={
              <div>
                <p>• <strong>{stats.employees}</strong> empleados registrados en el sistema</p>
                <p>• <strong>{stats.observations}</strong> observaciones realizadas para seguimiento de desempeño</p>
                <p>• <strong>{stats.interviews}</strong> entrevistas programadas o completadas</p>
                <p>• <strong>{stats.developmentPlans}</strong> planes de desarrollo activos</p>
                <p>• <strong>{stats.jobAnalyses}</strong> análisis de puestos completados</p>
              </div>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>
    </div>
  )
}