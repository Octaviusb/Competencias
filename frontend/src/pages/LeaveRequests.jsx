import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Tag, Space } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRequests();
    fetchEmployees();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leave-requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      message.error('Error cargando solicitudes de vacaciones');
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      message.error('Error cargando empleados');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const [startDate, endDate] = values.dateRange;
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employeeId: values.employeeId,
          type: values.type,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          reason: values.reason
        })
      });

      if (response.ok) {
        message.success('Solicitud de vacaciones creada exitosamente');
        setModalVisible(false);
        form.resetFields();
        fetchRequests();
      } else {
        message.error('Error creando solicitud de vacaciones');
      }
    } catch (error) {
      message.error('Error creando solicitud de vacaciones');
    }
  };

  const handleStatusChange = async (id, status, rejectionReason = null) => {
    try {
      const response = await fetch(`/api/leave-requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, rejectionReason })
      });

      if (response.ok) {
        message.success(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`);
        fetchRequests();
      } else {
        message.error(`Error ${status === 'approved' ? 'aprobando' : 'rechazando'} solicitud`);
      }
    } catch (error) {
      message.error(`Error ${status === 'approved' ? 'aprobando' : 'rechazando'} solicitud`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      cancelled: 'gray'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Empleado',
      dataIndex: ['employee', 'firstName'],
      render: (_, record) => `${record.employee.firstName} ${record.employee.lastName}`
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      render: (type) => type.replace('_', ' ').toUpperCase()
    },
    {
      title: 'Fecha Inicio',
      dataIndex: 'startDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Fecha Fin',
      dataIndex: 'endDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Días',
      dataIndex: 'days'
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        record.status === 'pending' && (
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleStatusChange(record.id, 'approved')}
            >
              Aprobar
            </Button>
            <Button
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => handleStatusChange(record.id, 'rejected')}
            >
              Rechazar
            </Button>
          </Space>
        )
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Solicitudes de Vacaciones</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Nueva Solicitud
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={requests}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Nueva Solicitud de Vacaciones"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="employeeId" label="Empleado" rules={[{ required: true }]}>
            <Select placeholder="Seleccionar empleado">
              {employees.map(emp => (
                <Select.Option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="type" label="Tipo de Permiso" rules={[{ required: true }]}>
            <Select placeholder="Seleccionar tipo de permiso">
              <Select.Option value="vacation">Vacaciones</Select.Option>
              <Select.Option value="sick">Incapacidad Médica</Select.Option>
              <Select.Option value="personal">Permiso Personal</Select.Option>
              <Select.Option value="maternity">Licencia de Maternidad</Select.Option>
              <Select.Option value="paternity">Licencia de Paternidad</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="dateRange" label="Rango de Fechas" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="reason" label="Motivo">
            <TextArea rows={3} placeholder="Motivo opcional para el permiso" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Enviar Solicitud
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveRequests;