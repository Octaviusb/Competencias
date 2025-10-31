import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Typography, Form, Input, Button, Space, message, Card, Modal, Popconfirm } from 'antd'
import api from '../../services/api'

export default function Departments() {
  const [editing, setEditing] = useState(null)
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data,
  })

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/departments', payload)).data,
    onSuccess: () => {
      message.success('Departamento creado')
      qc.invalidateQueries({ queryKey: ['departments'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando departamento'),
  })

  const onFinish = (values) => createMutation.mutate(values)

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }) => (await api.put(`/departments/${id}`, { name })).data,
    onSuccess: () => {
      message.success('Departamento actualizado')
      qc.invalidateQueries({ queryKey: ['departments'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando departamento'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/departments/${id}`)).data,
    onSuccess: () => {
      message.success('Departamento eliminado')
      qc.invalidateQueries({ queryKey: ['departments'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'No se pudo eliminar el departamento'),
  })

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3}>Departamentos</Typography.Title>

      <Card title="Nuevo departamento">
        <Form layout="inline" onFinish={onFinish}>
          <Form.Item name="name" rules={[{ required: true, min: 2 }]}>
            <Input placeholder="Nombre" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Crear</Button>
          </Form.Item>
        </Form>
      </Card>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data || []}
        columns={[
          { title: 'Nombre', dataIndex: 'name' },
          { title: 'ID', dataIndex: 'id' },
          {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => setEditing({ id: record.id, name: record.name })}>
                  Editar
                </Button>
                <Popconfirm
                  title="¿Eliminar departamento?"
                  okText="Sí"
                  cancelText="No"
                  onConfirm={() => deleteMutation.mutate(record.id)}
                >
                  <Button size="small" danger loading={deleteMutation.isPending && deleteMutation.variables === record.id}>
                    Eliminar
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="Editar departamento"
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={() => {
          const name = document.getElementById('dep-edit-name')?.value?.trim()
          if (!name || name.length < 2) return message.error('Nombre inválido')
          updateMutation.mutate({ id: editing.id, name })
        }}
        confirmLoading={updateMutation.isPending}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" onFinish={() => {}}>
          <Form.Item label="Nombre">
            <Input id="dep-edit-name" defaultValue={editing?.name} autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
