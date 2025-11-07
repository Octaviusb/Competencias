import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Table, Modal, Form, InputNumber, Select, message, Progress, Input } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { hrApi } from '../services/hrApi';

const { TabPane } = Tabs;
const { Option } = Select;

export default function Psychometric() {
  const [profiles, setProfiles] = useState([]);
  const [results, setResults] = useState([]);
  const [jobAnalyses, setJobAnalyses] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [form] = Form.useForm();
  const [resultForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profilesRes, jobAnalysesRes, candidatesRes, employeesRes] = await Promise.all([
        hrApi.get('/psychometric/profiles'),
        hrApi.get('/job-analyses'),
        hrApi.get('/recruitment/candidates'),
        hrApi.get('/employees')
      ]);
      
      setProfiles(profilesRes.data || []);
      setJobAnalyses(jobAnalysesRes.data || []);
      setCandidates(candidatesRes.data || []);
      setEmployees(employeesRes.data || []);
    } catch (error) {
      message.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (values) => {
    try {
      await hrApi.post('/psychometric/profiles', values);
      message.success('Perfil psicométrico creado exitosamente');
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('Error al crear perfil psicométrico');
    }
  };

  const handleImportResult = async (values) => {
    try {
      await hrApi.post('/psychometric/results/import', values);
      message.success('Resultado importado exitosamente');
      setResultModalVisible(false);
      resultForm.resetFields();
      loadResults(selectedProfile.id);
    } catch (error) {
      message.error('Error al importar resultado');
    }
  };

  const loadResults = async (profileId) => {
    try {
      const response = await hrApi.get(`/psychometric/results/profile/${profileId}`);
      setResults(response.data || []);
    } catch (error) {
      message.error('Error al cargar resultados');
    }
  };

  const profileColumns = [
    {
      title: 'Puesto',
      dataIndex: ['jobAnalysis', 'position', 'name'],
      key: 'position',
    },
    {
      title: 'Apertura',
      dataIndex: 'opennessWeight',
      key: 'openness',
      render: (value) => `${value}%`,
    },
    {
      title: 'Responsabilidad',
      dataIndex: 'conscientiousnessWeight',
      key: 'conscientiousness',
      render: (value) => `${value}%`,
    },
    {
      title: 'Extroversión',
      dataIndex: 'extraversionWeight',
      key: 'extraversion',
      render: (value) => `${value}%`,
    },
    {
      title: 'Amabilidad',
      dataIndex: 'agreeablenessWeight',
      key: 'agreeableness',
      render: (value) => `${value}%`,
    },
    {
      title: 'Neuroticismo',
      dataIndex: 'neuroticismWeight',
      key: 'neuroticism',
      render: (value) => `${value}%`,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedProfile(record);
            loadResults(record.id);
          }}
        >
          Ver Resultados
        </Button>
      ),
    },
  ];

  const resultColumns = [
    {
      title: 'Candidato/Empleado',
      key: 'person',
      render: (_, record) => (
        record.candidate ? 
          `${record.candidate.firstName} ${record.candidate.lastName}` :
          `${record.employee.firstName} ${record.employee.lastName}`
      ),
    },
    {
      title: 'Fit Score',
      dataIndex: 'fitScore',
      key: 'fitScore',
      render: (value) => (
        <div>
          <Progress 
            percent={value} 
            size="small" 
            status={value >= 80 ? 'success' : value >= 60 ? 'normal' : 'exception'}
          />
          <span>{value}%</span>
        </div>
      ),
      sorter: (a, b) => a.fitScore - b.fitScore,
    },
    {
      title: 'Apertura',
      dataIndex: 'openness',
      key: 'openness',
      render: (value) => `${value}/100`,
    },
    {
      title: 'Responsabilidad',
      dataIndex: 'conscientiousness',
      key: 'conscientiousness',
      render: (value) => `${value}/100`,
    },
    {
      title: 'Extroversión',
      dataIndex: 'extraversion',
      key: 'extraversion',
      render: (value) => `${value}/100`,
    },
    {
      title: 'Amabilidad',
      dataIndex: 'agreeableness',
      key: 'agreeableness',
      render: (value) => `${value}/100`,
    },
    {
      title: 'Neuroticismo',
      dataIndex: 'neuroticism',
      key: 'neuroticism',
      render: (value) => `${value}/100`,
    },
    {
      title: 'Fecha',
      dataIndex: 'testDate',
      key: 'testDate',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Pruebas Psicométricas - Big Five" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Crear Perfil
        </Button>
      }>
        <Tabs defaultActiveKey="profiles">
          <TabPane tab="Perfiles Psicométricos" key="profiles">
            <Table
              columns={profileColumns}
              dataSource={profiles}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          
          {selectedProfile && (
            <TabPane tab={`Resultados - ${selectedProfile.jobAnalysis?.position?.name}`} key="results">
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<UploadOutlined />} 
                  onClick={() => setResultModalVisible(true)}
                >
                  Importar Resultado
                </Button>
              </div>
              <Table
                columns={resultColumns}
                dataSource={results}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>

      {/* Modal para crear perfil */}
      <Modal
        title="Crear Perfil Psicométrico"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateProfile} layout="vertical">
          <Form.Item
            name="jobAnalysisId"
            label="Análisis de Puesto"
            rules={[{ required: true, message: 'Seleccione un análisis de puesto' }]}
          >
            <Select placeholder="Seleccionar análisis de puesto">
              {jobAnalyses.map(ja => (
                <Option key={ja.id} value={ja.id}>
                  {ja.position?.name} - {ja.department?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <strong>Pesos de los Factores Big Five (deben sumar 100%)</strong>
          </div>

          <Form.Item
            name="opennessWeight"
            label="Apertura a la Experiencia (%)"
            rules={[{ required: true, message: 'Ingrese el peso' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="conscientiousnessWeight"
            label="Responsabilidad (%)"
            rules={[{ required: true, message: 'Ingrese el peso' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="extraversionWeight"
            label="Extroversión (%)"
            rules={[{ required: true, message: 'Ingrese el peso' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="agreeablenessWeight"
            label="Amabilidad (%)"
            rules={[{ required: true, message: 'Ingrese el peso' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="neuroticismWeight"
            label="Neuroticismo (%)"
            rules={[{ required: true, message: 'Ingrese el peso' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Crear Perfil
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para importar resultado */}
      <Modal
        title="Importar Resultado de Prueba"
        visible={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={null}
      >
        <Form form={resultForm} onFinish={handleImportResult} layout="vertical">
          <Form.Item name="profileId" initialValue={selectedProfile?.id} hidden>
            <input />
          </Form.Item>

          <Form.Item
            name="candidateId"
            label="Candidato"
          >
            <Select placeholder="Seleccionar candidato" allowClear>
              {candidates.map(candidate => (
                <Option key={candidate.id} value={candidate.id}>
                  {candidate.firstName} {candidate.lastName} - {candidate.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="employeeId"
            label="Empleado"
          >
            <Select placeholder="Seleccionar empleado" allowClear>
              {employees.map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <strong>Puntajes Big Five (0-100)</strong>
          </div>

          <Form.Item
            name="openness"
            label="Apertura a la Experiencia"
            rules={[{ required: true, message: 'Ingrese el puntaje' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="conscientiousness"
            label="Responsabilidad"
            rules={[{ required: true, message: 'Ingrese el puntaje' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="extraversion"
            label="Extroversión"
            rules={[{ required: true, message: 'Ingrese el puntaje' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="agreeableness"
            label="Amabilidad"
            rules={[{ required: true, message: 'Ingrese el puntaje' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="neuroticism"
            label="Neuroticismo"
            rules={[{ required: true, message: 'Ingrese el puntaje' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notas"
          >
            <Input.TextArea rows={3} placeholder="Observaciones adicionales" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Importar Resultado
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}