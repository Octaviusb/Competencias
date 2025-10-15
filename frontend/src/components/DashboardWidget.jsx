import React from 'react';
import { Card, Button, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import './DashboardWidget.css'; // Asegúrate de crear este archivo en la misma carpeta

export default function DashboardWidget({ 
  title, 
  children, 
  onRemove, 
  onSettings,
  removable = true 
}) {
  const menuItems = [
    ...(onSettings ? [{ key: 'settings', label: 'Configurar' }] : []),
    ...(removable ? [{ key: 'remove', label: 'Remover', danger: true }] : [])
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'remove' && onRemove) onRemove();
    if (key === 'settings' && onSettings) onSettings();
  };

  return (
    <Card
  title={<span className="widget-title">{title}</span>}
  size="small"
  className="dashboard-widget"
  extra={
    menuItems.length > 0 && (
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={['click']}
      >
        <Button type="text" icon={<MoreOutlined />} size="small" />
      </Dropdown>
    )
  }
>
  <div className="widget-content">
    {children}
  </div>
</Card>
)}