import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Typography,
  Button,
  Space,
  message,
  Card,
  Form,
  Input,
  Select,
  Modal,
  Popconfirm,
  Tag,
  Avatar,
  Tooltip
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  EyeOutlined
} from '@ant-design/icons'
import api from '../services/api'
import PageHeader from '../components/PageHeader'

const { Title } = Typography
const { Option } = Select

export default function Employees() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Queries
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data,
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data,
  })

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => (await api.get('/positions')).data,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data) => (await api.post('/employees', data)).data,
    onSuccess: () => {
      message.success('Empleado creado exitosamente')
      qc.invalidateQueries({ queryKey: ['employees'] })
      setIsCreateModalVisible(false)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando empleado'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => (await api.put(`/employees/${id}`, data)).data,
    onSuccess: () => {
      message.success('Empleado actualizado exitosamente')
      qc.invalidateQueries({ queryKey: ['employees'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando empleado'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/employees/${id}`)).data,
    onSuccess: () => {
      message.success('Empleado eliminado exitosamente')
      qc.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error eliminando empleado'),
  })

  // Filtered employees based on search
  const filteredEmployees = employees?.filter(emp =>
    emp.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.department?.name?.toLowerCase().includes(searchText.toLowerCase())
  ) || []

  const departmentOptions = departments?.map(d => ({ value: d.id, label: d.name })) || []
  const positionOptions = positions?.map(p => ({ value: p.id, label: p.name })) || []

  const columns = [
    {
      title: 'Empleado',
      key: 'employee',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.firstName} {record.lastName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.title || 'Sin título'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Departamento',
      dataIndex: ['department', 'name'],
      render: (name) => name || <Tag color="orange">Sin asignar</Tag>,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Fecha de Ingreso',
      dataIndex: 'hireDate',
      render: (date) => date ? new Date(date).toLocaleDateString('es-ES') : 'N/A',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver Perfil">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/employees/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditing(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Eliminar empleado?"
              description="Esta acción no se puede deshacer."
              okText="Sí"
              cancelText="No"
              onConfirm={() => deleteMutation.mutate(record.id)}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending && deleteMutation.variables === record.id}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title={<><TeamOutlined style={{ marginRight: 8 }} />Gestión de Empleados</>}
        subtitle="Administra información de empleados y sus posiciones"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
          >
            Nuevo Empleado
          </Button>
        }
      />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar empleados..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={filteredEmployees}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} empleados`,
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Crear Nuevo Empleado"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item
            label="Nombre"
            name="firstName"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder="Nombre" />
          </Form.Item>

          <Form.Item
            label="Apellido"
            name="lastName"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder="Apellido" />
          </Form.Item>

          <Form.Item label="Título/Puesto" name="title">
            <Input placeholder="Título o puesto" />
          </Form.Item>

          <Form.Item label="Departamento" name="departmentId">
            <Select
              placeholder="Seleccionar departamento"
              options={departmentOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item label="Estado" name="status" initialValue="active">
            <Select>
              <Option value="active">Activo</Option>
              <Option value="inactive">Inactivo</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                Crear Empleado
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Editar Empleado"
        open={!!editing}
        onCancel={() => setEditing(null)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          initialValues={editing ? {
            firstName: editing.firstName,
            lastName: editing.lastName,
            title: editing.title,
            departmentId: editing.departmentId,
            status: editing.status,
          } : {}}
          onFinish={(values) => updateMutation.mutate({ id: editing.id, data: values })}
        >
          <Form.Item
            label="Nombre"
            name="firstName"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder="Nombre" />
          </Form.Item>

          <Form.Item
            label="Apellido"
            name="lastName"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder="Apellido" />
          </Form.Item>

          <Form.Item label="Título/Puesto" name="title">
            <Input placeholder="Título o puesto" />
          </Form.Item>

          <Form.Item label="Departamento" name="departmentId">
            <Select
              placeholder="Seleccionar departamento"
              options={departmentOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item label="Estado" name="status">
            <Select>
              <Option value="active">Activo</Option>
              <Option value="inactive">Inactivo</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Actualizar Empleado
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}