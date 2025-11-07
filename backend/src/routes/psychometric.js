import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export default function psychometricRouter(prisma) {
  router.use(requireAuth);

  // 1. Crear/Actualizar perfil psicométrico para un análisis de puesto
  router.post('/profiles', async (req, res, next) => {
    try {
      const { jobAnalysisId, opennessWeight, conscientiousnessWeight, extraversionWeight, agreeablenessWeight, neuroticismWeight } = req.body;
      
      // Validar que los pesos sumen 100%
      const totalWeight = opennessWeight + conscientiousnessWeight + extraversionWeight + agreeablenessWeight + neuroticismWeight;
      if (Math.abs(totalWeight - 100) > 0.01) {
        return res.status(400).json({ error: 'Los pesos deben sumar 100%' });
      }

      const profile = await prisma.psychometricProfile.upsert({
        where: { jobAnalysisId },
        update: {
          opennessWeight,
          conscientiousnessWeight,
          extraversionWeight,
          agreeablenessWeight,
          neuroticismWeight
        },
        create: {
          jobAnalysisId,
          organizationId: req.organizationId,
          opennessWeight,
          conscientiousnessWeight,
          extraversionWeight,
          agreeablenessWeight,
          neuroticismWeight
        }
      });

      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  // 2. Obtener perfil psicométrico
  router.get('/profiles/:jobAnalysisId', async (req, res, next) => {
    try {
      const profile = await prisma.psychometricProfile.findUnique({
        where: { 
          jobAnalysisId: req.params.jobAnalysisId,
          organizationId: req.organizationId 
        },
        include: {
          jobAnalysis: {
            include: { position: true }
          }
        }
      });

      if (!profile) {
        return res.status(404).json({ error: 'Perfil psicométrico no encontrado' });
      }

      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  // 3. Importar resultados de prueba (CSV o JSON)
  router.post('/results/import', async (req, res, next) => {
    try {
      const { profileId, candidateId, employeeId, openness, conscientiousness, extraversion, agreeableness, neuroticism, notes } = req.body;

      // Validar que los puntajes estén en rango 0-100
      const scores = [openness, conscientiousness, extraversion, agreeableness, neuroticism];
      if (scores.some(score => score < 0 || score > 100)) {
        return res.status(400).json({ error: 'Los puntajes deben estar entre 0 y 100' });
      }

      // Obtener perfil para calcular fit
      const profile = await prisma.psychometricProfile.findUnique({
        where: { id: profileId, organizationId: req.organizationId }
      });

      if (!profile) {
        return res.status(404).json({ error: 'Perfil psicométrico no encontrado' });
      }

      // Calcular fit score
      const fitScore = calculateFitScore(
        { openness, conscientiousness, extraversion, agreeableness, neuroticism },
        profile
      );

      const result = await prisma.psychometricResult.create({
        data: {
          profileId,
          candidateId,
          employeeId,
          organizationId: req.organizationId,
          openness,
          conscientiousness,
          extraversion,
          agreeableness,
          neuroticism,
          fitScore,
          notes,
          importedBy: req.userId
        },
        include: {
          candidate: true,
          employee: true,
          profile: {
            include: {
              jobAnalysis: {
                include: { position: true }
              }
            }
          }
        }
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // 4. Obtener resultados por perfil
  router.get('/results/profile/:profileId', async (req, res, next) => {
    try {
      const results = await prisma.psychometricResult.findMany({
        where: { 
          profileId: req.params.profileId,
          organizationId: req.organizationId 
        },
        include: {
          candidate: true,
          employee: true
        },
        orderBy: { fitScore: 'desc' }
      });

      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  // 5. Obtener ranking de candidatos por fit score
  router.get('/ranking/:profileId', async (req, res, next) => {
    try {
      const results = await prisma.psychometricResult.findMany({
        where: { 
          profileId: req.params.profileId,
          organizationId: req.organizationId,
          fitScore: { not: null }
        },
        include: {
          candidate: true,
          employee: true,
          profile: {
            include: {
              jobAnalysis: {
                include: { position: true }
              }
            }
          }
        },
        orderBy: { fitScore: 'desc' }
      });

      res.json(results);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

// Función para calcular el fit score
function calculateFitScore(scores, profile) {
  // Normalizar neuroticism (invertir porque menor neuroticism es mejor)
  const normalizedNeuroticism = 100 - scores.neuroticism;
  
  // Calcular score ponderado
  const weightedScore = (
    (scores.openness * profile.opennessWeight / 100) +
    (scores.conscientiousness * profile.conscientiousnessWeight / 100) +
    (scores.extraversion * profile.extraversionWeight / 100) +
    (scores.agreeableness * profile.agreeablenessWeight / 100) +
    (normalizedNeuroticism * profile.neuroticismWeight / 100)
  );

  return Math.round(weightedScore * 100) / 100; // Redondear a 2 decimales
}