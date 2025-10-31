import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

export default function seedRouter(prisma) {
  router.post('/', async (req, res, next) => {
    const orgId = req.body.orgId || 'demo-org';
    try {
      // Create demo organization if it doesn't exist
      const demoOrg = await prisma.organization.upsert({
        where: { id: orgId },
        update: {},
        create: { id: orgId, name: 'Organización Demo' },
      });

      // Create admin user for demo
      const adminUser = await prisma.user.upsert({
        where: { organizationId_email: { email: 'admin@demo.com', organizationId: orgId } },
        update: {},
        create: {
          email: 'admin@demo.com',
          passwordHash: process.env.DEMO_PASSWORD_HASH || '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fYzYXkqO',
          isActive: true,
          organizationId: orgId,
          employee: {
            create: {
              firstName: 'Admin',
              lastName: 'Demo',
              title: 'Administrador',
              organizationId: orgId,
            },
          },
          roles: {
            create: [{ role: { connectOrCreate: { where: { name_organizationId: { name: 'admin', organizationId: orgId } }, create: { name: 'admin', organizationId: orgId } } } }],
          },
        },
      });
      // Seed Departments
      const departments = ['Ingeniería', 'Recursos Humanos', 'Ventas', 'Operaciones'];
      for (const name of departments) {
        await prisma.department.upsert({
          where: { organizationId_name: { organizationId: orgId, name } },
          update: {},
          create: { organizationId: orgId, name },
        });
      }

      // Seed Categories
      const categories = ['Habilidades Blandas', 'Habilidades Técnicas'];
      const categoryIds = {};
      for (const name of categories) {
        const cat = await prisma.category.upsert({
          where: { organizationId_name: { organizationId: orgId, name } },
          update: {},
          create: { organizationId: orgId, name },
        });
        categoryIds[name] = cat.id;
      }

      // Seed Competencies
      const competenciesToCreate = [
        { name: 'Comunicación', description: 'Capacidad para expresar ideas claramente', category: 'Habilidades Blandas' },
        { name: 'Trabajo en equipo', description: 'Colabora efectivamente con otros', category: 'Habilidades Blandas' },
        { name: 'Liderazgo', description: 'Guía y motiva al equipo', category: 'Habilidades Blandas' },
        { name: 'Resolución de problemas', description: 'Analiza y soluciona problemas complejos', category: 'Habilidades Blandas' },
        { name: 'Gestión del tiempo', description: 'Planifica y prioriza tareas efectivamente', category: 'Habilidades Blandas' },
        { name: 'JavaScript', description: 'Dominio del lenguaje JS', category: 'Habilidades Técnicas' },
        { name: 'Pruebas (unitarias/integración)', description: 'Diseño y ejecución de pruebas', category: 'Habilidades Técnicas' },
        { name: 'CI/CD', description: 'Integración y despliegue continuo', category: 'Habilidades Técnicas' },
        { name: 'SQL', description: 'Consultas y modelado de datos', category: 'Habilidades Técnicas' },
        { name: 'Infraestructura como código', description: 'Automatiza infra con código', category: 'Habilidades Técnicas' },
        { name: 'Observabilidad', description: 'Métricas, logs y trazas', category: 'Habilidades Técnicas' },
        { name: 'Accesibilidad', description: 'Buenas prácticas de A11Y', category: 'Habilidades Técnicas' },
        { name: 'Investigación UX', description: 'Técnicas de research con usuarios', category: 'Habilidades Técnicas' },
        { name: 'Prototipado', description: 'Construcción de prototipos y sistemas de diseño', category: 'Habilidades Técnicas' },
        { name: 'Estadística básica', description: 'Conceptos estadísticos para análisis', category: 'Habilidades Técnicas' },
        { name: 'Visualización de datos', description: 'Uso de herramientas BI/data viz', category: 'Habilidades Técnicas' },
        { name: 'Negociación', description: 'Técnicas de negociación y cierre', category: 'Habilidades Blandas' },
        { name: 'Orientación al cliente', description: 'Enfoque en necesidades del cliente', category: 'Habilidades Blandas' },
        { name: 'Gestión de incidentes', description: 'Respuesta y coordinación de incidentes', category: 'Habilidades Técnicas' },
      ];
      for (const c of competenciesToCreate) {
        await prisma.competency.upsert({
          where: { organizationId_name: { organizationId: orgId, name: c.name } },
          update: { description: c.description, categoryId: categoryIds[c.category] },
          create: { organizationId: orgId, name: c.name, description: c.description, categoryId: categoryIds[c.category] },
        });
      }

      // Map competency names -> ids
      const allComps = await prisma.competency.findMany({ where: { organizationId: orgId } });
      const compByName = Object.fromEntries(allComps.map(c => [c.name, c.id]));

      // Seed Positions with requirements
      const positions = [
        {
          name: 'Ingeniero de Software', level: 'Ssr', department: 'Ingeniería',
          requirements: [
            { comp: 'JavaScript', weight: 0.12, lvl: 4 },
            { comp: 'Pruebas (unitarias/integración)', weight: 0.08, lvl: 3 },
            { comp: 'CI/CD', weight: 0.08, lvl: 3 },
            { comp: 'Comunicación', weight: 0.08, lvl: 3 },
            { comp: 'Trabajo en equipo', weight: 0.10, lvl: 4 },
            { comp: 'Resolución de problemas', weight: 0.10, lvl: 4 },
            { comp: 'Gestión del tiempo', weight: 0.06, lvl: 3 },
          ],
        },
        {
          name: 'QA Automation', level: 'Ssr', department: 'Ingeniería',
          requirements: [
            { comp: 'Pruebas (unitarias/integración)', weight: 0.15, lvl: 4 },
            { comp: 'SQL', weight: 0.10, lvl: 3 },
            { comp: 'Comunicación', weight: 0.10, lvl: 3 },
            { comp: 'Resolución de problemas', weight: 0.10, lvl: 4 },
            { comp: 'Trabajo en equipo', weight: 0.10, lvl: 3 },
          ],
        },
        {
          name: 'DevOps / SRE', level: 'Ssr', department: 'Ingeniería',
          requirements: [
            { comp: 'Infraestructura como código', weight: 0.15, lvl: 4 },
            { comp: 'Observabilidad', weight: 0.12, lvl: 4 },
            { comp: 'Gestión de incidentes', weight: 0.12, lvl: 4 },
            { comp: 'Comunicación', weight: 0.10, lvl: 3 },
          ],
        },
        {
          name: 'Diseñador UX/UI', level: 'Ssr', department: 'Ingeniería',
          requirements: [
            { comp: 'Investigación UX', weight: 0.12, lvl: 3 },
            { comp: 'Prototipado', weight: 0.14, lvl: 4 },
            { comp: 'Accesibilidad', weight: 0.08, lvl: 3 },
            { comp: 'Comunicación', weight: 0.12, lvl: 4 },
          ],
        },
        {
          name: 'Analista de Datos / BI', level: 'Ssr', department: 'Operaciones',
          requirements: [
            { comp: 'SQL', weight: 0.15, lvl: 4 },
            { comp: 'Visualización de datos', weight: 0.12, lvl: 3 },
            { comp: 'Estadística básica', weight: 0.10, lvl: 3 },
            { comp: 'Comunicación', weight: 0.12, lvl: 4 },
          ],
        },
        {
          name: 'Ventas', level: 'Ssr', department: 'Ventas',
          requirements: [
            { comp: 'Negociación', weight: 0.15, lvl: 4 },
            { comp: 'Comunicación', weight: 0.12, lvl: 4 },
            { comp: 'Orientación al cliente', weight: 0.12, lvl: 4 },
          ],
        },
        {
          name: 'Soporte', level: 'Ssr', department: 'Operaciones',
          requirements: [
            { comp: 'Comunicación', weight: 0.12, lvl: 4 },
            { comp: 'Orientación al cliente', weight: 0.12, lvl: 4 },
            { comp: 'Gestión del tiempo', weight: 0.08, lvl: 3 },
          ],
        },
        {
          name: 'RR.HH.', level: 'Ssr', department: 'Recursos Humanos',
          requirements: [
            { comp: 'Comunicación', weight: 0.12, lvl: 4 },
            { comp: 'Resolución de problemas', weight: 0.10, lvl: 4 },
            { comp: 'Trabajo en equipo', weight: 0.10, lvl: 3 },
          ],
        },
      ];

      const deps = await prisma.department.findMany({ where: { organizationId: orgId } });
      const depByName = Object.fromEntries(deps.map(d => [d.name, d.id]));

      for (const p of positions) {
        const pos = await prisma.position.upsert({
          where: { organizationId_name: { organizationId: orgId, name: p.name } },
          update: { description: p.description || null, level: p.level || null, departmentId: depByName[p.department] || null },
          create: { organizationId: orgId, name: p.name, description: p.description || null, level: p.level || null, departmentId: depByName[p.department] || null },
        });
        const ops = [];
        for (const r of p.requirements) {
          const compId = compByName[r.comp];
          if (!compId) continue;
          ops.push(prisma.positionCompetency.upsert({
            where: { positionId_competencyId: { positionId: pos.id, competencyId: compId } },
            update: { weight: r.weight, expectedLvl: r.lvl },
            create: { positionId: pos.id, competencyId: compId, weight: r.weight, expectedLvl: r.lvl },
          }));
        }
        if (ops.length) await prisma.$transaction(ops);
      }

      // Seed Employees (unlinked to users)
      const allDepartments = await prisma.department.findMany({ where: { organizationId: orgId } });
      const depMap = Object.fromEntries(allDepartments.map(d => [d.name, d.id]));
      const employees = [
        { firstName: 'Ana', lastName: 'García', title: 'Desarrolladora', department: 'Ingeniería' },
        { firstName: 'Luis', lastName: 'Pérez', title: 'Líder Técnico', department: 'Ingeniería' },
        { firstName: 'María', lastName: 'López', title: 'HR Partner', department: 'Recursos Humanos' },
        { firstName: 'Carlos', lastName: 'Ruiz', title: 'Vendedor', department: 'Ventas' },
        { firstName: 'Sofia', lastName: 'Martinez', title: 'QA Engineer', department: 'Ingeniería' },
        { firstName: 'Diego', lastName: 'Fernandez', title: 'DevOps Engineer', department: 'Ingeniería' },
        { firstName: 'Laura', lastName: 'Gonzalez', title: 'UX Designer', department: 'Ingeniería' },
        { firstName: 'Miguel', lastName: 'Sanchez', title: 'Data Analyst', department: 'Operaciones' },
        { firstName: 'Elena', lastName: 'Torres', title: 'Sales Manager', department: 'Ventas' },
        { firstName: 'Pablo', lastName: 'Ramirez', title: 'Support Specialist', department: 'Operaciones' },
      ];
      for (const e of employees) {
        const exists = await prisma.employee.findFirst({
          where: { firstName: e.firstName, lastName: e.lastName, organizationId: orgId },
        });
        if (!exists) {
          await prisma.employee.create({
            data: {
              firstName: e.firstName,
              lastName: e.lastName,
              title: e.title,
              departmentId: depMap[e.department] || null,
              organizationId: orgId,
            },
          });
        }
      }

      // Seed Evaluation Templates
      const evalTemplate = await prisma.evaluationTemplate.upsert({
        where: { organizationId_name: { organizationId: orgId, name: 'Evaluación de Desempeño Anual' } },
        update: {},
        create: {
          organizationId: orgId,
          name: 'Evaluación de Desempeño Anual',
          description: 'Evaluación completa de competencias y desempeño',
          scaleMin: 1,
          scaleMax: 5,
        },
      });

      // Add competencies to template
      const templateCompetencies = [
        { competency: 'Comunicación', weight: 0.15 },
        { competency: 'Trabajo en equipo', weight: 0.15 },
        { competency: 'Liderazgo', weight: 0.10 },
        { competency: 'Resolución de problemas', weight: 0.15 },
        { competency: 'Gestión del tiempo', weight: 0.10 },
        { competency: 'JavaScript', weight: 0.20 },
        { competency: 'Pruebas (unitarias/integración)', weight: 0.15 },
      ];
      for (const tc of templateCompetencies) {
        const compId = compByName[tc.competency];
        if (compId) {
          await prisma.templateCompetency.upsert({
            where: { templateId_competencyId: { templateId: evalTemplate.id, competencyId: compId } },
            update: { weight: tc.weight },
            create: { templateId: evalTemplate.id, competencyId: compId, weight: tc.weight },
          });
        }
      }

      // Seed Evaluations for some employees
      const allEmployees = await prisma.employee.findMany({ where: { organizationId: orgId } });
      const empMap = Object.fromEntries(allEmployees.map(e => [`${e.firstName} ${e.lastName}`, e.id]));
      const hrManager = empMap['María López']; // HR Partner

      for (const emp of allEmployees.slice(0, 3)) { // First 3 employees
        const evaluation = await prisma.evaluation.upsert({
          where: { id: `${emp.id}-2024` }, // Simple unique key
          update: {},
          create: {
            employeeId: emp.id,
            templateId: evalTemplate.id,
            period: '2024',
            status: 'completada',
            dueDate: new Date('2024-12-31'),
            organizationId: orgId,
          },
        });

        // Create assignments
        const assignment = await prisma.evaluationAssignment.create({
          data: {
            evaluationId: evaluation.id,
            reviewerEmpId: hrManager,
            type: 'gerente',
            status: 'completado',
          },
        });

        // Add results
        const results = [
          { competency: 'Comunicación', score: 4 },
          { competency: 'Trabajo en equipo', score: 4 },
          { competency: 'JavaScript', score: 3 },
        ];
        for (const res of results) {
          const compId = compByName[res.competency];
          if (compId) {
            await prisma.evaluationResult.create({
              data: {
                assignmentId: assignment.id,
                competencyId: compId,
                score: res.score,
                comments: 'Buen desempeño en esta competencia',
              },
            });
          }
        }
      }

      // Seed Job Analyses
      const allPositions = await prisma.position.findMany({ where: { organizationId: orgId } });
      const posMap = Object.fromEntries(allPositions.map(p => [p.name, p.id]));

      const jobAnalyses = [
        {
          position: 'Ingeniero de Software',
          occupant: 'Ana García',
          supervisor: 'Luis Pérez',
          purpose: 'Desarrollar y mantener aplicaciones web utilizando tecnologías modernas',
          primaryDutyIndex: 1,
          functions: [
            { index: 1, title: 'Desarrollo de software', description: 'Escribir código limpio y eficiente', importance: 5, timePercent: 60 },
            { index: 2, title: 'Pruebas y debugging', description: 'Asegurar calidad del código', importance: 4, timePercent: 20 },
            { index: 3, title: 'Colaboración en equipo', description: 'Trabajar con otros desarrolladores', importance: 4, timePercent: 15 },
            { index: 4, title: 'Documentación', description: 'Mantener documentación técnica', importance: 3, timePercent: 5 },
          ],
        },
      ];

      for (const ja of jobAnalyses) {
        const posId = posMap[ja.position];
        const occupantId = empMap[ja.occupant];
        const supervisorId = empMap[ja.supervisor];
        if (posId && occupantId && supervisorId) {
          const existing = await prisma.jobAnalysis.findUnique({ where: { positionId: posId } });
          if (!existing) {
            const analysis = await prisma.jobAnalysis.create({
              data: {
                positionId: posId,
                organizationId: orgId,
                occupantEmployeeId: occupantId,
                supervisorEmployeeId: supervisorId,
                purpose: ja.purpose,
                primaryDutyIndex: ja.primaryDutyIndex,
              },
            });

          // Add functions
          for (const func of ja.functions) {
            await prisma.essentialFunction.create({
              data: {
                jobAnalysisId: analysis.id,
                index: func.index,
                title: func.title,
                description: func.description,
                importance: func.importance,
                timePercent: func.timePercent,
              },
            });
          }
          }
        }
      }

      // Seed Interviews
      const interviews = [
        {
          employee: 'Ana García',
          interviewer: 'Luis Pérez',
          type: 'desempeño',
          purpose: 'Revisión de desempeño anual',
          scheduledDate: new Date('2024-11-15'),
          status: 'completada',
          questions: [
            { question: '¿Cómo evalúas tu desempeño en el último año?', category: 'competencia', order: 1 },
            { question: '¿Qué objetivos te gustaría lograr el próximo año?', category: 'competencia', order: 2 },
          ],
        },
      ];

      for (const int of interviews) {
        const empId = empMap[int.employee];
        const interviewerId = empMap[int.interviewer];
        if (empId && interviewerId) {
          const interview = await prisma.interview.create({
            data: {
              employeeId: empId,
              interviewerId: interviewerId,
              type: int.type,
              purpose: int.purpose,
              scheduledDate: int.scheduledDate,
              actualDate: int.scheduledDate,
              status: int.status,
              duration: 60,
              organizationId: orgId,
            },
          });

          // Add questions
          for (const q of int.questions) {
            const question = await prisma.interviewQuestion.create({
              data: {
                interviewId: interview.id,
                question: q.question,
                category: q.category,
                order: q.order,
              },
            });

            // Add sample answer
            await prisma.interviewAnswer.create({
              data: {
                questionId: question.id,
                answer: 'Respuesta de ejemplo del empleado',
                rating: 4,
              },
            });
          }
        }
      }

      // Seed Observations
      const observations = [
        {
          employee: 'Ana García',
          observer: 'Luis Pérez',
          type: 'formal',
          context: 'Observación durante reunión de equipo',
          overallRating: 4,
          behaviors: [
            { description: 'Buena comunicación en la presentación', category: 'comunicacion', rating: 4 },
          ],
        },
      ];

      for (const obs of observations) {
        const empId = empMap[obs.employee];
        const observerId = empMap[obs.observer];
        if (empId && observerId) {
          const observation = await prisma.observation.create({
            data: {
              employeeId: empId,
              observerId: observerId,
              type: obs.type,
              context: obs.context,
              overallRating: obs.overallRating,
              duration: 30,
              status: 'completed',
              organizationId: orgId,
            },
          });

          // Add behaviors
          for (const beh of obs.behaviors) {
            await prisma.observationBehavior.create({
              data: {
                observationId: observation.id,
                description: beh.description,
                category: beh.category,
                rating: beh.rating,
              },
            });
          }
        }
      }

      // Seed Development Plans
      const devPlans = [
        {
          employee: 'Ana García',
          manager: 'Luis Pérez',
          title: 'Plan de Desarrollo Técnico',
          description: 'Mejorar habilidades en JavaScript y liderazgo',
          status: 'activo',
          priority: 'media',
          goals: [
            { title: 'Mejorar JavaScript', competency: 'JavaScript', targetLevel: 5, currentLevel: 3, status: 'en_progreso' },
          ],
        },
      ];

      for (const plan of devPlans) {
        const empId = empMap[plan.employee];
        const managerId = empMap[plan.manager];
        if (empId && managerId) {
          const devPlan = await prisma.developmentPlan.create({
            data: {
              employeeId: empId,
              managerId: managerId,
              title: plan.title,
              description: plan.description,
              startDate: new Date(),
              targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              status: plan.status,
              priority: plan.priority,
              organizationId: orgId,
            },
          });

          // Add goals
          for (const goal of plan.goals) {
            const compId = compByName[goal.competency];
            await prisma.developmentGoal.create({
              data: {
                planId: devPlan.id,
                title: goal.title,
                description: goal.title,
                competencyId: compId,
                targetLevel: goal.targetLevel,
                currentLevel: goal.currentLevel,
                status: goal.status,
              },
            });
          }
        }
      }

      // Seed Disciplinary Actions
      const disciplinaryActions = [
        {
          employee: 'Carlos Ruiz',
          issuedBy: 'María López',
          type: 'amonestacion_escrita',
          description: 'Retraso reiterado en entregas de proyectos',
          consequences: 'Monitoreo adicional y capacitación en gestión del tiempo',
          status: 'activa',
        },
      ];

      for (const da of disciplinaryActions) {
        const empId = empMap[da.employee];
        const issuedById = empMap[da.issuedBy];
        if (empId && issuedById) {
          await prisma.disciplinaryAction.create({
            data: {
              employeeId: empId,
              issuedById: issuedById,
              type: da.type,
              description: da.description,
              consequences: da.consequences,
              status: da.status,
              organizationId: orgId,
            },
          });
        }
      }

      // Seed Leave Balances
      const currentYear = new Date().getFullYear();
      for (const emp of allEmployees) {
        await prisma.leaveBalance.upsert({
          where: { employeeId_year: { employeeId: emp.id, year: currentYear } },
          update: {},
          create: {
            employeeId: emp.id,
            year: currentYear,
            vacationDays: 20,
            sickDays: 10,
            personalDays: 5,
            organizationId: orgId,
          },
        });
      }

      // Seed Training Courses
      const courses = [
        { title: 'JavaScript Avanzado', provider: 'Tech Academy', duration: 40, cost: 500 },
        { title: 'Liderazgo Efectivo', provider: 'Leadership Institute', duration: 20, cost: 300 },
        { title: 'Gestión del Tiempo', provider: 'Productivity Pro', duration: 8, cost: 150 },
      ];
      
      for (const course of courses) {
        const existingCourse = await prisma.trainingCourse.findFirst({
          where: { organizationId: orgId, title: course.title },
        });
        if (!existingCourse) {
          await prisma.trainingCourse.create({
            data: { ...course, organizationId: orgId },
          });
        }
      }

      // Seed Job Postings
      const softwareEngineerPos = allPositions.find(p => p.name === 'Ingeniero de Software');
      if (softwareEngineerPos) {
        await prisma.jobPosting.create({
          data: {
            title: 'Senior Software Engineer',
            description: 'Buscamos un ingeniero de software senior con experiencia en React y Node.js',
            positionId: softwareEngineerPos.id,
            departmentId: depMap['Ingeniería'],
            salaryMin: 60000,
            salaryMax: 80000,
            location: 'Remoto',
            employmentType: 'full_time',
            status: 'active',
            postedDate: new Date(),
            organizationId: orgId,
          },
        });
      }

      res.json({ status: 'ok', message: 'Seed completed with HR modules' });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
