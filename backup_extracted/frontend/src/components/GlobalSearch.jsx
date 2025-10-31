import React, { useState, useEffect } from 'react';
import { Input, List, Modal, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Text } = Typography;

export default function GlobalSearch() {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setVisible(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (item) => {
    const routes = {
      employee: `/employees/${item.id}`,
      observation: `/observations`,
      interview: `/interviews`,
      'job-analysis': `/job-analyses`
    };
    
    navigate(routes[item.type] || '/dashboard');
    setVisible(false);
    setQuery('');
  };

  return (
    <>
      <Input
        placeholder="Buscar... (Ctrl+K)"
        prefix={<SearchOutlined />}
        onClick={() => setVisible(true)}
        style={{ maxWidth: 300 }}
      />
      
      <Modal
        title="Búsqueda Global"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={600}
      >
        <Input
          placeholder="Buscar empleados, observaciones, entrevistas..."
          prefix={<SearchOutlined />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          style={{ marginBottom: 16 }}
        />
        
        <List
          loading={loading}
          dataSource={results}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleSelect(item)}
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta
                title={item.title}
                description={<Text type="secondary">{item.subtitle}</Text>}
              />
            </List.Item>
          )}
          locale={{ emptyText: query.length < 2 ? 'Escribe al menos 2 caracteres' : 'No se encontraron resultados' }}
        />
      </Modal>
    </>
  );
}