import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Tooltip,
  Progress,
  DatePicker
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons'
import api from '../services/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

export default function DevelopmentPlans() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Queries
  const { data: developmentPlans, isLoading } = useQuery({
    queryKey: ['development-plans'],
    queryFn: async () => {
      const orgId = localStorage.getItem('organizationId')
      return (await api.get('/development-plans', { params: { organizationId: orgId } })).data
    },
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data) => (await api.post('/development-plans', data)).data,
    onSuccess: () => {
      message.success('Plan de desarrollo creado exitosamente')
      qc.invalidateQueries({ queryKey: ['development-plans'] })
      setIsCreateModalVisible(false)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando plan'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => (await api.put(`/development-plans/${id}`, data)).data,
    onSuccess: () => {
      message.success('Plan de desarrollo actualizado exitosamente')
      qc.invalidateQueries({ queryKey: ['development-plans'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando plan'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/development-plans/${id}`)).data,
    onSuccess: () => {
      message.success('Plan de desarrollo eliminado exitosamente')
      qc.invalidateQueries({ queryKey: ['development-plans'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error eliminando plan'),
  })

  // Filtered plans based on search
  const filteredPlans = developmentPlans?.filter(plan =>
    plan.employee?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    plan.employee?.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    plan.title.toLowerCase().includes(searchText.toLowerCase())
  ) || []

  const employeeOptions = employees?.map(emp => ({
    value: emp.id,
    label: `${emp.firstName} ${emp.lastName}`
  })) || []

  const columns = [
    {
      title: 'Empleado',
      key: 'employee',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.employee?.firstName} {record.employee?.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.employee?.title || 'Sin título'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'title',
      render: (title) => <Text strong>{title}</Text>,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status) => {
        const statusLabels = {
          draft: 'Borrador',
          active: 'Activo',
          completed: 'Completado',
          cancelled: 'Cancelado',
          on_hold: 'En Espera'
        }
        const colors = {
          draft: 'orange',
          active: 'green',
          completed: 'blue',
          cancelled: 'red',
          on_hold: 'purple'
        }
        return <Tag color={colors[status]}>{statusLabels[status] || status}</Tag>
      },
    },
    {
      title: 'Prioridad',
      dataIndex: 'priority',
      render: (priority) => {
        const priorityLabels = {
          low: 'Baja',
          medium: 'Media',
          high: 'Alta',
          critical: 'Crítica'
        }
        const colors = {
          low: 'green',
          medium: 'orange',
          high: 'red',
          critical: 'red'
        }
        return <Tag color={colors[priority]}>{priorityLabels[priority] || priority}</Tag>
      },
    },
    {
      title: 'Fecha Inicio',
      dataIndex: 'startDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Fecha Objetivo',
      dataIndex: 'targetDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Progreso',
      key: 'progress',
      render: (_, record) => {
        // Mock progress calculation - in real app this would come from reviews
        const progress = record.status === 'completed' ? 100 :
                        record.status === 'active' ? 45 :
                        record.status === 'draft' ? 0 : 25
        return <Progress percent={progress} size="small" />
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditing(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Eliminar plan de desarrollo?"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Planes de Desarrollo
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
        >
          Nuevo Plan
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar planes de desarrollo..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={filteredPlans}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} planes`,
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Crear Nuevo Plan de Desarrollo"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            const orgId = localStorage.getItem('organizationId')
            createMutation.mutate({
              ...values,
              startDate: values.startDate?.toISOString(),
              targetDate: values.targetDate?.toISOString(),
              organizationId: orgId,
            })
          }}
        >
          <Form.Item
            label="Empleado"
            name="employeeId"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select
              placeholder="Seleccionar empleado"
              options={employeeOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Título del Plan"
            name="title"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder="Título del plan de desarrollo" />
          </Form.Item>

          <Form.Item label="Descripción" name="description">
            <TextArea rows={3} placeholder="Descripción del plan" />
          </Form.Item>

          <Form.Item
            label="Fecha de Inicio"
            name="startDate"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Seleccionar fecha de inicio" />
          </Form.Item>

          <Form.Item
            label="Fecha Objetivo"
            name="targetDate"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Seleccionar fecha objetivo" />
          </Form.Item>

          <Form.Item label="Estado" name="status" initialValue="draft">
            <Select>
              <Option value="draft">Borrador</Option>
              <Option value="active">Activo</Option>
              <Option value="completed">Completado</Option>
              <Option value="cancelled">Cancelado</Option>
              <Option value="on_hold">En Espera</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Prioridad" name="priority" initialValue="medium">
            <Select>
              <Option value="low">Baja</Option>
              <Option value="medium">Media</Option>
              <Option value="high">Alta</Option>
              <Option value="critical">Crítica</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Presupuesto" name="budget">
            <Input type="number" placeholder="Presupuesto estimado" prefix="$" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                Crear Plan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Editar Plan de Desarrollo"
        open={!!editing}
        onCancel={() => setEditing(null)}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          initialValues={editing ? {
            employeeId: editing.employeeId,
            title: editing.title,
            description: editing.description,
            startDate: editing.startDate ? dayjs(editing.startDate) : null,
            targetDate: editing.targetDate ? dayjs(editing.targetDate) : null,
            status: editing.status,
            priority: editing.priority,
            budget: editing.budget,
          } : {}}
          onFinish={(values) => updateMutation.mutate({
            id: editing.id,
            data: {
              ...values,
              startDate: values.startDate?.toISOString(),
              targetDate: values.targetDate?.toISOString(),
            }
          })}
        >
          <Form.Item
            label="Empleado"
            name="employeeId"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select
              placeholder="Seleccionar empleado"
              options={employeeOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Título del Plan"
            name="title"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder="Título del plan de desarrollo" />
          </Form.Item>

          <Form.Item label="Descripción" name="description">
            <TextArea rows={3} placeholder="Descripción del plan" />
          </Form.Item>

          <Form.Item
            label="Fecha de Inicio"
            name="startDate"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Seleccionar fecha de inicio" />
          </Form.Item>

          <Form.Item
            label="Fecha Objetivo"
            name="targetDate"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Seleccionar fecha objetivo" />
          </Form.Item>

          <Form.Item label="Estado" name="status">
            <Select>
              <Option value="draft">Borrador</Option>
              <Option value="active">Activo</Option>
              <Option value="completed">Completado</Option>
              <Option value="cancelled">Cancelado</Option>
              <Option value="on_hold">En Espera</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Prioridad" name="priority">
            <Select>
              <Option value="low">Baja</Option>
              <Option value="medium">Media</Option>
              <Option value="high">Alta</Option>
              <Option value="critical">Crítica</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Presupuesto" name="budget">
            <Input type="number" placeholder="Presupuesto estimado" prefix="$" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Actualizar Plan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}