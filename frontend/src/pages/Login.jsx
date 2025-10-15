import React, { useState } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Typography, 
  Space, 
  Divider, 
  Checkbox,
  Row,
  Col
} from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined,
  TeamOutlined,
  TrophyOutlined,
  EyeOutlined
} from '@ant-design/icons'
import api from '../services/api'

const { Title, Text, Paragraph } = Typography
const { Meta } = Card

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const orgId = localStorage.getItem('organizationId')
      const { data } = await api.post('/auth/login', { ...values, organizationId: orgId })
      localStorage.setItem('token', data.token)
      message.success('✅ ¡Bienvenido de vuelta!')
      window.location.href = '/dashboard'
    } catch (err) {
      message.error(`❌ ${err?.response?.data?.error || 'Error de autenticación'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <Row gutter={[32, 32]} style={{ maxWidth: 1200, width: '100%' }}>
        <Col xs={24} md={12} lg={14}>
          <div style={{ color: 'white', textAlign: 'center' }}>
            <div style={{ marginBottom: 32 }}>
              <Title level={1} style={{ color: 'white', marginBottom: 16, fontSize: '3rem' }}>
                Competency Manager
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 32 }}>
                Transforma la gestión del talento humano con nuestra plataforma integral de competencias
              </Paragraph>
            </div>
            
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}><TeamOutlined /></div>
                  <Text strong style={{ color: 'white', fontSize: 16 }}>Gestión de Empleados</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}><EyeOutlined /></div>
                  <Text strong style={{ color: 'white', fontSize: 16 }}>Observaciones</Text>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}><TrophyOutlined /></div>
                  <Text strong style={{ color: 'white', fontSize: 16 }}>Desarrollo</Text>
                </div>
              </Col>
            </Row>
            
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              Accede a herramientas avanzadas para evaluar, desarrollar y potenciar el talento de tu equipo
            </Paragraph>
          </div>
        </Col>
        
        <Col xs={24} md={12} lg={10}>
          <Card 
            style={{ 
              borderRadius: 16,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: 'none'
            }}
            bodyStyle={{ padding: 40 }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <LoginOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
              <Title level={2} style={{ color: '#2c3e50', marginBottom: 8 }}>
                Iniciar Sesión
              </Title>
              <Text type="secondary">
                Accede a tu cuenta para continuar
              </Text>
            </div>
            
            <Form 
              layout="vertical" 
              onFinish={onFinish}
              size="large"
            >
              <Form.Item 
                label="Correo Electrónico" 
                name="email" 
                rules={[
                  { required: true, message: 'Por favor ingresa tu email' },
                  { type: 'email', message: 'Por favor ingresa un email válido' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="email@empresa.com"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
              
              <Form.Item 
                label="Contraseña" 
                name="password" 
                rules={[
                  { required: true, message: 'Por favor ingresa tu contraseña' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="••••••••"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 24
              }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox onChange={(e) => setRememberMe(e.target.checked)}>
                    Recordarme
                  </Checkbox>
                </Form.Item>
                <Typography.Link style={{ color: '#667eea' }}>
                  ¿Olvidaste tu contraseña?
                </Typography.Link>
              </div>
              
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                style={{ 
                  height: 48, 
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontSize: 16,
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Form>
            
            <Divider style={{ margin: '24px 0' }}>
              <Text type="secondary">o</Text>
            </Divider>
            
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ marginRight: 8 }}>
                ¿No tienes cuenta?
              </Text>
              <Typography.Link 
                onClick={() => (window.location.href = '/register')}
                style={{ 
                  color: '#667eea', 
                  fontWeight: 'bold',
                  fontSize: 16
                }}
              >
                Regístrate aquí
              </Typography.Link>
            </div>
          </Card>
        </Col>
      </Row>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
