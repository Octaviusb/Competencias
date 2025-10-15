import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Typography, Form, Input, Button, Space, message, Card, Select, Modal, Popconfirm } from 'antd'
import api from '../../services/api'

export default function Competencies() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null) // { id, name, description, categoryId }
  const { data: categories, isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data,
  })
  const { data: competencies, isLoading } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => (await api.get('/competencies')).data,
  })

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/competencies', payload)).data,
    onSuccess: () => {
      message.success('Competencia creada')
      qc.invalidateQueries({ queryKey: ['competencies'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando competencia'),
  })

  const onFinish = (values) => createMutation.mutate(values)

  const categoryOptions = useMemo(() => (categories || []).map(c => ({ value: c.id, label: c.name })), [categories])

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, description, categoryId }) => (await api.put(`/competencies/${id}`, { name, description, categoryId })).data,
    onSuccess: () => {
      message.success('Competencia actualizada')
      qc.invalidateQueries({ queryKey: ['competencies'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando competencia'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/competencies/${id}`)).data,
    onSuccess: () => {
      message.success('Competencia eliminada')
      qc.invalidateQueries({ queryKey: ['competencies'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'No se pudo eliminar la competencia'),
  })

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3}>Competencias</Typography.Title>

      <Card title="Nueva competencia">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true, min: 2 }]}>
            <Input placeholder="Nombre" />
          </Form.Item>
          <Form.Item label="Descripción" name="description" rules={[{ required: true, min: 4 }]}>
            <Input.TextArea rows={3} placeholder="Descripción" />
          </Form.Item>
          <Form.Item label="Categoría" name="categoryId" rules={[{ required: true }]}>
            <Select options={categoryOptions} loading={loadingCats} placeholder="Selecciona una categoría"/>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Crear</Button>
        </Form>
      </Card>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={competencies || []}
        columns={[
          { title: 'Nombre', dataIndex: 'name' },
          { title: 'Descripción', dataIndex: 'description' },
          { title: 'Categoría', dataIndex: ['category','name'] },
          { title: 'ID', dataIndex: 'id' },
          {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => setEditing({ id: record.id, name: record.name, description: record.description, categoryId: record.category?.id })}>Editar</Button>
                <Popconfirm title="¿Eliminar competencia?" okText="Sí" cancelText="No" onConfirm={() => deleteMutation.mutate(record.id)}>
                  <Button size="small" danger loading={deleteMutation.isPending && deleteMutation.variables === record.id}>Eliminar</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="Editar competencia"
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={() => {
          const name = document.getElementById('comp-edit-name')?.value?.trim()
          const description = document.getElementById('comp-edit-description')?.value?.trim()
          const categoryId = document.getElementById('comp-edit-category')?.getAttribute('data-value') || editing?.categoryId
          if (!name || name.length < 2) return message.error('Nombre inválido')
          if (!description || description.length < 4) return message.error('Descripción inválida')
          if (!categoryId) return message.error('Categoría requerida')
          updateMutation.mutate({ id: editing.id, name, description, categoryId })
        }}
        confirmLoading={updateMutation.isPending}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form layout="vertical">
          <Form.Item label="Nombre">
            <Input id="comp-edit-name" defaultValue={editing?.name} autoFocus />
          </Form.Item>
          <Form.Item label="Descripción">
            <Input.TextArea id="comp-edit-description" defaultValue={editing?.description} rows={3} />
          </Form.Item>
          <Form.Item label="Categoría">
            <Select
              id="comp-edit-category"
              defaultValue={editing?.categoryId}
              options={categoryOptions}
              loading={loadingCats}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
