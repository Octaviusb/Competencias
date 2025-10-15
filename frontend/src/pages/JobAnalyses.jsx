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
  Tabs,
  List,
  Progress,
  InputNumber,
  Divider
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  MinusCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import api from '../services/api'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

export default function JobAnalyses() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [gapAnalysis, setGapAnalysis] = useState(null)
  const [showGapAnalysis, setShowGapAnalysis] = useState(false)

  // Queries
  const { data: jobAnalyses, isLoading } = useQuery({
    queryKey: ['job-analyses'],
    queryFn: async () => (await api.get('/job-analyses')).data,
  })

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => (await api.get('/positions')).data,
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data,
  })

  const { data: competencies } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => (await api.get('/competencies')).data,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data) => (await api.post('/job-analyses', data)).data,
    onSuccess: () => {
      message.success('Análisis de puesto creado exitosamente')
      qc.invalidateQueries({ queryKey: ['job-analyses'] })
      setIsCreateModalVisible(false)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando análisis'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => (await api.put(`/job-analyses/${id}`, data)).data,
    onSuccess: () => {
      message.success('Análisis de puesto actualizado exitosamente')
      qc.invalidateQueries({ queryKey: ['job-analyses'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando análisis'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/job-analyses/${id}`)).data,
    onSuccess: () => {
      message.success('Análisis de puesto eliminado exitosamente')
      qc.invalidateQueries({ queryKey: ['job-analyses'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error eliminando análisis'),
  })

  const loadGapAnalysis = async (analysisId) => {
    try {
      const response = await api.get(`/job-analyses/${analysisId}/gap-analysis`)
      setGapAnalysis(response.data)
      setShowGapAnalysis(true)
    } catch (error) {
      message.error('Error cargando análisis de brechas')
    }
  }

  // Filtered job analyses based on search
  const filteredAnalyses = jobAnalyses?.filter(analysis =>
    analysis.position?.name.toLowerCase().includes(searchText.toLowerCase()) ||
    analysis.occupant?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    analysis.occupant?.lastName.toLowerCase().includes(searchText.toLowerCase())
  ) || []

  const positionOptions = positions?.map(pos => ({
    value: pos.id,
    label: pos.name
  })) || []

  const employeeOptions = employees?.map(emp => ({
    value: emp.id,
    label: `${emp.firstName} ${emp.lastName}`
  })) || []

  const competencyOptions = competencies?.map(comp => ({
    value: comp.id,
    label: `${comp.name} (${comp.category?.name})`
  })) || []

  const columns = [
    {
      title: 'Puesto',
      key: 'position',
      render: (_, record) => (
        <Space>
          <Avatar icon={<TeamOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.position?.name}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.position?.department?.name}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Ocupante Actual',
      key: 'occupant',
      render: (_, record) => record.occupant ? (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div style={{ fontSize: '14px' }}>
              {record.occupant.firstName} {record.occupant.lastName}
            </div>
          </div>
        </Space>
      ) : (
        <Tag color="orange">Sin asignar</Tag>
      ),
    },
    {
      title: 'Supervisor',
      key: 'supervisor',
      render: (_, record) => record.supervisor ? (
        <div style={{ fontSize: '14px' }}>
          {record.supervisor.firstName} {record.supervisor.lastName}
        </div>
      ) : (
        <Text type="secondary">N/A</Text>
      ),
    },
    {
      title: 'Funciones',
      dataIndex: 'functions',
      render: (functions) => functions?.length || 0,
    },
    {
      title: 'Competencias',
      dataIndex: 'competencies',
      render: (competencies) => competencies?.length || 0,
    },
    {
      title: 'Última Actualización',
      dataIndex: 'updatedAt',
      render: (date) => date ? new Date(date).toLocaleDateString('es-ES') : 'N/A',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver Detalles">
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => setSelectedAnalysis(record)}
            />
          </Tooltip>
          <Tooltip title="Análisis de Brechas">
            <Button
              size="small"
              icon={<BarChartOutlined />}
              onClick={() => loadGapAnalysis(record.id)}
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
              title="¿Eliminar análisis de puesto?"
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
          <FileTextOutlined style={{ marginRight: 8 }} />
          Análisis de Puestos
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
        >
          Nuevo Análisis
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar análisis de puestos..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={filteredAnalyses}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} análisis`,
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Análisis de Puesto: ${selectedAnalysis?.position?.name}`}
        open={!!selectedAnalysis}
        onCancel={() => setSelectedAnalysis(null)}
        footer={null}
        width={800}
      >
        {selectedAnalysis && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Información General" key="1">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Puesto: </Text>
                  <Text>{selectedAnalysis.position?.name}</Text>
                </div>
                <div>
                  <Text strong>Departamento: </Text>
                  <Text>{selectedAnalysis.position?.department?.name || 'N/A'}</Text>
                </div>
                <div>
                  <Text strong>Ocupante: </Text>
                  <Text>{selectedAnalysis.occupant ?
                    `${selectedAnalysis.occupant.firstName} ${selectedAnalysis.occupant.lastName}` :
                    'Sin asignar'}</Text>
                </div>
                <div>
                  <Text strong>Supervisor: </Text>
                  <Text>{selectedAnalysis.supervisor ?
                    `${selectedAnalysis.supervisor.firstName} ${selectedAnalysis.supervisor.lastName}` :
                    'N/A'}</Text>
                </div>
                <div>
                  <Text strong>Propósito: </Text>
                  <Text>{selectedAnalysis.purpose || 'No especificado'}</Text>
                </div>
              </Space>
            </TabPane>

            <TabPane tab={`Funciones (${selectedAnalysis.functions?.length || 0})`} key="2">
              <List
                dataSource={selectedAnalysis.functions || []}
                renderItem={(func, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`Función ${func.index}: ${func.title}`}
                      description={
                        <div>
                          <p>{func.description}</p>
                          <div style={{ marginTop: 8 }}>
                            <Text strong>Importancia: </Text>
                            <Progress percent={(func.importance / 5) * 100} size="small" />
                            <Text strong style={{ marginLeft: 16 }}>Tiempo: </Text>
                            <Text>{func.timePercent}%</Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab={`Competencias (${selectedAnalysis.competencies?.length || 0})`} key="3">
              <List
                dataSource={selectedAnalysis.competencies || []}
                renderItem={(comp) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${comp.competency?.name} (${comp.competency?.category?.name})`}
                      description={
                        <div>
                          <Text strong>Nivel requerido: </Text>
                          <Text>{comp.requiredLevel}/5</Text>
                          <br />
                          <Text strong>Importancia: </Text>
                          <Text>{comp.importance}/5</Text>
                          {comp.acquisitionMethod && (
                            <>
                              <br />
                              <Text strong>Método de adquisición: </Text>
                              <Text>{comp.acquisitionMethod}</Text>
                            </>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab={`Expectativas (${selectedAnalysis.expectations?.length || 0})`} key="4">
              <List
                dataSource={selectedAnalysis.expectations || []}
                renderItem={(exp) => (
                  <List.Item>
                    <List.Item.Meta
                      title={exp.title}
                      description={
                        <div>
                          <p>{exp.description}</p>
                          {exp.measurementCriteria && (
                            <div>
                              <Text strong>Criterios de medición: </Text>
                              <Text>{exp.measurementCriteria}</Text>
                            </div>
                          )}
                          {exp.timeframe && (
                            <div>
                              <Text strong>Plazo: </Text>
                              <Text>{exp.timeframe}</Text>
                            </div>
                          )}
                          {exp.weight && (
                            <div>
                              <Text strong>Ponderación: </Text>
                              <Text>{exp.weight}</Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            <TabPane tab="Contexto del Puesto" key="5">
              {selectedAnalysis.context ? (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {selectedAnalysis.context.workEnvironment && (
                    <div>
                      <Text strong>Entorno de Trabajo: </Text>
                      <Text>{selectedAnalysis.context.workEnvironment}</Text>
                    </div>
                  )}
                  {selectedAnalysis.context.interpersonalRelationships && (
                    <div>
                      <Text strong>Relaciones Interpersonales: </Text>
                      <Text>{selectedAnalysis.context.interpersonalRelationships}</Text>
                    </div>
                  )}
                  {selectedAnalysis.context.toolsAndResources && (
                    <div>
                      <Text strong>Herramientas y Recursos: </Text>
                      <Text>{selectedAnalysis.context.toolsAndResources}</Text>
                    </div>
                  )}
                  {selectedAnalysis.context.trainingRequired && (
                    <div>
                      <Text strong>Capacitación Requerida: </Text>
                      <Text>{selectedAnalysis.context.trainingRequired}</Text>
                    </div>
                  )}
                  {selectedAnalysis.context.physicalDemands && (
                    <div>
                      <Text strong>Demandas Físicas: </Text>
                      <Text>{selectedAnalysis.context.physicalDemands}</Text>
                    </div>
                  )}
                  {selectedAnalysis.context.workingConditions && (
                    <div>
                      <Text strong>Condiciones de Trabajo: </Text>
                      <Text>{selectedAnalysis.context.workingConditions}</Text>
                    </div>
                  )}
                  {selectedAnalysis.context.travelRequirements && (
                    <div>
                      <Text strong>Requisitos de Viaje: </Text>
                      <Text>{selectedAnalysis.context.travelRequirements}</Text>
                    </div>
                  )}
                  {selectedAnalysis.context.safetyConsiderations && (
                    <div>
                      <Text strong>Consideraciones de Seguridad: </Text>
                      <Text>{selectedAnalysis.context.safetyConsiderations}</Text>
                    </div>
                  )}
                </Space>
              ) : (
                <Text type="secondary">No se ha definido el contexto del puesto</Text>
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        title="Crear Nuevo Análisis de Puesto"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            const data = {
              positionId: values.positionId,
              occupantEmployeeId: values.occupantEmployeeId,
              supervisorEmployeeId: values.supervisorEmployeeId,
              purpose: values.purpose,
              primaryDutyIndex: values.primaryDutyIndex,
              observations: values.observations,
              functions: values.functions || [],
              context: values.context ? {
                workEnvironment: values.context.workEnvironment,
                interpersonalRelationships: values.context.interpersonalRelationships,
                toolsAndResources: values.context.toolsAndResources,
                trainingRequired: values.context.trainingRequired,
                physicalDemands: values.context.physicalDemands,
                workingConditions: values.context.workingConditions,
                travelRequirements: values.context.travelRequirements,
                safetyConsiderations: values.context.safetyConsiderations,
              } : undefined,
              competencies: values.competencies || [],
              expectations: values.expectations || [],
            }
            createMutation.mutate(data)
          }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Información General" key="1">
              <Form.Item
                label="Puesto"
                name="positionId"
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Select
                  placeholder="Seleccionar puesto"
                  options={positionOptions}
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item label="Ocupante Actual" name="occupantEmployeeId">
                <Select
                  placeholder="Seleccionar empleado actual"
                  options={employeeOptions}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item label="Supervisor" name="supervisorEmployeeId">
                <Select
                  placeholder="Seleccionar supervisor"
                  options={employeeOptions}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item label="Propósito del Trabajo (Sección I)" name="purpose">
                <TextArea rows={3} placeholder="Describa el propósito principal del puesto" />
              </Form.Item>

              <Form.Item label="Función Primaria" name="primaryDutyIndex">
                <Select placeholder="Seleccionar función primaria (1-6)">
                  {[1,2,3,4,5,6].map(num => (
                    <Option key={num} value={num}>Función {num}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Observaciones" name="observations">
                <TextArea rows={2} placeholder="Observaciones adicionales" />
              </Form.Item>
            </TabPane>

            <TabPane tab="Funciones (Sección II)" key="2">
              <Form.List name="functions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>Función {name + 1}</Text>
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                            >
                              Remover
                            </Button>
                          </div>

                          <Form.Item
                            {...restField}
                            name={[name, 'index']}
                            label="Número de Función"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <InputNumber min={1} max={6} placeholder="1-6" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'title']}
                            label="Título"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <Input placeholder="Título de la función" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'description']}
                            label="Descripción"
                          >
                            <TextArea rows={2} placeholder="Descripción detallada" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'importance']}
                            label="Importancia (1-5)"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <InputNumber min={1} max={5} placeholder="1-5" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'timePercent']}
                            label="Tiempo (%)"
                          >
                            <InputNumber min={0} max={100} placeholder="0-100" />
                          </Form.Item>
                        </Space>
                      </div>
                    ))}

                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Agregar Función
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </TabPane>

            <TabPane tab="Contexto (Sección III)" key="3">
              <Form.Item label="Entorno de Trabajo" name={['context', 'workEnvironment']}>
                <TextArea rows={2} placeholder="Describa el entorno físico de trabajo" />
              </Form.Item>

              <Form.Item label="Relaciones Interpersonales" name={['context', 'interpersonalRelationships']}>
                <TextArea rows={2} placeholder="Describa las relaciones interpersonales" />
              </Form.Item>

              <Form.Item label="Herramientas y Recursos" name={['context', 'toolsAndResources']}>
                <TextArea rows={2} placeholder="Herramientas y recursos necesarios" />
              </Form.Item>

              <Form.Item label="Capacitación Requerida" name={['context', 'trainingRequired']}>
                <TextArea rows={2} placeholder="Capacitación específica requerida" />
              </Form.Item>

              <Form.Item label="Demandas Físicas" name={['context', 'physicalDemands']}>
                <TextArea rows={2} placeholder="Demandas físicas del puesto" />
              </Form.Item>

              <Form.Item label="Condiciones de Trabajo" name={['context', 'workingConditions']}>
                <TextArea rows={2} placeholder="Condiciones de trabajo" />
              </Form.Item>

              <Form.Item label="Requisitos de Viaje" name={['context', 'travelRequirements']}>
                <TextArea rows={2} placeholder="Requisitos de viaje" />
              </Form.Item>

              <Form.Item label="Consideraciones de Seguridad" name={['context', 'safetyConsiderations']}>
                <TextArea rows={2} placeholder="Consideraciones de seguridad" />
              </Form.Item>
            </TabPane>

            <TabPane tab="Competencias (Sección IV)" key="4">
              <Form.List name="competencies">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>Competencia {name + 1}</Text>
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                            >
                              Remover
                            </Button>
                          </div>

                          <Form.Item
                            {...restField}
                            name={[name, 'competencyId']}
                            label="Competencia"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <Select
                              placeholder="Seleccionar competencia"
                              options={competencyOptions}
                              showSearch
                              filterOption={(input, option) =>
                                option.label.toLowerCase().includes(input.toLowerCase())
                              }
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'importance']}
                            label="Importancia (1-5)"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <InputNumber min={1} max={5} placeholder="1-5" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'requiredLevel']}
                            label="Nivel Requerido (1-5)"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <InputNumber min={1} max={5} placeholder="1-5" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'acquisitionMethod']}
                            label="Método de Adquisición"
                          >
                            <Select placeholder="Seleccionar método">
                              <Option value="experience">Experiencia</Option>
                              <Option value="training">Capacitación</Option>
                              <Option value="education">Educación</Option>
                              <Option value="certification">Certificación</Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'validationMethod']}
                            label="Método de Validación"
                          >
                            <Input placeholder="Cómo se validará esta competencia" />
                          </Form.Item>
                        </Space>
                      </div>
                    ))}

                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Agregar Competencia
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </TabPane>

            <TabPane tab="Expectativas (Sección V)" key="5">
              <Form.List name="expectations">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ marginBottom: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 4 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>Expectativa {name + 1}</Text>
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                            >
                              Remover
                            </Button>
                          </div>

                          <Form.Item
                            {...restField}
                            name={[name, 'title']}
                            label="Título"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <Input placeholder="Título de la expectativa" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'description']}
                            label="Descripción"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <TextArea rows={2} placeholder="Descripción detallada" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'measurementCriteria']}
                            label="Criterios de Medición"
                          >
                            <TextArea rows={2} placeholder="Cómo se medirá el cumplimiento" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'timeframe']}
                            label="Plazo"
                          >
                            <Input placeholder="Plazo esperado (ej: 3 meses, 6 meses)" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'weight']}
                            label="Ponderación"
                          >
                            <InputNumber min={0} max={1} step={0.1} placeholder="0-1" />
                          </Form.Item>
                        </Space>
                      </div>
                    ))}

                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Agregar Expectativa
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </TabPane>
          </Tabs>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                Crear Análisis Completo
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Editar Análisis de Puesto"
        open={!!editing}
        onCancel={() => setEditing(null)}
        footer={null}
        width={800}
      >
        <Form
          layout="vertical"
          initialValues={editing ? {
            positionId: editing.positionId,
            occupantEmployeeId: editing.occupantEmployeeId,
            supervisorEmployeeId: editing.supervisorEmployeeId,
            purpose: editing.purpose,
            primaryDutyIndex: editing.primaryDutyIndex,
            observations: editing.observations,
            functions: editing.functions || [],
            context: editing.context || {},
            competencies: editing.competencies || [],
            expectations: editing.expectations || [],
          } : {}}
          onFinish={(values) => {
            const data = {
              occupantEmployeeId: values.occupantEmployeeId,
              supervisorEmployeeId: values.supervisorEmployeeId,
              purpose: values.purpose,
              primaryDutyIndex: values.primaryDutyIndex,
              observations: values.observations,
            }
            updateMutation.mutate({ id: editing.id, data })
          }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Información General" key="1">
              <Form.Item label="Ocupante Actual" name="occupantEmployeeId">
                <Select
                  placeholder="Seleccionar empleado actual"
                  options={employeeOptions}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item label="Supervisor" name="supervisorEmployeeId">
                <Select
                  placeholder="Seleccionar supervisor"
                  options={employeeOptions}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item label="Propósito del Trabajo (Sección I)" name="purpose">
                <TextArea rows={3} placeholder="Describa el propósito principal del puesto" />
              </Form.Item>

              <Form.Item label="Función Primaria" name="primaryDutyIndex">
                <Select placeholder="Seleccionar función primaria (1-6)">
                  {[1,2,3,4,5,6].map(num => (
                    <Option key={num} value={num}>Función {num}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Observaciones" name="observations">
                <TextArea rows={2} placeholder="Observaciones adicionales" />
              </Form.Item>
            </TabPane>

            <TabPane tab={`Funciones (${editing?.functions?.length || 0})`} key="2">
              <Text type="secondary">
                Las funciones se gestionan desde el backend. Para modificar funciones, use las rutas específicas de la API.
              </Text>
            </TabPane>

            <TabPane tab="Contexto del Puesto" key="3">
              <Text type="secondary">
                El contexto se gestiona desde el backend. Para modificar el contexto, use las rutas específicas de la API.
              </Text>
            </TabPane>

            <TabPane tab={`Competencias (${editing?.competencies?.length || 0})`} key="4">
              <Text type="secondary">
                Las competencias se gestionan desde el backend. Para modificar competencias, use las rutas específicas de la API.
              </Text>
            </TabPane>

            <TabPane tab={`Expectativas (${editing?.expectations?.length || 0})`} key="5">
              <Text type="secondary">
                Las expectativas se gestionan desde el backend. Para modificar expectativas, use las rutas específicas de la API.
              </Text>
            </TabPane>
          </Tabs>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Actualizar Información General
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Gap Analysis Modal */}
      <Modal
        title={`Análisis de Brechas - ${gapAnalysis?.jobAnalysis?.position?.name}`}
        open={showGapAnalysis}
        onCancel={() => setShowGapAnalysis(false)}
        footer={null}
        width={1000}
      >
        {gapAnalysis && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Summary Statistics */}
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Empleados Analizados"
                  value={gapAnalysis.summary.totalEmployees}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Con Brechas"
                  value={gapAnalysis.summary.employeesWithGaps}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: gapAnalysis.summary.employeesWithGaps > 0 ? '#cf1322' : '#3f8600' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Brecha Promedio"
                  value={gapAnalysis.summary.averageGap.toFixed(1)}
                  suffix="/5"
                  prefix={<BarChartOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Brechas Críticas"
                  value={gapAnalysis.summary.criticalGaps}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: gapAnalysis.summary.criticalGaps > 0 ? '#cf1322' : '#3f8600' }}
                />
              </Col>
            </Row>

            <Divider />

            {/* Detailed Gap Analysis */}
            <div>
              <Title level={4}>Análisis Detallado por Empleado</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                {gapAnalysis.gapAnalysis.map((employeeGap, index) => (
                  <Card key={index} title={`${employeeGap.employee.firstName} ${employeeGap.employee.lastName}`}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Brecha Total: </Text>
                        <Text style={{ color: employeeGap.totalGap > 0 ? '#cf1322' : '#3f8600' }}>
                          {employeeGap.totalGap.toFixed(1)}/5
                        </Text>
                        <Progress
                          percent={(employeeGap.totalGap / 5) * 100}
                          size="small"
                          status={employeeGap.totalGap > 0 ? 'exception' : 'success'}
                          style={{ marginLeft: 16, width: 200 }}
                        />
                      </div>

                      {employeeGap.priorityGaps.length > 0 && (
                        <div>
                          <Text strong style={{ color: '#cf1322' }}>
                            Brechas Críticas (Prioridad Alta):
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            {employeeGap.priorityGaps.map((gap, gapIndex) => (
                              <Card key={gapIndex} size="small" style={{ marginBottom: 8, borderColor: '#ffccc7' }}>
                                <div>
                                  <Text strong>{gap.competency.name}</Text>
                                  <br />
                                  <Text>Nivel requerido: {gap.requiredLevel}/5 | Nivel actual: {gap.currentLevel}/5</Text>
                                  <br />
                                  <Text>Brecha: {gap.gap.toFixed(1)} | Importancia: {gap.importance}/5</Text>
                                  {gap.acquisitionMethod && (
                                    <div style={{ marginTop: 4 }}>
                                      <Text type="secondary">
                                        Método sugerido: {gap.acquisitionMethod}
                                      </Text>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Text strong>Todas las Brechas:</Text>
                        <div style={{ marginTop: 8 }}>
                          {employeeGap.gaps.map((gap, gapIndex) => (
                            <div key={gapIndex} style={{ padding: 8, backgroundColor: '#f5f5f5', marginBottom: 4, borderRadius: 4 }}>
                              <Text strong>{gap.competency.name}</Text>
                              <br />
                              <Text>Nivel requerido: {gap.requiredLevel}/5 | Nivel actual: {gap.currentLevel}/5</Text>
                              <br />
                              <Text>Brecha: {gap.gap.toFixed(1)} | Importancia: {gap.importance}/5</Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Space>
                  </Card>
                ))}
              </Space>
            </div>
          </Space>
        )}
      </Modal>
    </Space>
  )
}