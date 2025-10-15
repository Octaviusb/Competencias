import React, { useMemo, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Typography, Form, Input, Button, Space, message, Card, Select, Modal, InputNumber } from 'antd'
import api from '../../services/api'

export default function Positions() {
  const qc = useQueryClient()
  const [reqOpen, setReqOpen] = useState(false)
  const [activePos, setActivePos] = useState(null)

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data,
  })
  const { data: competencies } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => (await api.get('/competencies')).data,
  })
  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => (await api.get('/positions')).data,
  })

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/positions', payload)).data,
    onSuccess: () => { message.success('Puesto creado'); qc.invalidateQueries({ queryKey: ['positions'] }) },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando puesto'),
  })

  const onFinish = (values) => createMutation.mutate(values)

  const depOptions = useMemo(() => (departments || []).map(d => ({ value: d.id, label: d.name })), [departments])
  const compOptions = useMemo(() => (competencies || []).map(c => ({ value: c.id, label: `${c.name}` })), [competencies])

  const openRequirements = async (pos) => {
    try {
      const { data } = await api.get(`/positions/${pos.id}`)
      setActivePos(data)
      setReqOpen(true)
    } catch (e) { message.error('No se pudo cargar el puesto') }
  }

  const addRequirementMutation = useMutation({
    mutationFn: async ({ positionId, item }) => (await api.post(`/positions/${positionId}/requirements`, { items: [item] })).data,
    onSuccess: (data) => { message.success('Requisito agregado'); setActivePos(data); qc.invalidateQueries({ queryKey: ['positions'] }) },
    onError: (e) => message.error(e?.response?.data?.error || 'Error agregando requisito'),
  })

  const [reqForm] = Form.useForm()
  useEffect(() => { if (!reqOpen) reqForm.resetFields() }, [reqOpen])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3}>Puestos</Typography.Title>

      <Card title="Nuevo puesto">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true, min: 2 }]}>
            <Input placeholder="Ej. Ingeniero de Software" />
          </Form.Item>
          <Form.Item label="Descripción" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Nivel" name="level">
            <Input placeholder="Jr / Ssr / Sr" />
          </Form.Item>
          <Form.Item label="Departamento" name="departmentId">
            <Select allowClear options={depOptions} placeholder="Selecciona un departamento" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Crear</Button>
        </Form>
      </Card>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={positions || []}
        columns={[
          { title: 'Puesto', dataIndex: 'name' },
          { title: 'Nivel', dataIndex: 'level' },
          { title: 'Departamento', dataIndex: ['department','name'] },
          { title: 'Acciones', render: (_, r) => <Button onClick={() => openRequirements(r)}>Configurar requisitos</Button> },
        ]}
      />

      <Modal
        title={`Requisitos de ${activePos?.name || ''}`}
        open={reqOpen}
        onCancel={() => setReqOpen(false)}
        footer={null}
        width={720}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Table
            size="small"
            rowKey={(r) => r.id}
            dataSource={activePos?.requirements || []}
            columns={[
              { title: 'Competencia', dataIndex: ['competency','name'] },
              { title: 'Peso', dataIndex: 'weight' },
              { title: 'Nivel esperado', dataIndex: 'expectedLvl' },
            ]}
            pagination={false}
          />

          <Card title="Agregar requisito">
            <Form layout="inline" form={reqForm} onFinish={(v) => addRequirementMutation.mutate({ positionId: activePos.id, item: v })}>
              <Form.Item name="competencyId" rules={[{ required: true }]}>
                <Select style={{ minWidth: 260 }} options={compOptions} placeholder="Competencia" />
              </Form.Item>
              <Form.Item name="weight" rules={[{ required: true }]}> 
                <InputNumber placeholder="Peso (0-1)" min={0} max={1} step={0.1} />
              </Form.Item>
              <Form.Item name="expectedLvl" rules={[{ required: true }]}> 
                <InputNumber placeholder="Nivel (1-5)" min={1} max={5} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={addRequirementMutation.isPending}>Agregar</Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </Modal>
    </Space>
  )
}
