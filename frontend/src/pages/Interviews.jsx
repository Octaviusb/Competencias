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
  InputNumber,
  Statistic,
  Checkbox,
  Empty
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  UserOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  MessageOutlined
} from '@ant-design/icons'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

export default function Interviews() {
  const qc = useQueryClient()
  const [form] = Form.useForm()
  const [editing, setEditing] = useState(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [conducting, setConducting] = useState(null)
  const [completing, setCompleting] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedQuestions, setSelectedQuestions] = useState([])

  // Queries
  const { data: interviews, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => (await api.get('/interviews')).data,
  })

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data,
  })

  const { data: competencies } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => (await api.get('/competencies')).data,
  })

  const { data: interviewStats } = useQuery({
    queryKey: ['interviewStats'],
    queryFn: async () => (await api.get('/interviews/stats/overview')).data,
  })

  const { data: templates } = useQuery({
    queryKey: ['interviewTemplates', selectedType],
    queryFn: async () => selectedType ? (await api.get(`/interviews/templates/${selectedType}`)).data : null,
    enabled: !!selectedType,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data) => (await api.post('/interviews', {
      ...data,
      questions: selectedQuestions.map((q, index) => ({
        question: q,
        category: 'behavioral', // default, can be improved
        order: index + 1,
        required: true,
      }))
    })).data,
    onSuccess: () => {
      message.success('Entrevista creada exitosamente')
      qc.invalidateQueries({ queryKey: ['interviews'] })
      setIsCreateModalVisible(false)
      setSelectedType('')
      setSelectedQuestions([])
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando entrevista'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => (await api.put(`/interviews/${id}`, data)).data,
    onSuccess: () => {
      message.success('Entrevista actualizada exitosamente')
      qc.invalidateQueries({ queryKey: ['interviews'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando entrevista'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/interviews/${id}`)).data,
    onSuccess: () => {
      message.success('Entrevista eliminada exitosamente')
      qc.invalidateQueries({ queryKey: ['interviews'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error eliminando entrevista'),
  })

  const startInterviewMutation = useMutation({
    mutationFn: async (id) => (await api.post(`/interviews/${id}/start`)).data,
    onSuccess: () => {
      message.success('Entrevista iniciada')
      qc.invalidateQueries({ queryKey: ['interviews'] })
      setConducting(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error iniciando entrevista'),
  })

  const completeInterviewMutation = useMutation({
    mutationFn: async (id) => (await api.post(`/interviews/${id}/complete`)).data,
    onSuccess: () => {
      message.success('Entrevista completada')
      qc.invalidateQueries({ queryKey: ['interviews'] })
      setCompleting(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error completando entrevista'),
  })

  const addAnswerMutation = useMutation({
    mutationFn: async ({ interviewId, questionId, answer, rating, followUp }) =>
      (await api.post(`/interviews/${interviewId}/questions/${questionId}/answers`, {
        answer, rating, followUp
      })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error guardando respuesta'),
  })

  const addEvaluationMutation = useMutation({
    mutationFn: async ({ interviewId, competencyId, rating, comments, strengths, improvements }) =>
      (await api.post(`/interviews/${interviewId}/evaluations`, {
        competencyId, rating, comments, strengths, improvements
      })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error guardando evaluación'),
  })

  const addNoteMutation = useMutation({
    mutationFn: async ({ interviewId, content, category }) =>
      (await api.post(`/interviews/${interviewId}/notes`, { content, category })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error guardando nota'),
  })

  // Filtered interviews based on search
  const filteredInterviews = interviews?.filter(int =>
    int.employee?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    int.employee?.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    int.interviewer?.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
    int.interviewer?.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
    int.type.toLowerCase().includes(searchText.toLowerCase())
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
      title: 'Entrevistador',
      key: 'interviewer',
      render: (_, record) => (
        <Space>
          <Avatar icon={<PhoneOutlined />} size="small" />
          <div>
            <div style={{ fontSize: '14px' }}>
              {record.interviewer?.firstName} {record.interviewer?.lastName}
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
          desempeño: 'Desempeño',
          desarrollo: 'Desarrollo',
          salida: 'Salida',
          promoción: 'Promoción',
          incorporación: 'Incorporación'
        }
        return <Tag color="blue">{typeLabels[type] || type}</Tag>
      },
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status) => {
        const statusLabels = {
          scheduled: 'Programada',
          in_progress: 'En Progreso',
          completed: 'Completada',
          cancelled: 'Cancelada',
          postponed: 'Pospuesta'
        }
        const colors = {
          scheduled: 'orange',
          in_progress: 'blue',
          completed: 'green',
          cancelled: 'red',
          postponed: 'purple'
        }
        return <Tag color={colors[status]}>{statusLabels[status] || status}</Tag>
      },
    },
    {
      title: 'Fecha Programada',
      dataIndex: 'scheduledDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'N/A',
    },
    {
      title: 'Duración',
      dataIndex: 'duration',
      render: (duration) => duration ? `${duration} min` : 'N/A',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'scheduled' && (
            <Tooltip title="Iniciar Entrevista">
              <Button
                size="small"
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => setConducting(record)}
                loading={startInterviewMutation.isPending && startInterviewMutation.variables === record.id}
              />
            </Tooltip>
          )}
          {record.status === 'in_progress' && (
            <Tooltip title="Completar Entrevista">
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setCompleting(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Editar">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => setEditing(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Eliminar entrevista?"
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
        title={<><PhoneOutlined style={{ marginRight: 8 }} />Gestión de Entrevistas</>}
        subtitle="Programa y gestiona entrevistas de desempeño"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
          >
            Nueva Entrevista
          </Button>
        }
      />

      {/* Statistics Cards */}
      {interviewStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Card>
            <Statistic
              title="Total de Entrevistas"
              value={interviewStats.totalInterviews}
              prefix={<PhoneOutlined />}
            />
          </Card>
          <Card>
            <Statistic
              title="Entrevistas Completadas"
              value={interviewStats.completedInterviews}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${interviewStats.totalInterviews}`}
            />
          </Card>
          <Card>
            <Statistic
              title="Tasa de Completación"
              value={interviewStats.completionRate}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              precision={1}
            />
          </Card>
          <Card>
            <Statistic
              title="Duración Promedio"
              value={interviewStats.averageDuration || 0}
              prefix={<MessageOutlined />}
              suffix=" min"
              precision={1}
            />
          </Card>
        </div>
      )}

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Buscar entrevistas..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
          />
        </div>

        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={filteredInterviews}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} entrevistas`,
          }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Crear Nueva Entrevista"
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false)
          setSelectedType('')
          setSelectedQuestions([])
        }}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          onFinish={(values) => createMutation.mutate({
            ...values,
            scheduledDate: values.scheduledDate?.toISOString(),
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
            label="Entrevistador"
            name="interviewerId"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select
              placeholder="Seleccionar entrevistador"
              options={employeeOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Tipo de Entrevista"
            name="type"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select
              placeholder="Seleccionar tipo"
              onChange={(value) => {
                setSelectedType(value)
                setSelectedQuestions([])
              }}
            >
              <Option value="performance">Desempeño</Option>
              <Option value="development">Desarrollo</Option>
              <Option value="exit">Salida</Option>
              <Option value="promotion">Promoción</Option>
              <Option value="onboarding">Incorporación</Option>
            </Select>
          </Form.Item>

          {templates && templates.length > 0 && (
            <Form.Item label="Preguntas de Plantilla">
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 8, borderRadius: 4 }}>
                <Checkbox.Group
                  options={templates.flatMap(cat => cat.questions)}
                  value={selectedQuestions}
                  onChange={setSelectedQuestions}
                />
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Selecciona las preguntas que deseas incluir en la entrevista
              </Text>
            </Form.Item>
          )}

          <Form.Item label="Propósito" name="purpose">
            <TextArea rows={2} placeholder="Propósito de la entrevista" />
          </Form.Item>

          <Form.Item
            label="Fecha Programada"
            name="scheduledDate"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Seleccionar fecha y hora"
            />
          </Form.Item>

          <Form.Item label="Duración (minutos)" name="duration">
            <InputNumber
              min={15}
              max={480}
              placeholder="Duración en minutos"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Ubicación" name="location">
            <Input placeholder="Ubicación física o virtual" />
          </Form.Item>

          <Form.Item label="Enlace Virtual" name="virtualLink">
            <Input placeholder="Enlace de reunión virtual" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                Crear Entrevista
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Editar Entrevista"
        open={!!editing}
        onCancel={() => setEditing(null)}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          initialValues={editing ? {
            employeeId: editing.employeeId,
            interviewerId: editing.interviewerId,
            type: editing.type,
            purpose: editing.purpose,
            scheduledDate: editing.scheduledDate ? dayjs(editing.scheduledDate) : null,
            duration: editing.duration,
            location: editing.location,
            virtualLink: editing.virtualLink,
            status: editing.status,
          } : {}}
          onFinish={(values) => updateMutation.mutate({
            id: editing.id,
            data: {
              ...values,
              scheduledDate: values.scheduledDate?.toISOString(),
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
            label="Entrevistador"
            name="interviewerId"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select
              placeholder="Seleccionar entrevistador"
              options={employeeOptions}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="Tipo de Entrevista"
            name="type"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select placeholder="Seleccionar tipo">
              <Option value="performance">Desempeño</Option>
              <Option value="development">Desarrollo</Option>
              <Option value="exit">Salida</Option>
              <Option value="promotion">Promoción</Option>
              <Option value="onboarding">Incorporación</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Propósito" name="purpose">
            <TextArea rows={2} placeholder="Propósito de la entrevista" />
          </Form.Item>

          <Form.Item
            label="Fecha Programada"
            name="scheduledDate"
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Seleccionar fecha y hora"
            />
          </Form.Item>

          <Form.Item label="Duración (minutos)" name="duration">
            <InputNumber
              min={15}
              max={480}
              placeholder="Duración en minutos"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Ubicación" name="location">
            <Input placeholder="Ubicación física o virtual" />
          </Form.Item>

          <Form.Item label="Enlace Virtual" name="virtualLink">
            <Input placeholder="Enlace de reunión virtual" />
          </Form.Item>

          <Form.Item label="Estado" name="status">
            <Select>
              <Option value="scheduled">Programada</Option>
              <Option value="in_progress">En Progreso</Option>
              <Option value="completed">Completada</Option>
              <Option value="cancelled">Cancelada</Option>
              <Option value="postponed">Pospuesta</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
                Actualizar Entrevista
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Conduct Interview Modal */}
      <Modal
        title={`Conduciendo Entrevista: ${conducting?.employee?.firstName} ${conducting?.employee?.lastName}`}
        open={!!conducting}
        onCancel={() => setConducting(null)}
        footer={null}
        width={900}
      >
        {conducting && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Preguntas y Respuestas" size="small">
              {conducting.questions && conducting.questions.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {conducting.questions.map((question, index) => (
                    <Card key={question.id} size="small" style={{ backgroundColor: '#f9f9f9' }}>
                      <Form
                        layout="vertical"
                        onFinish={(values) => addAnswerMutation.mutate({
                          interviewId: conducting.id,
                          questionId: question.id,
                          answer: values.answer,
                          rating: values.rating,
                          followUp: values.followUp,
                        })}
                      >
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>Pregunta {index + 1}: </Text>
                          <Text>{question.question}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Categoría: {question.category}
                          </Text>
                        </div>

                        {question.answers && question.answers.length > 0 ? (
                          <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#fff' }}>
                            <Text strong>Respuesta registrada:</Text>
                            <p>{question.answers[0].answer}</p>
                            {question.answers[0].rating && (
                              <p><Text strong>Calificación:</Text> {question.answers[0].rating}/5</p>
                            )}
                            {question.answers[0].followUp && (
                              <p><Text strong>Seguimiento:</Text> {question.answers[0].followUp}</p>
                            )}
                          </div>
                        ) : (
                          <>
                            <Form.Item
                              label="Respuesta"
                              name="answer"
                              rules={[{ required: true, message: 'Respuesta requerida' }]}
                            >
                              <TextArea rows={3} placeholder="Escriba la respuesta del empleado" />
                            </Form.Item>

                            <Form.Item label="Calificación (1-5)" name="rating">
                              <InputNumber min={1} max={5} placeholder="1-5" />
                            </Form.Item>

                            <Form.Item label="Comentarios de seguimiento" name="followUp">
                              <TextArea rows={2} placeholder="Comentarios adicionales" />
                            </Form.Item>

                            <Form.Item>
                              <Button type="primary" htmlType="submit" size="small">
                                Guardar Respuesta
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form>
                    </Card>
                  ))}
                </Space>
              ) : (
                <Empty description="No hay preguntas definidas para esta entrevista" />
              )}
            </Card>

            <Card title="Agregar Nota" size="small">
              <Form
                layout="vertical"
                onFinish={(values) => {
                  addNoteMutation.mutate({
                    interviewId: conducting.id,
                    content: values.content,
                    category: values.category,
                  })
                  // Reset form
                  form.resetFields()
                }}
              >
                <Form.Item
                  label="Nota"
                  name="content"
                  rules={[{ required: true, message: 'Contenido requerido' }]}
                >
                  <TextArea rows={3} placeholder="Agregar una nota sobre la entrevista" />
                </Form.Item>

                <Form.Item label="Categoría" name="category">
                  <Select placeholder="Seleccionar categoría">
                    <Option value="general">General</Option>
                    <Option value="concern">Preocupación</Option>
                    <Option value="strength">Fortaleza</Option>
                    <Option value="action_item">Elemento de acción</Option>
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" size="small">
                    Agregar Nota
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Space>
        )}
      </Modal>

      {/* Complete Interview Modal */}
      <Modal
        title={`Completar Entrevista: ${completing?.employee?.firstName} ${completing?.employee?.lastName}`}
        open={!!completing}
        onCancel={() => setCompleting(null)}
        footer={null}
        width={900}
      >
        {completing && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Evaluación de Competencias" size="small">
              <Form
                layout="vertical"
                onFinish={(values) => {
                  if (values.competencyId && values.rating !== undefined) {
                    addEvaluationMutation.mutate({
                      interviewId: completing.id,
                      competencyId: values.competencyId,
                      rating: values.rating,
                      comments: values.comments,
                      strengths: values.strengths,
                      improvements: values.improvements,
                    })
                    // Reset form
                    form.resetFields()
                  }
                }}
              >
                <Form.Item
                  label="Competencia"
                  name="competencyId"
                  rules={[{ required: true, message: 'Competencia requerida' }]}
                >
                  <Select
                    placeholder="Seleccionar competencia"
                    options={competencies?.map(comp => ({
                      value: comp.id,
                      label: `${comp.name} (${comp.category?.name})`
                    })) || []}
                    showSearch
                    filterOption={(input, option) =>
                      option.label.toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Calificación (1-5)"
                  name="rating"
                  rules={[{ required: true, message: 'Calificación requerida' }]}
                >
                  <InputNumber min={1} max={5} placeholder="1-5" />
                </Form.Item>

                <Form.Item label="Comentarios" name="comments">
                  <TextArea rows={2} placeholder="Comentarios sobre la evaluación" />
                </Form.Item>

                <Form.Item label="Fortalezas" name="strengths">
                  <TextArea rows={2} placeholder="Fortalezas identificadas" />
                </Form.Item>

                <Form.Item label="Áreas de mejora" name="improvements">
                  <TextArea rows={2} placeholder="Áreas que necesitan mejora" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" size="small">
                    Agregar Evaluación
                  </Button>
                </Form.Item>
              </Form>

              {completing.evaluations && completing.evaluations.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Evaluaciones registradas:</Text>
                  <div style={{ marginTop: 8 }}>
                    {completing.evaluations.map((eval_, index) => (
                      <div key={index} style={{ padding: 8, backgroundColor: '#f5f5f5', marginBottom: 8, borderRadius: 4 }}>
                        <Text strong>{eval_.competency?.name}: </Text>
                        <Text>{eval_.rating}/5</Text>
                        {eval_.comments && <div><Text strong>Comentarios:</Text> {eval_.comments}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card title="Finalizar Entrevista" size="small">
              <Text>¿Está seguro de que desea completar esta entrevista? Una vez completada, no podrá agregar más información.</Text>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setCompleting(null)}>
                    Cancelar
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => completeInterviewMutation.mutate(completing.id)}
                    loading={completeInterviewMutation.isPending}
                  >
                    Completar Entrevista
                  </Button>
                </Space>
              </div>
            </Card>
          </Space>
        )}
      </Modal>
    </Space>
  )
}