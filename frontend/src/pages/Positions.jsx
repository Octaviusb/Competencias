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
  Tooltip,
  Tabs,
  List,
  Progress,
  Descriptions,
  Statistic,
  Row,
  Col,
  Empty
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import api from '../services/api'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

export default function Positions() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [searchText, setSearchText] = useState('')

  // Queries
  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => (await api.get('/positions')).data,
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data) => (await api.post('/positions', data)).data,
    onSuccess: () => {
      message.success('Puesto creado exitosamente')
      qc.invalidateQueries({ queryKey: ['positions'] })
      setIsCreateModalVisible(false)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando puesto'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => (await api.put(`/positions/${id}`, data)).data,
    onSuccess: () => {
      message.success('Puesto actualizado exitosamente')
      qc.invalidateQueries({ queryKey: ['positions'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando puesto'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/positions/${id}`)).data,
    onSuccess: () => {
      message.success('Puesto eliminado exitosamente')
      qc.invalidateQueries({ queryKey: ['positions'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error eliminando puesto'),
  })

  // Filtered positions based on search
  const filteredPositions = positions?.filter(pos =>
    pos.name.toLowerCase().includes(searchText.toLowerCase()) ||
    pos.description?.toLowerCase().includes(searchText.toLowerCase()) ||
    pos.department?.name?.toLowerCase().includes(searchText.toLowerCase())
  ) || []

  const departmentOptions = departments?.map(d => ({ value: d.id, label: d.name })) || []

  const columns = [
    {
      title: 'Puesto',
      key: 'position',
      render: (_, record) => (
        <Space>
          <Avatar icon={<TeamOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.level || 'Sin nivel'} • {record.department?.name || 'Sin departamento'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      render: (description) => description || <Text type="secondary">Sin descripción</Text>,
      ellipsis: true,
    },
    {
      title: 'Competencias',
      dataIndex: 'requirements',
      render: (requirements) => requirements?.length || 0,
    },
    {
      title: 'Empleados',
      dataIndex: 'holders',
      render: (holders) => holders?.length || 0,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver Detalles">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedPosition(record)}
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
              title="¿Eliminar puesto?"
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
          <TeamOutlined style={{ marginRight: 8 }} />
          Gestión de Puestos
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
        >
          Nuevo Puesto
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar puestos..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={filteredPositions}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} puestos`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Detalles del Puesto: ${selectedPosition?.name}`}
        open={!!selectedPosition}
        onCancel={() => setSelectedPosition(null)}
        footer={null}
        width={900}
      >
        {selectedPosition && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Información General" key="1">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Nombre">{selectedPosition.name}</Descriptions.Item>
                <Descriptions.Item label="Nivel">{selectedPosition.level || 'No especificado'}</Descriptions.Item>
                <Descriptions.Item label="Descripción" span={2}>
                  {selectedPosition.description || 'Sin descripción'}
                </Descriptions.Item>
                <Descriptions.Item label="Departamento">
                  {selectedPosition.department?.name || 'Sin departamento'}
                </Descriptions.Item>
                <Descriptions.Item label="Empleados Asignados">
                  {selectedPosition.holders?.length || 0}
                </Descriptions.Item>
              </Descriptions>
            </TabPane>

            <TabPane tab={`Requisitos de Competencias (${selectedPosition.requirements?.length || 0})`} key="2">
              {selectedPosition.requirements && selectedPosition.requirements.length > 0 ? (
                <List
                  dataSource={selectedPosition.requirements}
                  renderItem={(req) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{req.competency?.name}</Text>
                            <Tag>{req.competency?.category?.name}</Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <Text>Nivel requerido: {req.expectedLvl}/5</Text>
                            <Progress
                              percent={(req.expectedLvl / 5) * 100}
                              size="small"
                              style={{ marginLeft: 16, width: 150 }}
                            />
                            <br />
                            <Text>Ponderación: {req.weight}</Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No hay requisitos de competencias definidos" />
              )}
            </TabPane>

            <TabPane tab={`Empleados Asignados (${selectedPosition.holders?.length || 0})`} key="3">
              {selectedPosition.holders && selectedPosition.holders.length > 0 ? (
                <List
                  dataSource={selectedPosition.holders}
                  renderItem={(holder) => (
                    <List.Item
                      actions={[
                        <Button
                          size="small"
                          onClick={() => navigate(`/employees/${holder.employee.id}`)}
                        >
                          Ver Perfil
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={`${holder.employee.firstName} ${holder.employee.lastName}`}
                        description={
                          <div>
                            <Text>{holder.employee.title || 'Sin título'}</Text>
                            <br />
                            <Text type="secondary">
                              Desde: {new Date(holder.effectiveFrom).toLocaleDateString('es-ES')}
                              {holder.effectiveTo && ` - Hasta: ${new Date(holder.effectiveTo).toLocaleDateString('es-ES')}`}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No hay empleados asignados a este puesto" />
              )}
            </TabPane>

            <TabPane tab="Estadísticas" key="4">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Competencias Requeridas"
                    value={selectedPosition.requirements?.length || 0}
                    prefix={<BarChartOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Empleados Activos"
                    value={selectedPosition.holders?.filter(h => !h.effectiveTo).length || 0}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Historial de Empleados"
                    value={selectedPosition.holders?.length || 0}
                    prefix={<TeamOutlined />}
                  />
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        title="Crear Nuevo Puesto"
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
            label="Nombre del Puesto"
            name="name"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder="Nombre del puesto" />
          </Form.Item>

          <Form.Item label="Descripción" name="description">
            <TextArea rows={3} placeholder="Descripción del puesto" />
          </Form.Item>

          <Form.Item label="Nivel" name="level">
            <Select placeholder="Seleccionar nivel">
              <Option value="junior">Junior</Option>
              <Option value="senior">Senior</Option>
              <Option value="lead">Lead</Option>
              <Option value="manager">Manager</Option>
              <Option value="director">Director</Option>
              <Option value="executive">Executive</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Departamento" name="departmentId">
            <Select
              placeholder="Seleccionar departamento"
              options={departmentOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                Crear Puesto
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Editar Puesto"
        open={!!editing}
        onCancel={() => setEditing(null)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          initialValues={editing ? {
            name: editing.name,
            description: editing.description,
            level: editing.level,
            departmentId: editing.departmentId,
          } : {}}
          onFinish={(values) => updateMutation.mutate({ id: editing.id, data: values })}
        >
          <Form.Item
            label="Nombre del Puesto"
            name="name"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder="Nombre del puesto" />
          </Form.Item>

          <Form.Item label="Descripción" name="description">
            <TextArea rows={3} placeholder="Descripción del puesto" />
          </Form.Item>

          <Form.Item label="Nivel" name="level">
            <Select placeholder="Seleccionar nivel">
              <Option value="junior">Junior</Option>
              <Option value="senior">Senior</Option>
              <Option value="lead">Lead</Option>
              <Option value="manager">Manager</Option>
              <Option value="director">Director</Option>
              <Option value="executive">Executive</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Departamento" name="departmentId">
            <Select
              placeholder="Seleccionar departamento"
              options={departmentOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Actualizar Puesto
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
