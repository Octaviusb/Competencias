import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Typography, Form, Input, Button, Space, message, Card, Select, Modal, Popconfirm } from 'antd'
import api from '../../services/api'

export default function Employees() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(null) // { id, firstName, lastName, title, departmentId, managerId }

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data,
  })
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data,
  })

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/employees', payload)).data,
    onSuccess: () => {
      message.success('Empleado creado')
      qc.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error creando empleado'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }) => (await api.put(`/employees/${id}`, payload)).data,
    onSuccess: () => {
      message.success('Empleado actualizado')
      qc.invalidateQueries({ queryKey: ['employees'] })
      setEditing(null)
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Error actualizando empleado'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await api.delete(`/employees/${id}`)).data,
    onSuccess: () => {
      message.success('Empleado eliminado')
      qc.invalidateQueries({ queryKey: ['employees'] })
    },
    onError: (e) => message.error(e?.response?.data?.error || 'No se pudo eliminar el empleado'),
  })

  const onFinish = (values) => createMutation.mutate(values)

  const departmentOptions = useMemo(() => (departments || []).map(d => ({ value: d.id, label: d.name })), [departments])
  const managerOptions = useMemo(() => (employees || []).map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` })), [employees])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={3}>Empleados</Typography.Title>

      <Card title="Nuevo empleado">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Nombre" name="firstName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Apellido" name="lastName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Cargo" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="Departamento" name="departmentId">
            <Select allowClear options={departmentOptions} placeholder="Selecciona un departamento" />
          </Form.Item>
          <Form.Item label="Manager" name="managerId">
            <Select allowClear options={managerOptions} placeholder="Selecciona un manager" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Crear</Button>
        </Form>
      </Card>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={employees || []}
        columns={[
          { title: 'Nombre', render: (_, r) => `${r.firstName} ${r.lastName}` },
          { title: 'Cargo', dataIndex: 'title' },
          { title: 'Departamento', dataIndex: ['department','name'] },
          { title: 'Manager', render: (_, r) => r?.manager ? `${r.manager.firstName} ${r.manager.lastName}` : '-' },
          {
            title: 'Acciones',
            key: 'actions',
            render: (_, r) => (
              <Space>
                <Button size="small" onClick={() => setEditing({ id: r.id, firstName: r.firstName, lastName: r.lastName, title: r.title || '', departmentId: r.department?.id || null, managerId: r.manager?.id || null })}>Editar</Button>
                <Popconfirm title="¿Eliminar empleado?" okText="Sí" cancelText="No" onConfirm={() => deleteMutation.mutate(r.id)}>
                  <Button size="small" danger loading={deleteMutation.isPending && deleteMutation.variables === r.id}>Eliminar</Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />

      <Modal
        title="Editar empleado"
        open={!!editing}
        onCancel={() => setEditing(null)}
        onOk={() => {
          const firstName = document.getElementById('emp-edit-first')?.value?.trim()
          const lastName = document.getElementById('emp-edit-last')?.value?.trim()
          const title = document.getElementById('emp-edit-title')?.value?.trim()
          const depSelect = document.getElementById('emp-edit-dep')
          const mgrSelect = document.getElementById('emp-edit-mgr')
          const departmentId = depSelect?.getAttribute('data-value') || editing?.departmentId || null
          const managerId = mgrSelect?.getAttribute('data-value') || editing?.managerId || null
          if (!firstName) return message.error('Nombre requerido')
          if (!lastName) return message.error('Apellido requerido')
          updateMutation.mutate({ id: editing.id, firstName, lastName, title: title || null, departmentId, managerId })
        }}
        confirmLoading={updateMutation.isPending}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form layout="vertical">
          <Form.Item label="Nombre">
            <Input id="emp-edit-first" defaultValue={editing?.firstName} autoFocus />
          </Form.Item>
          <Form.Item label="Apellido">
            <Input id="emp-edit-last" defaultValue={editing?.lastName} />
          </Form.Item>
          <Form.Item label="Cargo">
            <Input id="emp-edit-title" defaultValue={editing?.title || ''} />
          </Form.Item>
          <Form.Item label="Departamento">
            <Select id="emp-edit-dep" allowClear options={departmentOptions} defaultValue={editing?.departmentId || undefined} placeholder="Selecciona un departamento" />
          </Form.Item>
          <Form.Item label="Manager">
            <Select id="emp-edit-mgr" allowClear options={managerOptions} defaultValue={editing?.managerId || undefined} placeholder="Selecciona un manager" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
