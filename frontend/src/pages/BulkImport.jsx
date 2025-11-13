import React, { useState } from 'react';
import { Card, Tabs, Upload, Button, message, Table, Alert, Progress, Divider } from 'antd';
import { UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { hrApi } from '../services/hrApi';

const { TabPane } = Tabs;
const { Dragger } = Upload;

export default function BulkImport() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');

  const downloadTemplate = async (type) => {
    try {
      setLoading(true);
      const response = await hrApi.get(`/bulk-import/templates/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `plantilla_${type}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Plantilla descargada exitosamente');
    } catch (error) {
      message.error('Error al descargar plantilla');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setResults(null);
      
      const response = await hrApi.post(`/bulk-import/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data);
      
      if (response.data.success > 0) {
        message.success(`${response.data.success} registros procesados exitosamente`);
      }
      
      if (response.data.errors.length > 0) {
        message.warning(`${response.data.errors.length} errores encontrados`);
      }
      
    } catch (error) {
      message.error('Error al procesar archivo');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }

    return false; // Prevent default upload behavior
  };

  const uploadProps = (type) => ({
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file) => handleUpload(file, type),
    showUploadList: false,
  });

  const errorColumns = [
    {
      title: 'Fila',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
    },
  ];

  const successColumns = [
    {
      title: 'Fila',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: 'Registro',
      dataIndex: 'employee',
      key: 'record',
      render: (text, record) => record.employee || record.competency || record.position,
    },
    {
      title: 'Acción',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <span style={{ 
          color: action === 'created' ? '#52c41a' : '#1890ff',
          fontWeight: 'bold'
        }}>
          {action === 'created' ? 'Creado' : 'Actualizado'}
        </span>
      ),
    },
  ];

  const renderResults = () => {
    if (!results) return null;

    const successRate = results.success / (results.success + results.errors.length) * 100;

    return (
      <div style={{ marginTop: 24 }}>
        <Alert
          message="Resultado del Procesamiento"
          description={
            <div>
              <p><strong>Total procesados:</strong> {results.success + results.errors.length}</p>
              <p><strong>Exitosos:</strong> {results.success}</p>
              <p><strong>Errores:</strong> {results.errors.length}</p>
            </div>
          }
          type={results.errors.length === 0 ? 'success' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Progress 
          percent={Math.round(successRate)} 
          status={results.errors.length === 0 ? 'success' : 'active'}
          format={() => `${Math.round(successRate)}% exitoso`}
          style={{ marginBottom: 24 }}
        />

        {results.created && results.created.length > 0 && (
          <>
            <h4>Registros Procesados Exitosamente ({results.created.length})</h4>
            <Table
              columns={successColumns}
              dataSource={results.created}
              rowKey="row"
              size="small"
              pagination={{ pageSize: 10 }}
              style={{ marginBottom: 24 }}
            />
          </>
        )}

        {results.updated && results.updated.length > 0 && (
          <>
            <h4>Registros Actualizados ({results.updated.length})</h4>
            <Table
              columns={successColumns}
              dataSource={results.updated}
              rowKey="row"
              size="small"
              pagination={{ pageSize: 10 }}
              style={{ marginBottom: 24 }}
            />
          </>
        )}

        {results.errors.length > 0 && (
          <>
            <h4>Errores Encontrados ({results.errors.length})</h4>
            <Table
              columns={errorColumns}
              dataSource={results.errors}
              rowKey="row"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </>
        )}
      </div>
    );
  };

  const renderUploadSection = (type, title, description) => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={() => downloadTemplate(type)}
          loading={loading}
        >
          Descargar Plantilla
        </Button>
      </div>

      <Alert
        message="Instrucciones"
        description={description}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Dragger {...uploadProps(type)} disabled={loading}>
        <p className="ant-upload-drag-icon">
          <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text">
          Haz clic o arrastra el archivo Excel aquí para cargar {title.toLowerCase()}
        </p>
        <p className="ant-upload-hint">
          Solo archivos .xlsx y .xls son soportados
        </p>
      </Dragger>

      {renderResults()}
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Carga Masiva de Información">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Empleados" key="employees">
            {renderUploadSection(
              'employees',
              'Empleados',
              'Descarga la plantilla, completa la información de los empleados y sube el archivo. Los campos obligatorios son: Nombres, Apellidos y Email.'
            )}
          </TabPane>

          <TabPane tab="Competencias" key="competencies">
            {renderUploadSection(
              'competencies',
              'Competencias',
              'Descarga la plantilla, define las competencias organizacionales y sube el archivo. Los campos obligatorios son: Nombre y Categoría.'
            )}
          </TabPane>

          <TabPane tab="Posiciones" key="positions">
            {renderUploadSection(
              'positions',
              'Posiciones',
              'Descarga la plantilla, define las posiciones de trabajo y sube el archivo. Los campos obligatorios son: Nombre y Departamento.'
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Card title="Guía de Uso" style={{ marginTop: 24 }}>
        <div>
          <h4>📋 Pasos para la Carga Masiva:</h4>
          <ol>
            <li><strong>Descargar Plantilla:</strong> Haz clic en "Descargar Plantilla" para obtener el formato correcto</li>
            <li><strong>Completar Información:</strong> Llena la plantilla con los datos de tu empresa</li>
            <li><strong>Validar Datos:</strong> Asegúrate de que los campos obligatorios estén completos</li>
            <li><strong>Subir Archivo:</strong> Arrastra o selecciona el archivo completado</li>
            <li><strong>Revisar Resultados:</strong> Verifica los registros procesados y corrige errores si es necesario</li>
          </ol>

          <Divider />

          <h4>⚠️ Consideraciones Importantes:</h4>
          <ul>
            <li>Los archivos deben estar en formato Excel (.xlsx o .xls)</li>
            <li>No modifiques los nombres de las columnas en la plantilla</li>
            <li>Los registros duplicados serán actualizados automáticamente</li>
            <li>Revisa los errores reportados y corrige los datos antes de volver a cargar</li>
            <li>Para empleados, si el email ya existe, se actualizará la información</li>
          </ul>

          <Divider />

          <h4>📊 Formatos de Datos:</h4>
          <ul>
            <li><strong>Fechas:</strong> Formato YYYY-MM-DD (ej: 2024-01-15)</li>
            <li><strong>Estados:</strong> active, inactive, terminated</li>
            <li><strong>Salarios:</strong> Solo números (ej: 4500000)</li>
            <li><strong>Emails:</strong> Formato válido de correo electrónico</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}