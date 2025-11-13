import React, { useEffect, useState } from 'react'
import { Card, Form, Input, Button, List, message, Typography, Space, Alert, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function SelectOrganization() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [items, setItems] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)

  const checkAccess = async () => {
    try {
      // Load organizations for everyone (superadmin sees all, others see available)
      await load()

      // Only check profile if user has both token and organization
      const token = localStorage.getItem('token')
      const orgId = localStorage.getItem('organizationId')

      if (token && orgId) {
        try {
          // If user has token and organization, get their role
          const { data } = await api.get('/auth/profile')
          setUserRole(data.role)
        } catch (profileError) {
          console.warn('Profile check failed, user may need to login again:', profileError)
          // Clear invalid token
          localStorage.removeItem('token')
        }
      }
    } catch (error) {
      console.error('Error checking access:', error)
    }
  }

  const load = async () => {
    setLoading(true)
    try {
      // Use admin organizations endpoint
      const response = await api.get('/admin/organizations')
      const orgs = Array.isArray(response.data) ? response.data : []
      
      // Filter organizations that have users or are demo, or show first 3 if none match
      let validOrgs = orgs.filter(org => 
        org._count?.users > 0 || 
        org.name?.toLowerCase().includes('demo') ||
        org.name?.toLowerCase().includes('empresa')
      )
      
      // If no valid orgs found, show first 3 to avoid empty list
      if (validOrgs.length === 0) {
        validOrgs = orgs.slice(0, 3)
      }
      setItems(validOrgs)
    } catch (e) {
      console.error('Error loading organizations:', e)
      message.error('No se pudieron cargar organizaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAccess()
  }, [])

  const selectOrg = (org) => {
    localStorage.setItem('organizationId', org.id)
    message.success(`Organización seleccionada: ${org.name}`)
    
    // Check if user has token to decide where to redirect
    const token = localStorage.getItem('token')
    setTimeout(() => {
      if (token) {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/login'
      }
    }, 1000)
  }

  const onCreate = async (values) => {
    setCreating(true)
    try {
      const { data } = await api.post('/api/organizations', values)
      localStorage.setItem('organizationId', data.id)
      message.success('Organización creada y seleccionada')
      await load()
      // Redirect to login after creation for new users
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    } catch (e) {
      message.error(e?.response?.data?.error || 'Error creando organización')
    } finally {
      setCreating(false)
    }
  }

  const go = (path) => {
    window.location.href = path
  }

  // Remove access denied block - everyone can select organizations

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px'
    }}>
      <div style={{ maxWidth: 1200, width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, color: 'white' }}>
          <div style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            marginBottom: 16,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Competency Manager
          </div>
          <Typography.Title level={2} style={{ color: 'white', marginBottom: 8, fontWeight: 300 }}>
            Seleccionar Organización
          </Typography.Title>
          <Typography.Paragraph style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 18,
            maxWidth: 600,
            margin: '0 auto'
          }}>
            Elige tu organización para acceder al sistema completo de gestión del talento humano
          </Typography.Paragraph>
        </div>

        {/* Main Content */}
        <Row gutter={[32, 32]} justify="center">
          {/* Existing Organizations */}
          <Col xs={24} md={12} lg={10}>
            <Card
              title={
                <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 600 }}>
                  Organizaciones Disponibles
                </div>
              }
              style={{
                borderRadius: 20,
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                border: 'none',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
              styles={{ body: { padding: 24 } }}
              loading={loading}
            >
              <List
                dataSource={items}
                locale={{
                  emptyText: (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ fontSize: '16px', color: '#666' }}>
                        No hay organizaciones disponibles
                      </div>
                      <div style={{ fontSize: '14px', color: '#999', marginTop: 8 }}>
                        Crea una nueva organización para comenzar
                      </div>
                    </div>
                  )
                }}
                renderItem={(org) => (
                  <List.Item
                    style={{
                      padding: '16px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                    actions={[
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => selectOrg(org)}
                        style={{
                          borderRadius: 12,
                          height: 40,
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        Acceder →
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '20px',
                          fontWeight: 'bold'
                        }}>
                          {org?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      }
                      title={
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#2c3e50' }}>
                          {org?.name || 'Sin nombre'}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                            ID: {org?.id || 'N/A'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            Creada: {org?.createdAt ? new Date(org.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />

              {items.length > 0 && (
                <div style={{
                  marginTop: 20,
                  padding: 16,
                  backgroundColor: '#f8f9ff',
                  borderRadius: 12,
                  border: '1px solid #e6e8ff'
                }}>
                  <Typography.Text style={{
                    fontSize: '14px',
                    color: '#667eea',
                    fontWeight: 500
                  }}>
                    Selecciona tu organización para acceder al sistema completo
                  </Typography.Text>
                </div>
              )}
            </Card>
          </Col>

          {/* Create New Organization */}
          <Col xs={24} md={12} lg={10}>
            <Card
              title={
                <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 600 }}>
                  Crear Nueva Organización
                </div>
              }
              style={{
                borderRadius: 20,
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                border: 'none',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)'
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Typography.Text style={{ fontSize: '14px', color: '#666' }}>
                  Comienza tu viaje hacia la excelencia en gestión del talento
                </Typography.Text>
              </div>

              <Form layout="vertical" onFinish={onCreate}>
                <Form.Item
                  label={
                    <span style={{ fontWeight: 600, color: '#2c3e50' }}>
                      Nombre de la Organización
                    </span>
                  }
                  name="name"
                  rules={[
                    { required: true, message: 'El nombre es obligatorio' },
                    { min: 2, message: 'Mínimo 2 caracteres' },
                    { max: 100, message: 'Máximo 100 caracteres' }
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Ej: Tech Solutions S.A.S."
                    style={{
                      borderRadius: 12,
                      border: '2px solid #e1e5e9',
                      fontSize: '16px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={creating}
                  size="large"
                  block
                  style={{
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                    marginTop: 8
                  }}
                >
                  {creating ? 'Creando Organización...' : 'Crear Organización'}
                </Button>
              </Form>

              <div style={{
                marginTop: 20,
                padding: 16,
                backgroundColor: '#f0f8ff',
                borderRadius: 12,
                border: '1px solid #b3d9ff'
              }}>
                <Typography.Text style={{
                  fontSize: '13px',
                  color: '#0066cc',
                  fontWeight: 500
                }}>
                  Crea tu propia organización y comienza a gestionar competencias, evaluaciones y nómina electrónica DIAN
                </Typography.Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Footer Actions */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Space size="large">
            <Button
              size="large"
              onClick={() => go('/login')}
              style={{
                borderRadius: 12,
                padding: '12px 32px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.25)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              Iniciar Sesión
            </Button>
            <Button
              size="large"
              onClick={() => go('/register')}
              style={{
                borderRadius: 12,
                padding: '12px 32px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.25)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              Registrarse
            </Button>
          </Space>
        </div>

        {/* Features Preview */}
        <div style={{ textAlign: 'center', marginTop: 60, color: 'white' }}>
          <Typography.Title level={3} style={{ color: 'white', marginBottom: 24 }}>
            Funcionalidades Incluidas
          </Typography.Title>
          <Row gutter={[24, 24]} justify="center">
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Gestión de Empleados</div>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Evaluaciones 360°</div>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Planes de Desarrollo</div>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Nómina DIAN</div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}
