import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export default function RequireOrganization({ children }) {
  const location = useLocation()
  const [orgId, setOrgId] = useState(null)
  const [checking, setChecking] = useState(true)
  
  useEffect(() => {
    const checkOrg = () => {
      const id = localStorage.getItem('organizationId')
      setOrgId(id)
      setChecking(false)
    }
    
    checkOrg()
    
    // Listen for storage changes
    window.addEventListener('storage', checkOrg)
    return () => window.removeEventListener('storage', checkOrg)
  }, [])
  
  if (checking) {
    return <div>Verificando organización...</div>
  }
  
  if (!orgId) {
    return <Navigate to="/select-organization" replace state={{ from: location }} />
  }
  
  return children
}
