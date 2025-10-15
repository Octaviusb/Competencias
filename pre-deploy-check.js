import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PreDeployChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type}: ${message}`);
  }

  addIssue(message) {
    this.issues.push(message);
    this.log('❌ ISSUE', message);
  }

  addWarning(message) {
    this.warnings.push(message);
    this.log('⚠️  WARNING', message);
  }

  addPassed(message) {
    this.passed.push(message);
    this.log('✅ PASSED', message);
  }

  // Verificar archivos de configuración
  checkConfigFiles() {
    this.log('INFO', 'Verificando archivos de configuración...');

    const requiredFiles = [
      'backend/.env',
      'backend/package.json',
      'frontend/package.json',
      'docker-compose.yml',
      'backend/prisma/schema.prisma'
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        this.addPassed(`Archivo requerido existe: ${file}`);
      } else {
        this.addIssue(`Archivo requerido faltante: ${file}`);
      }
    });
  }

  // Verificar variables de entorno
  checkEnvironmentVariables() {
    this.log('INFO', 'Verificando variables de entorno...');

    const envPath = path.join(__dirname, 'backend/.env');
    if (!fs.existsSync(envPath)) {
      this.addIssue('Archivo .env no encontrado en backend/');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'PORT',
      'FRONTEND_URL'
    ];

    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        this.addPassed(`Variable de entorno configurada: ${varName}`);
      } else {
        this.addIssue(`Variable de entorno faltante: ${varName}`);
      }
    });

    // Verificar que JWT_SECRET no sea el valor por defecto
    if (envContent.includes('JWT_SECRET=tu_clave_secreta_aqui')) {
      this.addIssue('JWT_SECRET sigue siendo el valor por defecto');
    }
  }

  // Verificar dependencias de seguridad
  checkSecurityDependencies() {
    this.log('INFO', 'Verificando dependencias de seguridad...');

    const backendPackagePath = path.join(__dirname, 'backend/package.json');
    if (fs.existsSync(backendPackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const securityDeps = ['helmet', 'cors', 'express-rate-limit', 'bcryptjs'];
      securityDeps.forEach(dep => {
        if (deps[dep]) {
          this.addPassed(`Dependencia de seguridad instalada: ${dep}`);
        } else {
          this.addWarning(`Dependencia de seguridad faltante: ${dep}`);
        }
      });
    }
  }

  // Verificar credenciales hardcodeadas
  checkHardcodedCredentials() {
    this.log('INFO', 'Verificando credenciales hardcodeadas...');

    const searchPatterns = [
      /password.*=.*["'].*["']/gi,
      /secret.*=.*["'].*["']/gi,
      /token.*=.*["'].*["']/gi,
      /api[_-]?key.*=.*["'].*["']/gi
    ];

    const excludeFiles = [
      '.env.example',
      'pre-deploy-check.js',
      'populate-demo-data.js',
      'fix-security-issues.js'
    ];

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !['node_modules', '.git', 'logs'].includes(file)) {
          scanDirectory(filePath);
        } else if (stat.isFile() && 
                   (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) &&
                   !excludeFiles.includes(file)) {
          
          const content = fs.readFileSync(filePath, 'utf8');
          searchPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
              matches.forEach(match => {
                if (!match.includes('process.env') && 
                    !match.includes('localStorage') && 
                    !match.includes('demo123') &&
                    !match.includes('example')) {
                  this.addWarning(`Posible credencial hardcodeada en ${filePath}: ${match.substring(0, 50)}...`);
                }
              });
            }
          });
        }
      });
    };

    scanDirectory(path.join(__dirname, 'backend/src'));
    scanDirectory(path.join(__dirname, 'frontend/src'));
  }

  // Verificar configuración de base de datos
  checkDatabaseConfig() {
    this.log('INFO', 'Verificando configuración de base de datos...');

    const schemaPath = path.join(__dirname, 'backend/prisma/schema.prisma');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      if (schema.includes('provider = "sqlite"')) {
        this.addWarning('Usando SQLite - considera PostgreSQL para producción');
      } else if (schema.includes('provider = "postgresql"')) {
        this.addPassed('Configurado para PostgreSQL');
      }

      if (schema.includes('@@unique') || schema.includes('@@index')) {
        this.addPassed('Schema incluye índices y restricciones únicas');
      }
    }
  }

  // Verificar configuración de Docker
  checkDockerConfig() {
    this.log('INFO', 'Verificando configuración de Docker...');

    const dockerComposePath = path.join(__dirname, 'docker-compose.yml');
    if (fs.existsSync(dockerComposePath)) {
      const dockerCompose = fs.readFileSync(dockerComposePath, 'utf8');
      
      if (dockerCompose.includes('ports:')) {
        this.addPassed('Docker Compose configurado con puertos');
      }

      if (dockerCompose.includes('environment:')) {
        this.addPassed('Variables de entorno configuradas en Docker');
      }

      if (dockerCompose.includes('volumes:')) {
        this.addPassed('Volúmenes configurados para persistencia');
      }
    }

    // Verificar Dockerfiles
    const backendDockerfile = path.join(__dirname, 'backend/Dockerfile');
    const frontendDockerfile = path.join(__dirname, 'frontend/Dockerfile');

    if (fs.existsSync(backendDockerfile)) {
      this.addPassed('Dockerfile del backend existe');
    } else {
      this.addWarning('Dockerfile del backend faltante');
    }

    if (fs.existsSync(frontendDockerfile)) {
      this.addPassed('Dockerfile del frontend existe');
    } else {
      this.addWarning('Dockerfile del frontend faltante');
    }
  }

  // Verificar scripts de package.json
  checkPackageScripts() {
    this.log('INFO', 'Verificando scripts de package.json...');

    const backendPackagePath = path.join(__dirname, 'backend/package.json');
    if (fs.existsSync(backendPackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
      const scripts = packageJson.scripts || {};

      const requiredScripts = ['start', 'dev'];
      requiredScripts.forEach(script => {
        if (scripts[script]) {
          this.addPassed(`Script del backend configurado: ${script}`);
        } else {
          this.addIssue(`Script del backend faltante: ${script}`);
        }
      });
    }
  }

  // Verificar logs y directorios
  checkDirectories() {
    this.log('INFO', 'Verificando estructura de directorios...');

    const requiredDirs = [
      'backend/logs',
      'backend/prisma',
      'frontend/src',
      'frontend/public'
    ];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(__dirname, dir);
      if (fs.existsSync(dirPath)) {
        this.addPassed(`Directorio existe: ${dir}`);
      } else {
        this.addWarning(`Directorio faltante: ${dir}`);
      }
    });
  }

  // Ejecutar todas las verificaciones
  async runAllChecks() {
    console.log('🚀 Iniciando verificación pre-deploy...\n');

    this.checkConfigFiles();
    this.checkEnvironmentVariables();
    this.checkSecurityDependencies();
    this.checkHardcodedCredentials();
    this.checkDatabaseConfig();
    this.checkDockerConfig();
    this.checkPackageScripts();
    this.checkDirectories();

    // Resumen
    console.log('\n📊 RESUMEN DE VERIFICACIÓN:');
    console.log(`✅ Verificaciones pasadas: ${this.passed.length}`);
    console.log(`⚠️  Advertencias: ${this.warnings.length}`);
    console.log(`❌ Problemas críticos: ${this.issues.length}`);

    if (this.issues.length > 0) {
      console.log('\n🚨 PROBLEMAS CRÍTICOS QUE DEBEN SOLUCIONARSE:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS A CONSIDERAR:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    const isReadyForDeploy = this.issues.length === 0;
    console.log(`\n${isReadyForDeploy ? '🎉' : '🛑'} Estado del deploy: ${isReadyForDeploy ? 'LISTO' : 'NO LISTO'}`);

    return {
      ready: isReadyForDeploy,
      issues: this.issues,
      warnings: this.warnings,
      passed: this.passed
    };
  }
}

// Ejecutar verificación si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new PreDeployChecker();
  checker.runAllChecks()
    .then((result) => {
      process.exit(result.ready ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Error durante la verificación:', error);
      process.exit(1);
    });
}

export default PreDeployChecker;