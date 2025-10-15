import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, message, Card, Statistic, Row, Col } from 'antd';
import { ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [summary, setSummary] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRecords();
    fetchEmployees();
    fetchSummary();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attendance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      message.error('Error loading attendance records');
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
      message.error('Error loading employees');
    }
  };

  const fetchSummary = async () => {
    try {
      const currentMonth = dayjs().month() + 1;
      const currentYear = dayjs().year();
      const response = await fetch(`/api/attendance/summary?month=${currentMonth}&year=${currentYear}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      message.error('Error loading summary');
    }
  };

  const handleClockAction = async (employeeId, type) => {
    try {
      const response = await fetch('/api/attendance/clock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ employeeId, type })
      });

      if (response.ok) {
        message.success(`Clock ${type} successful`);
        fetchRecords();
      } else {
        message.error(`Error with clock ${type}`);
      }
    } catch (error) {
      message.error(`Error with clock ${type}`);
    }
  };

  const handleManualEntry = async (values) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          employeeId: values.employeeId,
          date: values.date.format('YYYY-MM-DD'),
          checkIn: values.checkIn?.format('HH:mm'),
          checkOut: values.checkOut?.format('HH:mm'),
          status: values.status,
          notes: values.notes
        })
      });

      if (response.ok) {
        message.success('Attendance record created successfully');
        setModalVisible(false);
        form.resetFields();
        fetchRecords();
      } else {
        message.error('Error creating attendance record');
      }
    } catch (error) {
      message.error('Error creating attendance record');
    }
  };

  const columns = [
    {
      title: 'Empleado',
      dataIndex: ['employee', 'firstName'],
      render: (_, record) => `${record.employee.firstName} ${record.employee.lastName}`
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Check In',
      dataIndex: 'checkIn',
      render: (time) => time ? dayjs(time).format('HH:mm') : '-'
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOut',
      render: (time) => time ? dayjs(time).format('HH:mm') : '-'
    },
    {
      title: 'Hours Worked',
      dataIndex: 'hoursWorked',
      render: (hours) => hours ? `${hours.toFixed(2)}h` : '-'
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status) => status.replace('_', ' ').toUpperCase()
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <div>
          <Button
            size="small"
            onClick={() => handleClockAction(record.employeeId, 'in')}
            disabled={record.checkIn}
          >
            Clock In
          </Button>
          <Button
            size="small"
            style={{ marginLeft: 8 }}
            onClick={() => handleClockAction(record.employeeId, 'out')}
            disabled={!record.checkIn || record.checkOut}
          >
            Clock Out
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Days" value={summary.totalDays || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Present Days" value={summary.presentDays || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Hours" value={summary.totalHours || 0} precision={1} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Overtime Hours" value={summary.overtimeHours || 0} precision={1} />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Attendance Records</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Manual Entry
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={records}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Manual Attendance Entry"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleManualEntry} layout="vertical">
          <Form.Item name="employeeId" label="Empleado" rules={[{ required: true }]}>
            <Select placeholder="Select employee">
              {employees.map(emp => (
                <Select.Option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="date" label="Fecha" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="checkIn" label="Check In Time">
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="checkOut" label="Check Out Time">
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="status" label="Estado" rules={[{ required: true }]}>
            <Select placeholder="Select status">
              <Select.Option value="present">Present</Select.Option>
              <Select.Option value="absent">Absent</Select.Option>
              <Select.Option value="late">Late</Select.Option>
              <Select.Option value="half_day">Half Day</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Save Record
            </Button>
            <Button onClick={() => setModalVisible(false)}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Attendance;