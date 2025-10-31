import React, { useState, useEffect } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, theme, Select, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import Router from './router'
import api from './services/api'
import GlobalSearch from './components/GlobalSearch'
import 'antd/dist/reset.css'
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  EyeOutlined,
  PhoneOutlined,
  FileTextOutlined,
  TrophyOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UsergroupAddOutlined,
  BookOutlined
} from '@ant-design/icons'

const { Header, Content, Footer, Sider } = Layout
const { Text } = Typography

export default function App() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [currentOrg, setCurrentOrg] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  useEffect(() => {
    loadUserProfile()
    const orgId = localStorage.getItem('organizationId')
    if (orgId) {
      setCurrentOrg(orgId)
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const { data } = await api.get('/auth/profile')
      setUserRole(data.role)
      
      // Only load organizations if user is superadmin
      if (data.role === 'superadmin') {
        loadOrganizations()
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadOrganizations = async () => {
    try {
      const { data } = await api.get('/auth/organizations')
      setOrganizations(data)
    } catch (error) {
      console.error('Error loading organizations:', error)
      // If access denied, clear organizations
      if (error.response?.status === 403) {
        setOrganizations([])
      }
    }
  }

  const handleOrgChange = (orgId) => {
    localStorage.setItem('organizationId', orgId)
    setCurrentOrg(orgId)
    const org = organizations.find(o => o.id === orgId)
    message.success(`Organización cambiada a: ${org?.name}`)
    window.location.reload()
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Panel de Control',
    },
    {
      key: 'employees',
      icon: <TeamOutlined />,
      label: 'Empleados',
      path: '/employees',
    },
    {
      key: 'observations',
      icon: <EyeOutlined />,
      label: 'Observaciones',
      path: '/observations',
    },
    {
      key: 'interviews',
      icon: <PhoneOutlined />,
      label: 'Entrevistas',
      path: '/interviews',
    },
    {
      key: 'job-analyses',
      icon: <FileTextOutlined />,
      label: 'Análisis de Puestos',
      path: '/job-analyses',
    },
    {
      key: 'development-plans',
      icon: <TrophyOutlined />,
      label: 'Planes de Desarrollo',
      path: '/development-plans',
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Análisis',
      path: '/analytics',
    },
    {
      key: 'hr-management',
      icon: <TeamOutlined />,
      label: 'Gestión RRHH',
      children: [
        {
          key: 'leave-requests',
          icon: <CalendarOutlined />,
          label: 'Vacaciones y Permisos',
          path: '/leave-requests',
        },
        {
          key: 'attendance',
          icon: <ClockCircleOutlined />,
          label: 'Control de Asistencia',
          path: '/attendance',
        },
        {
          key: 'payroll',
          icon: <DollarOutlined />,
          label: 'Nóminas',
          path: '/payroll',
        },
        {
          key: 'recruitment',
          icon: <UsergroupAddOutlined />,
          label: 'Reclutamiento',
          path: '/recruitment',
        },
        {
          key: 'training',
          icon: <BookOutlined />,
          label: 'Capacitación',
          path: '/training',
        },
      ],
    },
    {
      key: 'admin',
      icon: <SettingOutlined />,
      label: 'Administración',
      children: [
        {
          key: 'departments',
          label: 'Departamentos',
        },
        {
          key: 'categories',
          label: 'Categorías',
        },
        {
          key: 'competencies',
          label: 'Competencias',
        },
        {
          key: 'positions',
          label: 'Puestos',
        },
      ],
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Mi Perfil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
    },
    // Only show organization switching for superadmins
    ...(userRole === 'superadmin' ? [{
      key: 'select-org',
      icon: <TeamOutlined />,
      label: 'Cambiar Organización',
      onClick: () => navigate('/select-organization')
    }] : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('organizationId')
        navigate('/login')
      }
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Text 
            style={{ 
              color: '#fff', 
              fontSize: collapsed ? '16px' : '20px', 
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            {collapsed ? 'CM' : 'Competency Manager'}
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none'
          }}
          onClick={({ key }) => {
            // Find item in main menu or submenu
            let targetItem = null;
            for (const item of menuItems) {
              if (item.key === key) {
                targetItem = item;
                break;
              }
              if (item.children) {
                const childItem = item.children.find(child => child.key === key);
                if (childItem) {
                  targetItem = childItem;
                  break;
                }
              }
            }
            
            if (targetItem?.path) {
              navigate(targetItem.path);
            } else if (key === 'dashboard') {
              navigate('/dashboard');
            } else if (key === 'departments') {
              navigate('/admin/departments');
            } else if (key === 'categories') {
              navigate('/admin/categories');
            } else if (key === 'competencies') {
              navigate('/admin/competencies');
            } else if (key === 'positions') {
              navigate('/admin/positions');
            }
          }}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Space>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: '#2c3e50' }}>
              Sistema de Gestión de Competencias
            </Text>
            <GlobalSearch />
            {userRole === 'superadmin' && organizations.length > 0 && (
              <Select
                value={currentOrg}
                onChange={handleOrgChange}
                style={{ minWidth: 200 }}
                placeholder="Seleccionar organización"
              >
                {organizations.map(org => (
                  <Select.Option key={org.id} value={org.id}>
                    {org.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Space>
          <Dropdown 
            menu={{ 
              items: userMenuItems,
              onClick: ({ key }) => {
                const item = userMenuItems.find(i => i.key === key)
                if (item?.onClick) item.onClick()
              }
            }} 
            placement="bottomRight"
          >
            <Button type="text" style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                style={{ backgroundColor: '#87d068' }} 
                icon={<UserOutlined />} 
              />
              <Text style={{ marginLeft: 8, color: '#2c3e50' }}>Usuario</Text>
            </Button>
          </Dropdown>
        </Header>
        <Content style={{
          margin: '24px',
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Router />
        </Content>
        <Footer style={{
          textAlign: 'center',
          background: '#f8f9fa',
          borderTop: '1px solid #e9ecef',
          color: '#6c757d'
        }}>
          <Space direction="vertical" size="small">
            <Text strong>© {new Date().getFullYear()} Competency Manager</Text>
            <Text type="secondary">Potenciando el talento humano</Text>
          </Space>
        </Footer>
      </Layout>
    </Layout>
  )
}
