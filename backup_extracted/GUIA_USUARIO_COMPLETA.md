# 🚀 Guía Completa de Uso - Competency Manager
## Paso a Paso para Gestionar tu Talento Humano

**Versión:** 1.0 | **Fecha:** Octubre 2025 | **Sistema:** Completo con Nómina DIAN

---

## 📋 **Índice de Contenidos**

1. [Primeros Pasos](#-primeros-pasos)
2. [Configuración Inicial](#-configuración-inicial)
3. [Gestión de Empleados](#-gestión-de-empleados)
4. [Sistema de Competencias](#-sistema-de-competencias)
5. [Evaluaciones de Desempeño](#-evaluaciones-de-desempeño)
6. [Planes de Desarrollo](#-planes-de-desarrollo)
7. [Nómina Electrónica DIAN](#-nómina-electrónica-dian)
8. [Reportes y Analytics](#-reportes-y-analytics)
9. [Solución de Problemas](#-solución-de-problemas)

---

## 🎯 **Primeros Pasos**

### **1. Acceso al Sistema**
```
🌐 URL: http://localhost:5173 (desarrollo) | https://tu-dominio.com (producción)
```

### **2. Selección de Organización**
- **Opción A:** Seleccionar organización existente
- **Opción B:** Crear nueva organización
- **Importante:** Una vez seleccionada, queda guardada para futuras sesiones

### **3. Registro/Login**
```bash
# Usuario de prueba incluido:
Email: admin@demo.com
Contraseña: demo123
Organización: demo-org
```

---

## ⚙️ **Configuración Inicial**

### **Paso 1: Crear Departamentos**
```
Menú: Admin → Departamentos
1. Hacer clic en "Nuevo Departamento"
2. Nombre: "Tecnología", "Ventas", "RRHH", etc.
3. Guardar
```

### **Paso 2: Crear Categorías de Competencias**
```
Menú: Admin → Categorías
1. Hacer clic en "Nueva Categoría"
2. Nombre: "Habilidades Técnicas", "Habilidades Blandas"
3. Guardar
```

### **Paso 3: Definir Competencias**
```
Menú: Admin → Competencias
1. Seleccionar categoría
2. Nombre: "JavaScript", "Comunicación", "Liderazgo"
3. Descripción detallada
4. Guardar
```

### **Paso 4: Crear Puestos**
```
Menú: Admin → Puestos
1. Nombre: "Desarrollador Senior"
2. Departamento: Seleccionar
3. Descripción del rol
4. Requerimientos: Asignar competencias con pesos
```

### **Paso 5: Registrar Empleados**
```
Menú: Empleados → Nuevo
1. Información básica (nombres, email, etc.)
2. Asignar departamento y puesto
3. Información completa para nómina DIAN
```

---

## 👥 **Gestión de Empleados**

### **Ver Lista de Empleados**
```
Menú: Empleados
- Vista general de todos los empleados
- Filtros por departamento, puesto, estado
- Búsqueda por nombre
```

### **Agregar Nuevo Empleado**
```
1. Información Personal:
   - Nombres y apellidos
   - Tipo y número de documento
   - Fecha de nacimiento
   - Información de contacto

2. Información Laboral:
   - Departamento
   - Puesto
   - Fecha de ingreso
   - Salario base
   - Tipo de contrato

3. Información para Nómina DIAN:
   - NIT (si aplica)
   - Cuenta bancaria
   - Información tributaria
```

### **Editar Información**
```
1. Buscar empleado
2. Hacer clic en "Editar"
3. Modificar información necesaria
4. Guardar cambios
```

---

## 🎯 **Sistema de Competencias**

### **Crear Evaluación Template**
```
Menú: Admin → Templates de Evaluación
1. Nombre: "Evaluación Anual de Desempeño"
2. Escala: 1-5
3. Agregar competencias con pesos
```

### **Asignar Competencias a Puestos**
```
Menú: Admin → Puestos → [Seleccionar Puesto]
1. Ir a pestaña "Requerimientos"
2. Agregar competencias
3. Asignar nivel esperado (1-5)
4. Definir peso porcentual
```

---

## 📊 **Evaluaciones de Desempeño**

### **Crear Nueva Evaluación**
```
Menú: Evaluaciones → Nueva
1. Seleccionar empleado
2. Elegir template
3. Definir período
4. Asignar evaluadores
```

### **Realizar Evaluación**
```
1. Acceder a evaluación asignada
2. Calificar cada competencia
3. Agregar comentarios
4. Completar evaluación
```

### **Sistema de Observaciones**
```
Menú: Observaciones → Nueva
1. Seleccionar empleado
2. Tipo: Formal/Informal/360°
3. Registrar comportamiento observado
4. Calificar competencias relacionadas
```

### **Entrevistas Estructuradas**
```
Menú: Entrevistas → Nueva
1. Seleccionar empleado e entrevistador
2. Elegir tipo: Desempeño/Desarrollo/Salida
3. Usar template de preguntas
4. Registrar respuestas y compromisos
```

---

## 📈 **Planes de Desarrollo**

### **Crear Plan de Desarrollo**
```
Menú: Planes → Nuevo
1. Seleccionar empleado
2. Definir objetivos
3. Crear actividades:
   - Capacitación
   - Mentoría
   - Proyectos especiales
4. Asignar fechas y responsables
```

### **Seguimiento de Progreso**
```
1. Actualizar estado de actividades
2. Registrar logros
3. Ajustar plan según necesidades
4. Generar reportes de avance
```

---

## 💰 **Nómina Electrónica DIAN**

### **Paso 1: Crear Período de Nómina**
```
Menú: RRHH → Nómina → Nuevo Período
1. Nombre: "Nómina Octubre 2025"
2. Fecha inicio: 01/10/2025
3. Fecha fin: 31/10/2025
4. Fecha de pago: 15/11/2025
5. Guardar
```

### **Paso 2: Generar Nómina**
```
Menú: RRHH → Nómina → [Seleccionar Período]
1. Hacer clic en "Generar Nómina"
2. Sistema calcula automáticamente:
   - Salarios base
   - Horas extras (desde asistencia)
   - Deducciones
   - Impuestos (15% aproximado)
3. Revisar cálculos
4. Confirmar generación
```

### **Paso 3: Crear Documentos Electrónicos**
```
Menú: RRHH → Nómina → Documentos Electrónicos
1. Para cada empleado generado:
   - Hacer clic en "Generar Doc. Electrónico"
   - Sistema crea XML UBL 2.1 con:
     - Información empleador (NIT, razón social)
     - Información empleado (nombres, documento)
     - Valores pagados (devengados, deducidos)
     - CUNE único generado automáticamente
```

### **Paso 4: Firmar Documentos**
```
1. Seleccionar documento en estado "Generado"
2. Hacer clic en "Firmar"
3. Sistema aplica firma digital RSA-SHA256
4. Estado cambia a "Firmado"
```

### **Paso 5: Transmitir a DIAN**
```
1. Seleccionar documento en estado "Firmado"
2. Hacer clic en "Transmitir a DIAN"
3. Sistema envía XML a API DIAN
4. Estados posibles:
   - ✅ Aceptado: Documento válido
   - ❌ Rechazado: Corregir errores
   - 🔄 Pendiente: Esperando respuesta
```

### **Verificar Transmisiones**
```
Menú: RRHH → Nómina → Historial de Transmisiones
- Ver todas las transmisiones
- Códigos de respuesta DIAN
- Fechas de envío y respuesta
- Estado actual de cada documento
```

### **Reintentos Automáticos**
```
- Sistema reintenta automáticamente documentos rechazados
- Máximo 3 intentos
- Intervalos: 1h, 6h, 24h
- Notificaciones por email
```

---

## 📊 **Reportes y Analytics**

### **Dashboard Ejecutivo**
```
Menú: Dashboard
- Métricas generales de talento
- Gráficos de competencias
- Indicadores de desarrollo
- Alertas importantes
```

### **Reportes de RRHH**
```
Menú: Reportes
1. Evaluaciones completadas
2. Competencias por departamento
3. Planes de desarrollo activos
4. Nómina y compensaciones
5. Transmisiones DIAN
```

### **Exportar Datos**
```
1. Seleccionar reporte
2. Elegir formato: PDF/Excel
3. Definir filtros
4. Generar y descargar
```

---

## 🔧 **Solución de Problemas**

### **Problema: No puedo acceder al sistema**
```
✅ Verificar conexión a internet
✅ Limpiar caché del navegador
✅ Intentar con otro navegador
✅ Verificar URL correcta
```

### **Problema: Error al guardar datos**
```
✅ Verificar campos obligatorios
✅ Revisar formato de datos
✅ Verificar permisos de usuario
✅ Contactar soporte si persiste
```

### **Problema: Documentos DIAN rechazados**
```
✅ Verificar información del empleado
✅ Revisar cálculos de nómina
✅ Confirmar firma digital
✅ Consultar códigos de error DIAN
```

### **Problema: Lentitud del sistema**
```
✅ Cerrar otras pestañas
✅ Verificar conexión estable
✅ Limpiar caché
✅ Contactar soporte para optimización
```

---

## 📞 **Soporte y Contacto**

### **Recursos de Ayuda**
- 📖 **Documentación completa:** docs.competencymanager.com
- 🎥 **Videos tutoriales:** academy.competencymanager.com
- 💬 **Chat de soporte:** Disponible 24/7
- 📧 **Email:** soporte@competencymanager.com

### **Horarios de Atención**
- **Técnico:** Lunes a Domingo, 24 horas
- **Comercial:** Lunes a Viernes, 8:00 - 18:00
- **Emergencias:** Siempre disponible

### **Comunidad**
- **Foro de usuarios:** community.competencymanager.com
- **Webinars mensuales:** Capacitación gratuita
- **Base de conocimiento:** Artículos y guías

---

## 🎯 **Próximos Pasos Recomendados**

### **Semana 1: Configuración**
- ✅ Completar estructura organizacional
- ✅ Registrar empleados principales
- ✅ Configurar competencias críticas

### **Semana 2: Operación Básica**
- ✅ Realizar primera evaluación
- ✅ Crear planes de desarrollo
- ✅ Procesar primera nómina

### **Semana 3: Nómina DIAN**
- ✅ Configurar certificados digitales
- ✅ Probar transmisión de prueba
- ✅ Implementar proceso productivo

### **Mes 2: Optimización**
- ✅ Analizar reportes
- ✅ Ajustar procesos
- ✅ Capacitar usuarios adicionales

---

## 🏆 **Consejos para Éxito**

### **Mejores Prácticas**
1. **Mantén datos actualizados** diariamente
2. **Realiza evaluaciones** continuas, no solo anuales
3. **Transmite nómina DIAN** inmediatamente después de pago
4. **Revisa reportes** semanalmente
5. **Capacita** a todo el equipo en el uso

### **Errores Comunes a Evitar**
- ❌ Dejar plantillas sin competencias
- ❌ No completar información de empleados
- ❌ Olvidar transmitir documentos DIAN
- ❌ No hacer seguimiento de planes
- ❌ Ignorar alertas del sistema

---

## 🎉 **¡Felicitaciones!**

Has completado la **Guía Completa de Uso** de Competency Manager. Ahora tienes todas las herramientas para:

- ✅ Gestionar efectivamente tu talento humano
- ✅ Cumplir con la normatividad colombiana
- ✅ Desarrollar las competencias de tu equipo
- ✅ Optimizar procesos administrativos
- ✅ Tomar decisiones basadas en datos

**¡Tu organización está lista para crecer con el mejor talento!**

---

**📱 ¿Necesitas ayuda?** Contáctanos en soporte@competencymanager.com
**🌐 Más información:** www.competencymanager.com