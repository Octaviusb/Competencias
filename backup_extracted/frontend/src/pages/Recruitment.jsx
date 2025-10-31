import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Tabs, Tag } from 'antd';
import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const Recruitment = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [jobForm] = Form.useForm();
  const [candidateForm] = Form.useForm();

  useEffect(() => {
    fetchJobs();
    fetchCandidates();
    fetchApplications();
    fetchPositions();
    fetchDepartments();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/recruitment/jobs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      message.error('Error loading job postings');
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/recruitment/candidates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      message.error('Error loading candidates');
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/recruitment/applications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      message.error('Error loading applications');
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      message.error('Error loading positions');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      message.error('Error loading departments');
    }
  };

  const handleCreateJob = async (values) => {
    try {
      const response = await fetch('/api/recruitment/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Job posting created successfully');
        setJobModalVisible(false);
        jobForm.resetFields();
        fetchJobs();
      } else {
        message.error('Error creating job posting');
      }
    } catch (error) {
      message.error('Error creating job posting');
    }
  };

  const handleCreateCandidate = async (values) => {
    try {
      const response = await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Candidate created successfully');
        setCandidateModalVisible(false);
        candidateForm.resetFields();
        fetchCandidates();
      } else {
        message.error('Error creating candidate');
      }
    } catch (error) {
      message.error('Error creating candidate');
    }
  };

  const jobColumns = [
    { title: 'Title', dataIndex: 'title' },
    { title: 'Departamento', dataIndex: ['department', 'name'] },
    { title: 'Employment Type', dataIndex: 'employmentType' },
    { title: 'Estado', dataIndex: 'status', render: (status) => <Tag color={status === 'active' ? 'green' : 'orange'}>{status}</Tag> },
    { title: 'Applications', dataIndex: ['_count', 'applications'] }
  ];

  const candidateColumns = [
    { title: 'Nombre', render: (_, record) => `${record.firstName} ${record.lastName}` },
    { title: 'Correo Electrónico', dataIndex: 'email' },
    { title: 'Teléfono', dataIndex: 'phone' },
    { title: 'Applications', dataIndex: ['_count', 'applications'] }
  ];

  const applicationColumns = [
    { title: 'Candidate', render: (_, record) => `${record.candidate.firstName} ${record.candidate.lastName}` },
    { title: 'Job', dataIndex: ['jobPosting', 'title'] },
    { title: 'Estado', dataIndex: 'status', render: (status) => <Tag>{status}</Tag> },
    { title: 'Applied Date', dataIndex: 'appliedDate', render: (date) => new Date(date).toLocaleDateString() }
  ];

  const tabItems = [
    {
      key: 'jobs',
      label: 'Job Postings',
      children: (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h2>Job Postings</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setJobModalVisible(true)}>
              New Job Posting
            </Button>
          </div>
          <Table columns={jobColumns} dataSource={jobs} loading={loading} rowKey="id" />
        </>
      )
    },
    {
      key: 'candidates',
      label: 'Candidates',
      children: (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h2>Candidates</h2>
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setCandidateModalVisible(true)}>
              New Candidate
            </Button>
          </div>
          <Table columns={candidateColumns} dataSource={candidates} loading={loading} rowKey="id" />
        </>
      )
    },
    {
      key: 'applications',
      label: 'Applications',
      children: (
        <>
          <h2>Applications</h2>
          <Table columns={applicationColumns} dataSource={applications} loading={loading} rowKey="id" />
        </>
      )
    }
  ];

  return (
    <div>
      <Tabs defaultActiveKey="jobs" items={tabItems} />

      <Modal title="New Job Posting" open={jobModalVisible} onCancel={() => setJobModalVisible(false)} footer={null}>
        <Form form={jobForm} onFinish={handleCreateJob} layout="vertical">
          <Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="positionId" label="Posición">
            <Select placeholder="Select position">
              {positions.map(pos => (
                <Select.Option key={pos.id} value={pos.id}>{pos.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="departmentId" label="Departamento">
            <Select placeholder="Select department">
              {departments.map(dept => (
                <Select.Option key={dept.id} value={dept.id}>{dept.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="employmentType" label="Employment Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="full_time">Full Time</Select.Option>
              <Select.Option value="part_time">Part Time</Select.Option>
              <Select.Option value="contract">Contract</Select.Option>
              <Select.Option value="internship">Internship</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Descripción" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Create Job</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setJobModalVisible(false)}>Cancelar</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="New Candidate" open={candidateModalVisible} onCancel={() => setCandidateModalVisible(false)} footer={null}>
        <Form form={candidateForm} onFinish={handleCreateCandidate} layout="vertical">
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Teléfono">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Create Candidate</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => setCandidateModalVisible(false)}>Cancelar</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Recruitment;