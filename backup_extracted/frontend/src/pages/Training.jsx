import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tabs, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, BookOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;

const Training = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);
  const [courseForm] = Form.useForm();
  const [enrollForm] = Form.useForm();

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
    fetchEmployees();
    fetchStats();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/training/courses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      message.error('Error loading courses');
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/training/enrollments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      message.error('Error loading enrollments');
    }
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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/training/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      message.error('Error loading statistics');
    }
  };

  const handleCreateCourse = async (values) => {
    try {
      const response = await fetch('/api/training/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Course created successfully');
        setCourseModalVisible(false);
        courseForm.resetFields();
        fetchCourses();
        fetchStats();
      } else {
        message.error('Error creating course');
      }
    } catch (error) {
      message.error('Error creating course');
    }
  };

  const handleEnrollEmployee = async (values) => {
    try {
      const response = await fetch('/api/training/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Employee enrolled successfully');
        setEnrollModalVisible(false);
        enrollForm.resetFields();
        fetchEnrollments();
        fetchStats();
      } else {
        message.error('Error enrolling employee');
      }
    } catch (error) {
      message.error('Error enrolling employee');
    }
  };

  const handleUpdateEnrollment = async (id, status) => {
    try {
      const response = await fetch(`/api/training/enrollments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status,
          completedDate: status === 'completed' ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        message.success(`Enrollment ${status} successfully`);
        fetchEnrollments();
        fetchStats();
      } else {
        message.error(`Error updating enrollment`);
      }
    } catch (error) {
      message.error(`Error updating enrollment`);
    }
  };

  const courseColumns = [
    { title: 'Title', dataIndex: 'title' },
    { title: 'Provider', dataIndex: 'provider' },
    { title: 'Duration (hours)', dataIndex: 'duration' },
    { title: 'Cost', dataIndex: 'cost', render: (cost) => cost ? `$${cost}` : '-' },
    { title: 'Max Participants', dataIndex: 'maxParticipants' },
    { title: 'Enrollments', dataIndex: ['_count', 'enrollments'] },
    { title: 'Estado', dataIndex: 'status' }
  ];

  const enrollmentColumns = [
    {
      title: 'Empleado',
      render: (_, record) => `${record.employee.firstName} ${record.employee.lastName}`
    },
    { title: 'Course', dataIndex: ['course', 'title'] },
    { title: 'Estado', dataIndex: 'status' },
    { title: 'Enrolled Date', dataIndex: 'enrolledDate', render: (date) => new Date(date).toLocaleDateString() },
    { title: 'Fecha de Inicio', dataIndex: 'startDate', render: (date) => date ? new Date(date).toLocaleDateString() : '-' },
    { title: 'Completed Date', dataIndex: 'completedDate', render: (date) => date ? new Date(date).toLocaleDateString() : '-' },
    { title: 'Puntuación', dataIndex: 'score' },
    {
      title: 'Acciones',
      render: (_, record) => (
        <div>
          {record.status === 'enrolled' && (
            <Button size="small" onClick={() => handleUpdateEnrollment(record.id, 'in_progress')}>
              Start
            </Button>
          )}
          {record.status === 'in_progress' && (
            <Button size="small" type="primary" onClick={() => handleUpdateEnrollment(record.id, 'completed')}>
              Complete
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Courses" value={stats.totalCourses || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Total Enrollments" value={stats.totalEnrollments || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Completado" value={stats.completedEnrollments || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Completion Rate" value={stats.completionRate || 0} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="courses">
        <TabPane tab="Training Courses" key="courses">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h2>Training Courses</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCourseModalVisible(true)}>
              New Course
            </Button>
          </div>
          <Table columns={courseColumns} dataSource={courses} loading={loading} rowKey="id" />
        </TabPane>

        <TabPane tab="Enrollments" key="enrollments">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h2>Training Enrollments</h2>
            <Button type="primary" icon={<BookOutlined />} onClick={() => setEnrollModalVisible(true)}>
              Enroll Employee
            </Button>
          </div>
          <Table columns={enrollmentColumns} dataSource={enrollments} loading={loading} rowKey="id" />
        </TabPane>
      </Tabs>

      <Modal title="New Training Course" open={courseModalVisible} onCancel={() => setCourseModalVisible(false)} footer={null}>
        <Form form={courseForm} onFinish={handleCreateCourse} layout="vertical">
          <Form.Item name="title" label="Course Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="provider" label="Provider">
            <Input />
          </Form.Item>
          <Form.Item name="duration" label="Duration (hours)">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="cost" label="Cost">
            <Input type="number" prefix="$" />
          </Form.Item>
          <Form.Item name="maxParticipants" label="Max Participants">
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Create Course</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setCourseModalVisible(false)}>Cancelar</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Enroll Employee" open={enrollModalVisible} onCancel={() => setEnrollModalVisible(false)} footer={null}>
        <Form form={enrollForm} onFinish={handleEnrollEmployee} layout="vertical">
          <Form.Item name="employeeId" label="Empleado" rules={[{ required: true }]}>
            <Select placeholder="Select employee">
              {employees.map(emp => (
                <Select.Option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="courseId" label="Course" rules={[{ required: true }]}>
            <Select placeholder="Select course">
              {courses.map(course => (
                <Select.Option key={course.id} value={course.id}>
                  {course.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Enroll Employee</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setEnrollModalVisible(false)}>Cancelar</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Training;