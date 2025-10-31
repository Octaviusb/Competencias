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
  DatePicker,
  Rate
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

export default function Observations() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Queries
  const { data: observations, isLoading } = useQuery({
    queryKey: ['observations'],
    queryFn: async () => (await api.get('/observations')).data,
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data) => (await api.post('/observations', data)).data,
    onSuccess: () => {
      message.success('Observación creada exitosamente')
      qc.invalidateQueries({ queryKey: ['observations'] })
      setIsCreateModalVisible(false)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando observación'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => (await api.put(`/observations/${id}`, data)).data,
    onSuccess: () => {
      message.success('Observación actualizada exitosamente')
      qc.invalidateQueries({ queryKey: ['observations'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando observación'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/observations/${id}`)).data,
    onSuccess: () => {
      message.success('Observación eliminada exitosamente')
      qc.invalidateQueries({ queryKey: ['observations'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error eliminando observación'),
  })

  // Filtered observations based on search
  const filteredObservations = observations?.filter(obs =>
    obs.employee?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    obs.employee?.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    obs.observer?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    obs.observer?.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    obs.type.toLowerCase().includes(searchText.toLowerCase())
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
      title: 'Observador',
      key: 'observer',
      render: (_, record) => (
        <Space>
          <Avatar icon={<EyeOutlined />} size="small" />
          <div>
            <div style={{ fontSize: '14px' }}>
              {record.observer?.firstName} {record.observer?.lastName}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      render: (type) => {
        const typeLabels = {
          formal: 'Formal',
          informal: 'Informal',
          '360_feedback': '360° Feedback'
        }
        return <Tag color="blue">{typeLabels[type] || type}</Tag>
      },
    },
    {
      title: 'Calificación',
      dataIndex: 'overallRating',
      render: (rating) => rating ? <Rate disabled defaultValue={rating} /> : <Text type="secondary">N/A</Text>,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status === 'completed' ? 'Completada' : 'Borrador'}
        </Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              size="small"
              onClick={() => setEditing(record)}
            >
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Eliminar observación?"
              description="Esta acción no se puede deshacer."
              okText="Sí"
              cancelText="No"
              onConfirm={() => deleteMutation.mutate(record.id)}
            >
              <Button
                size="small"
                danger
                loading={deleteMutation.isPending && deleteMutation.variables === record.id}
              >
                Eliminar
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title={<><EyeOutlined style={{ marginRight: 8 }} />Observaciones de Empleados</>}
        subtitle="Registra y gestiona observaciones de desempeño"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
          >
            Nueva Observación
          </Button>
        }
      />

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar observaciones..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={filteredObservations}
          columns={columns}
          scroll={{ x: true }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} observaciones`,
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Crear Nueva Observación"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          onFinish={(values) => createMutation.mutate({
            ...values,
            date: values.date?.toISOString(),
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
            label="Observador"
            name="observerId"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select
              placeholder="Seleccionar observador"
              options={employeeOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Tipo de Observación"
            name="type"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select placeholder="Seleccionar tipo">
              <Option value="formal">Formal</Option>
              <Option value="informal">Informal</Option>
              <Option value="360_feedback">360° Feedback</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Fecha" name="date" rules={[{ required: true, message: 'Campo requerido' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Duración (minutos)" name="duration">
            <Input type="number" placeholder="Duración en minutos" />
          </Form.Item>

          <Form.Item label="Contexto" name="context">
            <TextArea rows={2} placeholder="Contexto de la observación" />
          </Form.Item>

          <Form.Item label="Calificación General" name="overallRating">
            <Rate />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                Crear Observación
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Editar Observación"
        open={!!editing}
        onCancel={() => setEditing(null)}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          initialValues={editing ? {
            employeeId: editing.employeeId,
            observerId: editing.observerId,
            type: editing.type,
            date: editing.date ? dayjs(editing.date) : null,
            duration: editing.duration,
            context: editing.context,
            overallRating: editing.overallRating,
            status: editing.status,
          } : {}}
          onFinish={(values) => updateMutation.mutate({
            id: editing.id,
            data: {
              ...values,
              date: values.date?.toISOString(),
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
            label="Observador"
            name="observerId"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select
              placeholder="Seleccionar observador"
              options={employeeOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Tipo de Observación"
            name="type"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select placeholder="Seleccionar tipo">
              <Option value="formal">Formal</Option>
              <Option value="informal">Informal</Option>
              <Option value="360_feedback">360° Feedback</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Fecha" name="date" rules={[{ required: true, message: 'Campo requerido' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Duración (minutos)" name="duration">
            <Input type="number" placeholder="Duración en minutos" />
          </Form.Item>

          <Form.Item label="Contexto" name="context">
            <TextArea rows={2} placeholder="Contexto de la observación" />
          </Form.Item>

          <Form.Item label="Calificación General" name="overallRating">
            <Rate />
          </Form.Item>

          <Form.Item label="Estado" name="status">
            <Select>
              <Option value="draft">Borrador</Option>
              <Option value="completed">Completada</Option>
              <Option value="archived">Archivada</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Actualizar Observación
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}