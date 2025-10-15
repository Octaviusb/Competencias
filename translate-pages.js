import fs from 'fs';
import path from 'path';

// Diccionario de traducciones comunes
const translations = {
  // Títulos y headers
  'Dashboard': 'Panel de Control',
  'Employees': 'Empleados',
  'Employee': 'Empleado',
  'Departments': 'Departamentos',
  'Department': 'Departamento',
  'Positions': 'Posiciones',
  'Position': 'Posición',
  'Categories': 'Categorías',
  'Category': 'Categoría',
  'Competencies': 'Competencias',
  'Competency': 'Competencia',
  'Observations': 'Observaciones',
  'Observation': 'Observación',
  'Interviews': 'Entrevistas',
  'Interview': 'Entrevista',
  'Training': 'Capacitación',
  'Recruitment': 'Reclutamiento',
  'Analytics': 'Analíticas',
  'Attendance': 'Asistencia',
  
  // Acciones comunes
  'Actions': 'Acciones',
  'Edit': 'Editar',
  'Delete': 'Eliminar',
  'View': 'Ver',
  'Create': 'Crear',
  'Update': 'Actualizar',
  'Save': 'Guardar',
  'Cancel': 'Cancelar',
  'Submit': 'Enviar',
  'Add': 'Agregar',
  'Remove': 'Remover',
  'Search': 'Buscar',
  'Filter': 'Filtrar',
  'Export': 'Exportar',
  'Import': 'Importar',
  'Download': 'Descargar',
  'Upload': 'Subir',
  'Print': 'Imprimir',
  
  // Estados
  'Status': 'Estado',
  'Active': 'Activo',
  'Inactive': 'Inactivo',
  'Pending': 'Pendiente',
  'Approved': 'Aprobado',
  'Rejected': 'Rechazado',
  'Completed': 'Completado',
  'In Progress': 'En Progreso',
  'Draft': 'Borrador',
  
  // Campos comunes
  'Name': 'Nombre',
  'Description': 'Descripción',
  'Email': 'Correo Electrónico',
  'Phone': 'Teléfono',
  'Address': 'Dirección',
  'Date': 'Fecha',
  'Start Date': 'Fecha de Inicio',
  'End Date': 'Fecha de Fin',
  'Created At': 'Creado el',
  'Updated At': 'Actualizado el',
  'Type': 'Tipo',
  'Level': 'Nivel',
  'Score': 'Puntuación',
  'Comments': 'Comentarios',
  'Notes': 'Notas',
  'Reason': 'Motivo',
  
  // Mensajes
  'Loading...': 'Cargando...',
  'No data': 'Sin datos',
  'Success': 'Éxito',
  'Error': 'Error',
  'Warning': 'Advertencia',
  'Info': 'Información',
  'Confirm': 'Confirmar',
  'Are you sure?': '¿Estás seguro?',
  'This action cannot be undone': 'Esta acción no se puede deshacer',
  
  // Botones específicos
  'New Employee': 'Nuevo Empleado',
  'New Department': 'Nuevo Departamento',
  'New Position': 'Nueva Posición',
  'New Category': 'Nueva Categoría',
  'New Competency': 'Nueva Competencia',
  'New Observation': 'Nueva Observación',
  'New Interview': 'Nueva Entrevista',
  
  // Placeholders
  'Enter name': 'Ingrese nombre',
  'Enter description': 'Ingrese descripción',
  'Select option': 'Seleccione opción',
  'Search...': 'Buscar...',
  
  // Títulos de páginas específicas
  'Employee Management': 'Gestión de Empleados',
  'Department Management': 'Gestión de Departamentos',
  'Position Management': 'Gestión de Posiciones',
  'Competency Management': 'Gestión de Competencias',
  'Performance Observations': 'Observaciones de Desempeño',
  'Performance Interviews': 'Entrevistas de Desempeño',
  'Training Management': 'Gestión de Capacitación',
  'Recruitment Management': 'Gestión de Reclutamiento',
  'Attendance Management': 'Gestión de Asistencia',
  
  // Mensajes de error comunes
  'Error loading data': 'Error cargando datos',
  'Error saving data': 'Error guardando datos',
  'Error deleting data': 'Error eliminando datos',
  'Data saved successfully': 'Datos guardados exitosamente',
  'Data deleted successfully': 'Datos eliminados exitosamente',
  'Operation completed successfully': 'Operación completada exitosamente',
  
  // Validaciones
  'This field is required': 'Este campo es obligatorio',
  'Please enter a valid email': 'Por favor ingrese un email válido',
  'Please select an option': 'Por favor seleccione una opción',
  'Minimum length is': 'La longitud mínima es',
  'Maximum length is': 'La longitud máxima es'
};

function translateFile(filePath) {
  console.log(`Traduciendo: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Aplicar traducciones
  for (const [english, spanish] of Object.entries(translations)) {
    // Buscar en strings entre comillas
    const patterns = [
      new RegExp(`"${english}"`, 'g'),
      new RegExp(`'${english}'`, 'g'),
      new RegExp(`\`${english}\``, 'g'),
      // También buscar en JSX
      new RegExp(`>${english}<`, 'g'),
      new RegExp(`title="${english}"`, 'g'),
      new RegExp(`title='${english}'`, 'g'),
      new RegExp(`placeholder="${english}"`, 'g'),
      new RegExp(`placeholder='${english}'`, 'g'),
      new RegExp(`label="${english}"`, 'g'),
      new RegExp(`label='${english}'`, 'g')
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match) => {
          changed = true;
          return match.replace(english, spanish);
        });
      }
    });
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Traducido: ${path.basename(filePath)}`);
  } else {
    console.log(`⏭️  Sin cambios: ${path.basename(filePath)}`);
  }
  
  return changed;
}

function translateDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalChanged = 0;
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      totalChanged += translateDirectory(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (translateFile(filePath)) {
        totalChanged++;
      }
    }
  });
  
  return totalChanged;
}

// Ejecutar traducción
console.log('🌍 Iniciando traducción de páginas al español...\n');

const frontendPagesPath = 'd:\\Competencias\\frontend\\src\\pages';
const componentsPath = 'd:\\Competencias\\frontend\\src\\components';

let totalFiles = 0;

if (fs.existsSync(frontendPagesPath)) {
  console.log('📁 Traduciendo páginas...');
  totalFiles += translateDirectory(frontendPagesPath);
}

if (fs.existsSync(componentsPath)) {
  console.log('\n📁 Traduciendo componentes...');
  totalFiles += translateDirectory(componentsPath);
}

console.log(`\n🎉 Traducción completada!`);
console.log(`📊 Archivos modificados: ${totalFiles}`);
console.log(`\n💡 Nota: Algunas traducciones pueden requerir ajustes manuales para contexto específico.`);

export default { translateFile, translateDirectory, translations };