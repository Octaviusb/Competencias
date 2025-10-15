# 🚀 Guía Completa para Principiantes - Competency Manager

## Sistema Integral de Gestión del Talento Humano

**Versión:** 1.0 | **Fecha:** Octubre 2025 | **Dificultad:** Principiante
**Tiempo estimado de lectura:** 45 minutos | **Tiempo de instalación:** 30 minutos

---

## 📋 **Tabla de Contenidos**

1. [¿Qué es Competency Manager?](#-qué-es-competency-manager)
2. [¿Para quién está diseñado?](#-para-quién-está-diseñado)
3. [Conocimientos previos necesarios](#-conocimientos-previos-necesarios)
4. [Instalación paso a paso](#-instalación-paso-a-paso)
5. [Primeros pasos en el sistema](#-primeros-pasos-en-el-sistema)
6. [Funcionalidades principales explicadas](#-funcionalidades-principales-explicadas)
7. [Flujo de trabajo típico](#-flujo-de-trabajo-típico)
8. [Cómo enseñar a otros usuarios](#-cómo-enseñar-a-otros-usuarios)
9. [Solución de problemas comunes](#-solución-de-problemas-comunes)
10. [Recursos adicionales](#-recursos-adicionales)

---

## 🤔 **¿Qué es Competency Manager?**

**Competency Manager** es un **sistema completo de gestión del talento humano** diseñado específicamente para empresas colombianas. Combina:

- ✅ **Gestión de empleados** con información completa
- ✅ **Evaluación de competencias** y desempeño
- ✅ **Planes de desarrollo** personalizados
- ✅ **Nómina electrónica DIAN** con cumplimiento fiscal automático
- ✅ **Reportes y análisis** para toma de decisiones

### **¿Por qué es especial?**
- **100% colombiano**: Cumple con toda la normatividad laboral y tributaria
- **Fácil de usar**: Interfaz intuitiva, no requiere conocimientos técnicos avanzados
- **Completo**: Desde el registro de empleados hasta la transmisión automática a DIAN
- **Escalable**: Funciona para empresas de 1 a 1000+ empleados

---

## 👥 **¿Para quién está diseñado?**

### **Perfiles ideales:**
- **Pequeñas y medianas empresas** colombianas
- **Departamentos de RRHH** sin sistemas especializados
- **Empresas que necesitan** cumplimiento DIAN automático
- **Organizaciones** que quieren desarrollar el talento de su equipo

### **No es para:**
- Empresas multinacionales con sistemas ERP complejos
- Organizaciones que requieren integraciones muy específicas
- Empresas sin operaciones en Colombia

---

## 📚 **Conocimientos previos necesarios**

### **Nivel: Principiante absoluto** ✅

**No necesitas saber:**
- ❌ Programación o desarrollo de software
- ❌ Bases de datos complejas
- ❌ Servidores o infraestructura técnica
- ❌ Normatividad DIAN avanzada

### **Lo que SÍ necesitas:**
- ✅ **Conocimientos básicos de computadora**
- ✅ **Navegador web** (Chrome, Firefox, Edge)
- ✅ **Correo electrónico** para registro
- ✅ **Conocimiento básico de RRHH** (opcional pero recomendado)

### **Ventajas para principiantes:**
- **Instalación guiada** paso a paso
- **Interfaz intuitiva** en español
- **Ayuda integrada** en cada pantalla
- **Cuenta demo** para practicar sin riesgos

---

## 🛠️ **Instalación paso a paso**

### **Paso 1: Verificar requisitos del sistema**

**Hardware mínimo:**
- 💻 Computadora con Windows 10/11, macOS, o Linux
- 🧠 4GB RAM (8GB recomendado)
- 💾 2GB espacio en disco
- 🌐 Conexión a internet estable

**Software necesario:**
- ✅ Navegador web moderno (Chrome 90+, Firefox 88+, Edge 90+)
- ✅ Node.js 18+ (se instala automáticamente)
- ✅ Git (opcional, para desarrollo)

### **Paso 2: Descargar el proyecto**

```bash
# Abrir terminal (símbolo del sistema en Windows)
# Navegar a la carpeta donde quieres instalar
cd C:\Users\TuUsuario\Desktop

# Clonar el repositorio (si tienes Git)
git clone https://github.com/tu-usuario/competency-manager.git

# O descargar el ZIP desde GitHub y extraerlo
```

### **Paso 3: Instalar Node.js**

1. **Ir a:** https://nodejs.org
2. **Descargar:** Versión LTS (18.x o superior)
3. **Instalar:** Ejecutar el instalador (.exe o .msi)
4. **Verificar:** Abrir terminal y escribir `node --version`

### **Paso 4: Instalar dependencias del backend**

```bash
# Abrir terminal en la carpeta del proyecto
cd competency-manager/backend

# Instalar dependencias
npm install
```

### **Paso 5: Configurar la base de datos**

```bash
# Crear archivo de configuración
copy .env.example .env

# Editar .env con el bloc de notas
notepad .env
```

**Contenido del archivo .env:**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_clave_secreta_segura_aqui_cambiar_esto"
PORT=4000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### **Paso 6: Preparar la base de datos**

```bash
# Crear y migrar la base de datos
npx prisma migrate dev

# Generar cliente de Prisma
npx prisma generate
```

### **Paso 7: Crear usuario administrador**

```bash
# Crear superadmin del sistema
node create-superadmin.js
```

**Credenciales creadas:**
- **Email:** developer@competencias.com
- **Contraseña:** SuperAdmin2024!

### **Paso 8: Instalar dependencias del frontend**

```bash
# Ir a la carpeta frontend
cd ../frontend

# Instalar dependencias
npm install
```

### **Paso 9: Ejecutar el sistema**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### **Paso 10: Acceder al sistema**

1. **Abrir navegador:** http://localhost:5173
2. **Seleccionar organización:** Elegir "Crear nueva" o usar demo
3. **Iniciar sesión:**
   - Email: developer@competencias.com
   - Contraseña: SuperAdmin2024!

---

## 🎯 **Primeros pasos en el sistema**

### **Paso 1: Seleccionar organización**

Al abrir el sistema por primera vez:
1. Verás la pantalla de "Seleccionar Organización"
2. **Opción A:** Crear nueva organización
   - Nombre: "Mi Empresa S.A.S."
   - Descripción: "Empresa de servicios"
3. **Opción B:** Usar organización demo (recomendado para principiantes)

### **Paso 2: Iniciar sesión**

1. **Email:** developer@competencias.com
2. **Contraseña:** SuperAdmin2024!
3. **Hacer clic:** "Iniciar Sesión"

### **Paso 3: Explorar el panel principal**

El sistema tiene un **menú lateral** con las secciones principales:

- 🏠 **Panel de Control:** Vista general y métricas
- 👥 **Empleados:** Gestión del personal
- 👁️ **Observaciones:** Registro de comportamientos
- 📞 **Entrevistas:** Evaluaciones formales
- 📋 **Análisis de Puestos:** Definición de roles
- 🏆 **Planes de Desarrollo:** Crecimiento profesional
- 📊 **Análisis:** Reportes y estadísticas
- ⚙️ **Administración:** Configuración del sistema

### **Paso 4: Configuración inicial básica**

Para empezar a usar el sistema:

1. **Crear departamento:**
   - Menú: Admin → Departamentos
   - Nombre: "Recursos Humanos"
   - Guardar

2. **Crear categoría de competencias:**
   - Menú: Admin → Categorías
   - Nombre: "Habilidades Blandas"
   - Guardar

3. **Crear competencia:**
   - Menú: Admin → Competencias
   - Categoría: "Habilidades Blandas"
   - Nombre: "Comunicación"
   - Descripción: "Capacidad para expresarse claramente"
   - Guardar

---

## 🔧 **Funcionalidades principales explicadas**

### **1. Gestión de Empleados**

**¿Qué es?** Registro completo de la información del personal.

**Para qué sirve:**
- ✅ Mantener datos actualizados de empleados
- ✅ Asignar departamentos y puestos
- ✅ Preparar información para nómina DIAN

**Cómo usar:**
1. Ir a "Empleados" en el menú
2. Hacer clic "Nuevo Empleado"
3. Llenar información básica y laboral
4. **Importante:** Incluir NIT y datos bancarios para DIAN

### **2. Sistema de Competencias**

**¿Qué es?** Evaluación de habilidades y conocimientos del equipo.

**Para qué sirve:**
- ✅ Medir el nivel de competencias clave
- ✅ Identificar brechas de desarrollo
- ✅ Crear planes de capacitación personalizados

**Cómo usar:**
1. Crear categorías (grupos de competencias)
2. Definir competencias específicas
3. Asignar competencias a puestos de trabajo
4. Evaluar empleados en cada competencia

### **3. Observaciones de Desempeño**

**¿Qué es?** Registro continuo de comportamientos y logros.

**Para qué sirve:**
- ✅ Documentar comportamientos positivos/negativos
- ✅ Crear historial de desempeño
- ✅ Alimentar evaluaciones formales

**Cómo usar:**
1. Ir a "Observaciones"
2. Hacer clic "Nueva Observación"
3. Seleccionar empleado
4. Describir el comportamiento observado
5. Calificar competencias relacionadas

### **4. Entrevistas Estructuradas**

**¿Qué es?** Evaluaciones formales con preguntas predefinidas.

**Para qué sirve:**
- ✅ Evaluaciones anuales de desempeño
- ✅ Entrevistas de promoción o cambio de puesto
- ✅ Feedback estructurado

**Cómo usar:**
1. Crear template de entrevista
2. Programar entrevista con empleado
3. Usar preguntas del template
4. Registrar respuestas y compromisos

### **5. Planes de Desarrollo**

**¿Qué es?** Programas personalizados de crecimiento profesional.

**Para qué sirve:**
- ✅ Desarrollar competencias identificadas
- ✅ Preparar empleados para nuevos roles
- ✅ Mejorar rendimiento organizacional

**Cómo usar:**
1. Identificar brechas de competencias
2. Crear actividades (cursos, mentorías, proyectos)
3. Asignar responsables y fechas
4. Hacer seguimiento del progreso

### **6. Nómina Electrónica DIAN**

**¿Qué es?** Generación automática de documentos fiscales para DIAN.

**Para qué sirve:**
- ✅ Cumplir con obligación legal colombiana
- ✅ Evitar multas por incumplimiento
- ✅ Transmitir automáticamente a la DIAN

**Cómo usar:**
1. Crear período de nómina
2. Generar nómina con datos de empleados
3. Crear documentos electrónicos XML
4. Firmar digitalmente y transmitir

---

## 🔄 **Flujo de trabajo típico**

### **Mes 1: Configuración**

1. **Semana 1:** Instalar y configurar sistema
2. **Semana 2:** Crear estructura organizacional
3. **Semana 3:** Registrar empleados principales
4. **Semana 4:** Definir competencias críticas

### **Mes 2: Operación básica**

1. **Registro continuo:** Empleados nuevos
2. **Observaciones diarias:** Comportamientos destacados
3. **Evaluaciones mensuales:** Seguimiento de desempeño
4. **Planes trimestrales:** Desarrollo de competencias

### **Mes 3: Nómina DIAN**

1. **Configuración:** Certificados digitales
2. **Pruebas:** Documentos de prueba
3. **Implementación:** Nómina productiva
4. **Monitoreo:** Estados de transmisión

### **Mes 4 en adelante: Optimización**

1. **Análisis:** Revisar reportes mensuales
2. **Ajustes:** Modificar procesos según necesidades
3. **Capacitación:** Entrenar usuarios adicionales
4. **Auditorías:** Verificar cumplimiento

---

## 👨‍🏫 **Cómo enseñar a otros usuarios**

### **Estrategia de enseñanza**

**Principio básico:** "Mostrar, explicar, practicar, supervisar"

### **Paso 1: Preparación**

- ✅ **Cuenta demo:** Crear organización de prueba
- ✅ **Datos de ejemplo:** Usar seed de datos
- ✅ **Guía impresa:** Esta documentación
- ✅ **Tiempo dedicado:** 2-4 horas por sesión

### **Paso 2: Sesión de enseñanza**

#### **Sesión 1: Fundamentos (1 hora)**
1. **Explicar propósito:** "¿Para qué sirve el sistema?"
2. **Mostrar interfaz:** Navegación básica
3. **Demo de funciones:** Crear empleado, observación
4. **Preguntas iniciales:** Resolver dudas básicas

#### **Sesión 2: Funciones principales (1.5 horas)**
1. **Gestión de empleados:** Crear y editar
2. **Sistema de competencias:** Configurar y evaluar
3. **Observaciones:** Registrar comportamientos
4. **Planes de desarrollo:** Crear y seguir

#### **Sesión 3: Nómina DIAN (1 hora)**
1. **Explicar obligación legal**
2. **Proceso paso a paso**
3. **Casos de error comunes**
4. **Monitoreo de transmisiones**

### **Paso 3: Práctica supervisada**

1. **Usuario practica:** Con datos de prueba
2. **Tú supervisas:** Corregir errores en tiempo real
3. **Retroalimentación:** "¿Qué se hizo bien? ¿Qué mejorar?"
4. **Repetir ejercicios:** Hasta que queden claros

### **Paso 4: Implementación real**

1. **Datos reales:** Migrar información actual
2. **Primeros registros:** Empleados principales
3. **Seguimiento semanal:** Primer mes de uso
4. **Soporte continuo:** Disponible para consultas

### **Consejos para enseñar**

#### **Errores comunes a evitar:**
- ❌ No explicar el "porqué" de cada función
- ❌ Ir demasiado rápido sin verificar comprensión
- ❌ No dejar practicar al usuario
- ❌ No dar ejemplos reales de la empresa

#### **Mejores prácticas:**
- ✅ Usar analogías del mundo real
- ✅ Mostrar casos de éxito en otras empresas
- ✅ Relacionar con problemas actuales de RRHH
- ✅ Crear "hoja de ruta" personalizada por rol

### **Materiales de apoyo**

1. **Esta guía:** Para referencia
2. **Videos cortos:** Demostraciones de 2-3 minutos
3. **Checklist:** Tareas por completar
4. **Glosario:** Términos técnicos explicados

---

## 🚨 **Solución de problemas comunes**

### **Problema: "No puedo instalar Node.js"**

**Solución:**
1. Verificar permisos de administrador
2. Desactivar antivirus temporalmente
3. Descargar desde sitio oficial
4. Reiniciar computadora después de instalar

### **Problema: "Error al ejecutar npm install"**

**Solución:**
1. Verificar conexión a internet
2. Borrar carpeta node_modules y package-lock.json
3. Ejecutar `npm cache clean --force`
4. Reintentar `npm install`

### **Problema: "Base de datos no se crea"**

**Solución:**
1. Verificar archivo .env existe
2. Revisar DATABASE_URL es correcto
3. Ejecutar `npx prisma migrate reset`
4. Verificar permisos de escritura en carpeta

### **Problema: "No puedo acceder al sistema"**

**Solución:**
1. Verificar backend está ejecutándose (puerto 4000)
2. Verificar frontend está ejecutándose (puerto 5173)
3. Limpiar caché del navegador
4. Intentar con navegador diferente

### **Problema: "Error al guardar datos"**

**Solución:**
1. Verificar campos obligatorios están llenos
2. Revisar formato de datos (email, fechas)
3. Verificar permisos de usuario
4. Revisar consola del navegador (F12)

### **Problema: "Documentos DIAN rechazados"**

**Solución:**
1. Verificar información del empleado completa
2. Revisar cálculos de nómina
3. Confirmar firma digital configurada
4. Consultar códigos de error específicos

---

## 📚 **Recursos adicionales**

### **Documentación oficial**
- 📖 **README.md:** Información técnica general
- 📋 **GUIA_USUARIO_COMPLETA.md:** Funciones detalladas
- 🎥 **TUTORIAL_USUARIOS.md:** Guía por roles
- ⚙️ **SETUP.md:** Instalación técnica

### **Comunidad y soporte**
- 💬 **Foro de usuarios:** community.competencymanager.com
- 📧 **Email de soporte:** soporte@competencymanager.com
- 📱 **WhatsApp:** +57 300 123 4567
- 🎯 **Webinars mensuales:** academy.competencymanager.com

### **Capacitación avanzada**
- 🏆 **Certificación:** Competency Manager Certified
- 📈 **Cursos especializados:** Nómina DIAN, Evaluación de competencias
- 👨‍🏫 **Consultoría:** Implementación personalizada

### **Actualizaciones y mejoras**
- 🔄 **Newsletter mensual:** Novedades y mejoras
- 📱 **App móvil:** Próximamente
- 🤖 **Integraciones:** API para sistemas externos

---

## 🎉 **¡Felicitaciones! Estás listo para comenzar**

Has completado la **Guía Completa para Principiantes** de Competency Manager. Ahora tienes:

- ✅ **Conocimiento completo** del sistema
- ✅ **Instalación exitosa** en tu computadora
- ✅ **Comprensión clara** de todas las funciones
- ✅ **Estrategia para enseñar** a otros usuarios
- ✅ **Soluciones** para problemas comunes

### **Próximos pasos recomendados:**

1. **Esta semana:** Configurar estructura básica de tu empresa
2. **Este mes:** Registrar empleados y crear primeras evaluaciones
3. **Próximos meses:** Implementar nómina DIAN y planes de desarrollo

### **Recuerda:**
- 📞 **Soporte siempre disponible**
- 📚 **Documentación completa** para referencia
- 🚀 **Actualizaciones continuas** del sistema

**¡Tu empresa está a punto de transformar su gestión del talento humano!**

---

**¿Necesitas ayuda?** Contáctanos en soporte@competencymanager.com
**🌐 Más información:** www.competencymanager.com