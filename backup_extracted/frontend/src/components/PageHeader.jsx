import React from 'react'
import { Button, Space, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function PageHeader({ 
  title, 
  subtitle, 
  onBack, 
  backPath = '/dashboard',
  extra,
  showBack = true 
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(backPath)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 24 
    }}>
      <Space align="start">
        {showBack && (
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            style={{ marginTop: 4 }}
          />
        )}
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Typography.Text type="secondary">
              {subtitle}
            </Typography.Text>
          )}
        </div>
      </Space>
      {extra && <div>{extra}</div>}
    </div>
  )
}