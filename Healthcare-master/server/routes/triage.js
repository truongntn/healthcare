import express from 'express';
import Joi from 'joi';
import { aiService } from '../services/aiService.js';
import { getDb } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const triageSchema = Joi.object({
  symptoms: Joi.string().required().min(1).max(5000),
  patientId: Joi.string().optional(),
  urgency: Joi.string().valid('low', 'medium', 'high').optional(),
  duration: Joi.string().optional(),
  previousConditions: Joi.array().items(Joi.string()).optional()
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = triageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { symptoms, patientId, urgency, duration, previousConditions } = value;
    
    // Get patient history if patientId provided
    let patientHistory = {};
    if (patientId) {
      const db = await getDb();
      const patient = await db('patients')
        .where({ id: patientId })
        .first();
      
      if (patient) {
        patientHistory = {
          medicalHistory: JSON.parse(patient.medical_history || '{}'),
          demographics: {
            dateOfBirth: patient.date_of_birth,
            gender: patient.gender
          }
        };
      }
    }

    // Add context from request
    if (urgency || duration || previousConditions) {
      patientHistory.currentContext = {
        urgency,
        duration,
        previousConditions
      };
    }

    // Call AI service
    const triageResult = await aiService.triageSymptoms(symptoms, patientHistory);

    // Add disclaimer
    const response = {
      ...triageResult,
      disclaimer: 'This is a prototype AI system. Always consult with qualified healthcare professionals for medical advice.',
      timestamp: new Date().toISOString()
    };

    // Log the triage request for audit (in production, implement proper audit logging)
    console.log(`Triage Request: User ${req.user.userId}, AI ID ${triageResult.aiId}, Disposition: ${triageResult.disposition}`);

    res.json(response);

  } catch (error) {
    console.error('Triage endpoint error:', error);
    res.status(500).json({ 
      error: 'Triage service error',
      message: 'Please try again or consult with a healthcare provider directly'
    });
  }
});

export default router;