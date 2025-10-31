import React, { useState } from 'react'
import { Card, Form, Input, Button, message } from 'antd'
import api from '../services/api'

export default function Register() {
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const organizationId = localStorage.getItem('organizationId')
      if (!organizationId) {
        message.error('Primero crea o selecciona una organización')
        return
      }
      await api.post('/auth/register', { ...values, organizationId })
      message.success('Usuario creado. Ahora inicia sesión.')
      window.location.href = '/login'
    } catch (err) {
      message.error(err?.response?.data?.error || 'Error creando usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Card title="Registro de usuario" style={{ width: 420 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Nombre" name="firstName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Apellido" name="lastName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Correo Electrónico" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Contraseña" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Crear cuenta</Button>
        </Form>
      </Card>
    </div>
  )
}
