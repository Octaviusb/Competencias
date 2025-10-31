import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Typography, Form, Input, Button, Space, message, Card, Modal, Popconfirm } from 'antd'
import { TagsOutlined } from '@ant-design/icons'
import api from '../../services/api'
import PageHeader from '../../components/PageHeader'

export default function Categories() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null) // { id, name }
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data,
  })

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/categories', payload)).data,
    onSuccess: () => {
      message.success('Categoría creada')
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando categoría'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }) => (await api.put(`/categories/${id}`, { name })).data,
    onSuccess: () => {
      message.success('Categoría actualizada')
      qc.invalidateQueries({ queryKey: ['categories'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando categoría'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/categories/${id}`)).data,
    onSuccess: () => {
      message.success('Categoría eliminada')
      qc.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'No se pudo eliminar la categoría'),
  })

  const onFinish = (values) => createMutation.mutate(values)

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PageHeader
        title={<><TagsOutlined style={{ marginRight: 8 }} />Categorías</>}
        subtitle="Administra las categorías de competencias del sistema"
      />

      <Card title="Nueva categoría">
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
                <Button size="small" onClick={() => setEditing({ id: record.id, name: record.name })}>Editar</Button>
                <Popconfirm
                  title="¿Eliminar categoría?"
                  okText="Sí"
                  cancelText="No"
                  onConfirm={() => deleteMutation.mutate(record.id)}
                >
                  <Button size="small" danger loading={deleteMutation.isPending && deleteMutation.variables === record.id}>Eliminar</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="Editar categoría"
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={() => {
          const name = document.getElementById('cat-edit-name')?.value?.trim()
          if (!name || name.length < 2) return message.error('Nombre inválido')
          updateMutation.mutate({ id: editing.id, name })
        }}
        confirmLoading={updateMutation.isPending}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form layout="vertical">
          <Form.Item label="Nombre">
            <Input id="cat-edit-name" defaultValue={editing?.name} autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
