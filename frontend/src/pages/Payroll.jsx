import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Card, Statistic, Row, Col, Tabs, Tag, Space } from 'antd';
import { PlusOutlined, DollarOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const Payroll = () => {
  const [periods, setPeriods] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [electronicDocuments, setElectronicDocuments] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [complianceInfo, setComplianceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPeriods();
    fetchElectronicDocuments();
    checkCompliance();
  }, []);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payroll/periods', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPeriods(data);
    } catch (error) {
      message.error('Error cargando períodos de nómina');
    }
    setLoading(false);
  };

  const fetchPayslips = async (periodId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payroll/periods/${periodId}/payslips`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setPayslips(data);
    } catch (error) {
      message.error('Error cargando recibos de nómina');
    }
    setLoading(false);
  };

  const fetchElectronicDocuments = async () => {
    try {
      const response = await fetch('/api/payroll/electronic', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setElectronicDocuments(data);
    } catch (error) {
      message.error('Error cargando documentos electrónicos');
    }
  };

  const checkCompliance = async () => {
    try {
      const response = await fetch('/api/payroll/compliance/check', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setComplianceInfo(data);
    } catch (error) {
      message.error('Error verificando cumplimiento');
    }
  };

  const fetchTransmissions = async () => {
    try {
      const response = await fetch('/api/payroll/electronic/transmissions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setTransmissions(data);
    } catch (error) {
      message.error('Error cargando transmisiones');
    }
  };

  const handleCreatePeriod = async (values) => {
    try {
      const [startDate, endDate] = values.dateRange;
      const response = await fetch('/api/payroll/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: values.name,
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
          payDate: values.payDate.format('YYYY-MM-DD')
        })
      });

      if (response.ok) {
        message.success('Período de nómina creado exitosamente');
        setModalVisible(false);
        form.resetFields();
        fetchPeriods();
      } else {
        message.error('Error creando período de nómina');
      }
    } catch (error) {
      message.error('Error creando período de nómina');
    }
  };

  const handleGeneratePayslips = async (periodId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payroll/periods/${periodId}/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        message.success('Recibos de nómina generados exitosamente');
        fetchPeriods();
        fetchPayslips(periodId);
      } else {
        message.error('Error generando recibos de nómina');
      }
    } catch (error) {
      message.error('Error generando recibos de nómina');
    }
    setLoading(false);
  };

  const handleGenerateElectronicDocument = async (payslipId) => {
    try {
      const response = await fetch(`/api/payroll/electronic/${payslipId}/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        message.success('Documento electrónico generado exitosamente');
        fetchElectronicDocuments();
      } else {
        message.error('Error generando documento electrónico');
      }
    } catch (error) {
      message.error('Error generando documento electrónico');
    }
  };

  const handleSignDocument = async (documentId) => {
    try {
      // In production, this should be handled securely
      const privateKey = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----';

      const response = await fetch(`/api/payroll/electronic/${documentId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ privateKey })
      });

      if (response.ok) {
        message.success('Documento firmado exitosamente');
        fetchElectronicDocuments();
      } else {
        message.error('Error firmando documento');
      }
    } catch (error) {
      message.error('Error firmando documento');
    }
  };

  const handleTransmitDocument = async (documentId) => {
    try {
      const response = await fetch(`/api/payroll/electronic/${documentId}/transmit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        message.success('Documento transmitido exitosamente');
        fetchElectronicDocuments();
        fetchTransmissions();
      } else {
        message.error('Error transmitiendo documento');
      }
    } catch (error) {
      message.error('Error transmitiendo documento');
    }
  };

  const periodColumns = [
    {
      title: 'Nombre del Período',
      dataIndex: 'name'
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
      title: 'Fecha de Pago',
      dataIndex: 'payDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status) => status.toUpperCase()
    },
    {
      title: 'Recibos',
      dataIndex: '_count',
      render: (count) => count.payslips
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <div>
          <Button
            size="small"
            onClick={() => {
              setSelectedPeriod(record.id);
              fetchPayslips(record.id);
            }}
          >
            Ver Recibos
          </Button>
          {record.status === 'draft' && (
            <Button
              size="small"
              type="primary"
              style={{ marginLeft: 8 }}
              onClick={() => handleGeneratePayslips(record.id)}
            >
              Generar
            </Button>
          )}
        </div>
      )
    }
  ];

  const payslipColumns = [
    {
      title: 'Empleado',
      dataIndex: ['employee', 'firstName'],
      render: (_, record) => `${record.employee.firstName} ${record.employee.lastName}`
    },
    {
      title: 'Salario Base',
      dataIndex: 'baseSalary',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Horas Extra',
      dataIndex: 'overtime',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Bonificaciones',
      dataIndex: 'bonuses',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Deducciones',
      dataIndex: 'deductions',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Impuestos',
      dataIndex: 'taxes',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Pago Neto',
      dataIndex: 'netPay',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Horas',
      dataIndex: 'hoursWorked',
      render: (hours) => `${hours.toFixed(1)}h`
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          onClick={() => handleGenerateElectronicDocument(record.id)}
        >
          Generar Doc. Electrónico
        </Button>
      )
    }
  ];

  const electronicDocumentColumns = [
    {
      title: 'CUNE',
      dataIndex: 'cune',
      render: (cune) => <code>{cune}</code>
    },
    {
      title: 'Empleado',
      dataIndex: ['payslip', 'employee', 'firstName'],
      render: (_, record) => `${record.payslip.employee.firstName} ${record.payslip.employee.lastName}`
    },
    {
      title: 'Period',
      dataIndex: ['payslip', 'period', 'name']
    },
    {
      title: 'Net Payment',
      dataIndex: 'netPayment',
      render: (amount) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status) => {
        const statusConfig = {
          generated: { color: 'blue', icon: <FileTextOutlined />, text: 'Generated' },
          signed: { color: 'orange', icon: <CheckCircleOutlined />, text: 'Signed' },
          transmitted: { color: 'green', icon: <SyncOutlined />, text: 'Transmitted' },
          accepted: { color: 'green', icon: <CheckCircleOutlined />, text: 'Accepted' },
          rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'Rechazado' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      }
    },
    {
      title: 'Generation Date',
      dataIndex: 'generationDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <Space>
          {record.status === 'generated' && (
            <Button size="small" onClick={() => handleSignDocument(record.id)}>
              Sign
            </Button>
          )}
          {record.status === 'signed' && (
            <Button size="small" type="primary" onClick={() => handleTransmitDocument(record.id)}>
              Transmit to DIAN
            </Button>
          )}
          {record.status === 'rejected' && (
            <Button size="small" danger onClick={() => handleTransmitDocument(record.id)}>
              Retry Transmission
            </Button>
          )}
        </Space>
      )
    }
  ];

  const transmissionColumns = [
    {
      title: 'Document CUNE',
      dataIndex: ['document', 'cune'],
      render: (cune) => <code>{cune}</code>
    },
    {
      title: 'Empleado',
      dataIndex: ['document', 'payslip', 'employee', 'firstName'],
      render: (_, record) => `${record.document.payslip.employee.firstName} ${record.document.payslip.employee.lastName}`
    },
    {
      title: 'Transmission Date',
      dataIndex: 'transmissionDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (status) => {
        const statusConfig = {
          sent: { color: 'blue', text: 'Sent' },
          accepted: { color: 'green', text: 'Accepted' },
          rejected: { color: 'red', text: 'Rechazado' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Response Code',
      dataIndex: 'responseCode'
    },
    {
      title: 'Response Message',
      dataIndex: 'responseMessage'
    },
    {
      title: 'Retry Count',
      dataIndex: 'retryCount'
    }
  ];

  const totalNetPay = payslips.reduce((sum, p) => sum + p.netPay, 0);
  const totalTaxes = payslips.reduce((sum, p) => sum + p.taxes, 0);
  const totalHours = payslips.reduce((sum, p) => sum + p.hoursWorked, 0);

  const tabItems = [
    {
      key: 'periods',
      label: 'Períodos de Nómina',
      children: (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <h2>Períodos de Nómina</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Nuevo Período
            </Button>
          </div>

          <Table
            columns={periodColumns}
            dataSource={periods}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </>
      )
    },
    {
      key: 'payslips',
      label: 'Recibos de Nómina',
      disabled: !selectedPeriod,
      children: selectedPeriod && (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="Total Empleados" value={payslips.length} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Pago Neto Total" value={totalNetPay} precision={2} prefix="$" />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Impuestos Totales" value={totalTaxes} precision={2} prefix="$" />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic title="Horas Totales" value={totalHours} precision={1} suffix="h" />
              </Card>
            </Col>
          </Row>

          <Table
            columns={payslipColumns}
            dataSource={payslips}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </>
      )
    },
    {
      key: 'electronic',
      label: 'Nómina Electrónica',
      children: (
        <Tabs defaultActiveKey="documents">
          <Tabs.TabPane tab="Documents" key="documents">
            {complianceInfo && (
              <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="Employee Count" value={complianceInfo.employeeCount} />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Compliance Status"
                      value={complianceInfo.isCompliant ? 'Compliant' : 'Not Required Yet'}
                      valueStyle={{ color: complianceInfo.isCompliant ? '#3f8600' : '#cf1322' }}
                    />
                  </Col>
                </Row>
                <p style={{ marginTop: 16 }}>{complianceInfo.message}</p>
              </Card>
            )}

            <Table
              columns={electronicDocumentColumns}
              dataSource={electronicDocuments}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Transmissions" key="transmissions">
            <Table
              columns={transmissionColumns}
              dataSource={transmissions}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>
        </Tabs>
      )
    }
  ];

  return (
    <div>
      <Tabs defaultActiveKey="periods" items={tabItems} />

      <Modal
        title="Nuevo Período de Nómina"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreatePeriod} layout="vertical">
          <Form.Item name="name" label="Nombre del Período" rules={[{ required: true }]}>
            <Input placeholder="ej., Enero 2024" />
          </Form.Item>

          <Form.Item name="dateRange" label="Rango del Período" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="payDate" label="Fecha de Pago" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              Crear Período
            </Button>
            <Button onClick={() => setModalVisible(false)}>
              Cancelar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Payroll;