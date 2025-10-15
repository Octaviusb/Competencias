import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Typography,
  Avatar,
  Space,
  Tag,
  Tabs,
  List,
  Progress,
  Button,
  Skeleton,
  Empty,
  Divider,
  Descriptions,
  Statistic,
  Row,
  Col
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import api from '../services/api'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

export default function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('1')

  // Query for employee details
  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const response = await api.get(`/employees/${id}`)
      return response.data
    },
    enabled: !!id
  })

  // Query for employee's evaluations
  const { data: evaluations } = useQuery({
    queryKey: ['employee-evaluations', id],
    queryFn: async () => {
      const response = await api.get(`/evaluations?employeeId=${id}`)
      return response.data
    },
    enabled: !!id
  })

  // Query for employee's interviews
  const { data: interviews } = useQuery({
    queryKey: ['employee-interviews', id],
    queryFn: async () => {
      const response = await api.get(`/interviews?employeeId=${id}`)
      return response.data
    },
    enabled: !!id
  })

  // Query for employee's observations
  const { data: observations } = useQuery({
    queryKey: ['employee-observations', id],
    queryFn: async () => {
      const response = await api.get(`/observations?employeeId=${id}`)
      return response.data
    },
    enabled: !!id
  })

  // Query for employee's development plans
  const { data: developmentPlans } = useQuery({
    queryKey: ['employee-development-plans', id],
    queryFn: async () => {
      const response = await api.get(`/development-plans?employeeId=${id}`)
      return response.data
    },
    enabled: !!id
  })

  if (isLoading) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Skeleton active />
        <Card>
          <Skeleton active />
        </Card>
      </Space>
    )
  }

  if (error || !employee) {
    return (
      <Empty
        description="Empleado no encontrado"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  // Calculate competency averages from evaluations
  const competencyStats = {}
  evaluations?.forEach(eval_ => {
    eval_.results?.forEach(result => {
      const compName = result.competency?.name
      if (compName) {
        if (!competencyStats[compName]) {
          competencyStats[compName] = { total: 0, count: 0, category: result.competency.category?.name }
        }
        competencyStats[compName].total += result.score
        competencyStats[compName].count += 1
      }
    })
  })

  const avgCompetencies = Object.entries(competencyStats).map(([name, stats]) => ({
    name,
    average: Math.round((stats.total / stats.count) * 10) / 10,
    category: stats.category
  })).sort((a, b) => b.average - a.average)

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/employees')}
        >
          Volver
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          Perfil del Empleado
        </Title>
      </div>

      {/* Basic Info Card */}
      <Card>
        <Space size="large" align="start">
          <Avatar size={80} icon={<UserOutlined />} />
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ marginTop: 0 }}>
              {employee.firstName} {employee.lastName}
            </Title>
            <Space direction="vertical" size="small">
              <Text strong>{employee.title || 'Sin título asignado'}</Text>
              <Space>
                <TeamOutlined />
                <Text>{employee.department?.name || 'Sin departamento'}</Text>
              </Space>
              <Space>
                <Text type="secondary">Estado:</Text>
                <Tag color={employee.status === 'active' ? 'green' : 'red'}>
                  {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                </Tag>
              </Space>
              {employee.hireDate && (
                <Space>
                  <ClockCircleOutlined />
                  <Text>Ingresó: {dayjs(employee.hireDate).format('DD/MM/YYYY')}</Text>
                </Space>
              )}
            </Space>
          </div>
          <div>
            <Row gutter={16}>
              <Col>
                <Statistic
                  title="Evaluaciones"
                  value={evaluations?.length || 0}
                  prefix={<BarChartOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title="Entrevistas"
                  value={interviews?.length || 0}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col>
                <Statistic
                  title="Observaciones"
                  value={observations?.length || 0}
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
          </div>
        </Space>
      </Card>

      {/* Detailed Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Competencias" key="1">
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>Promedio de Competencias</Title>
              <Text type="secondary">
                Basado en {evaluations?.length || 0} evaluaciones realizadas
              </Text>
            </div>

            {avgCompetencies.length > 0 ? (
              <List
                dataSource={avgCompetencies}
                renderItem={(comp) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{comp.name}</Text>
                          <Tag size="small">{comp.category}</Tag>
                        </Space>
                      }
                      description={
                        <Progress
                          percent={comp.average * 20}
                          size="small"
                          format={() => `${comp.average}/5`}
                        />
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No hay evaluaciones disponibles" />
            )}
          </TabPane>

          <TabPane tab={`Evaluaciones (${evaluations?.length || 0})`} key="2">
            {evaluations?.length > 0 ? (
              <List
                dataSource={evaluations}
                renderItem={(eval_) => (
                  <List.Item>
                    <Card style={{ width: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>{eval_.template?.name}</Text>
                          <br />
                          <Text type="secondary">
                            Período: {eval_.period} | Estado: {eval_.status}
                          </Text>
                        </div>

                        {eval_.results && eval_.results.length > 0 && (
                          <div>
                            <Text strong>Resultados por Competencia:</Text>
                            <div style={{ marginTop: 8 }}>
                              {eval_.results.map((result, index) => (
                                <div key={index} style={{ marginBottom: 4 }}>
                                  <Text>{result.competency?.name}: </Text>
                                  <Text strong>{result.score}/5</Text>
                                  {result.comments && (
                                    <div style={{ marginLeft: 16, fontSize: '12px', color: '#666' }}>
                                      {result.comments}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No hay evaluaciones realizadas" />
            )}
          </TabPane>

          <TabPane tab={`Entrevistas (${interviews?.length || 0})`} key="3">
            {interviews?.length > 0 ? (
              <List
                dataSource={interviews}
                renderItem={(interview) => (
                  <List.Item>
                    <Card style={{ width: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>{interview.type}</Text>
                          <Tag color="blue">{interview.status}</Tag>
                          <br />
                          <Text type="secondary">
                            Fecha: {dayjs(interview.scheduledDate).format('DD/MM/YYYY HH:mm')}
                            {interview.actualDate && ` | Realizada: ${dayjs(interview.actualDate).format('DD/MM/YYYY HH:mm')}`}
                          </Text>
                        </div>

                        {interview.purpose && (
                          <div>
                            <Text strong>Propósito:</Text>
                            <Paragraph style={{ marginTop: 4 }}>{interview.purpose}</Paragraph>
                          </div>
                        )}

                        {interview.evaluations && interview.evaluations.length > 0 && (
                          <div>
                            <Text strong>Evaluaciones de Competencias:</Text>
                            <div style={{ marginTop: 8 }}>
                              {interview.evaluations.map((eval_, index) => (
                                <div key={index} style={{ marginBottom: 8 }}>
                                  <Text>{eval_.competency?.name}: </Text>
                                  <Text strong>{eval_.rating}/5</Text>
                                  {eval_.comments && (
                                    <div style={{ marginLeft: 16, fontSize: '12px', color: '#666' }}>
                                      {eval_.comments}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No hay entrevistas realizadas" />
            )}
          </TabPane>

          <TabPane tab={`Observaciones (${observations?.length || 0})`} key="4">
            {observations?.length > 0 ? (
              <List
                dataSource={observations}
                renderItem={(obs) => (
                  <List.Item>
                    <Card style={{ width: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Space>
                            <Tag color={
                              obs.type === 'formal' ? 'red' :
                              obs.type === 'informal' ? 'orange' : 'blue'
                            }>
                              {obs.type}
                            </Tag>
                            <Text type="secondary">
                              {dayjs(obs.date).format('DD/MM/YYYY')}
                            </Text>
                            <Text type="secondary">
                              Observador: {obs.observer?.firstName} {obs.observer?.lastName}
                            </Text>
                          </Space>
                        </div>

                        {obs.overallRating && (
                          <div>
                            <Text>Calificación general: </Text>
                            <Text strong>{obs.overallRating}/5</Text>
                          </div>
                        )}

                        {obs.notes && obs.notes.length > 0 && (
                          <div>
                            <Text strong>Notas:</Text>
                            <div style={{ marginTop: 8 }}>
                              {obs.notes.map((note, index) => (
                                <div key={index} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                                  <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                                    {dayjs(note.timestamp).format('DD/MM/YYYY HH:mm')}
                                  </div>
                                  <Paragraph style={{ margin: 0 }}>{note.content}</Paragraph>
                                  {note.category && (
                                    <Tag size="small" style={{ marginTop: 4 }}>
                                      {note.category}
                                    </Tag>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No hay observaciones registradas" />
            )}
          </TabPane>

          <TabPane tab={`Planes de Desarrollo (${developmentPlans?.length || 0})`} key="5">
            {developmentPlans?.length > 0 ? (
              <List
                dataSource={developmentPlans}
                renderItem={(plan) => (
                  <List.Item>
                    <Card style={{ width: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>{plan.title}</Text>
                          <Tag color={
                            plan.status === 'active' ? 'green' :
                            plan.status === 'completed' ? 'blue' :
                            plan.status === 'draft' ? 'orange' : 'red'
                          }>
                            {plan.status}
                          </Tag>
                        </div>

                        {plan.description && (
                          <Paragraph>{plan.description}</Paragraph>
                        )}

                        <Space>
                          <Text type="secondary">
                            Inicio: {dayjs(plan.startDate).format('DD/MM/YYYY')}
                          </Text>
                          <Text type="secondary">
                            Objetivo: {dayjs(plan.targetDate).format('DD/MM/YYYY')}
                          </Text>
                          {plan.priority && (
                            <Tag color={
                              plan.priority === 'high' ? 'red' :
                              plan.priority === 'medium' ? 'orange' : 'green'
                            }>
                              {plan.priority}
                            </Tag>
                          )}
                        </Space>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No hay planes de desarrollo" />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </Space>
  )
}