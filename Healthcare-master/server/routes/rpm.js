import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const observationSchema = Joi.object({
  patientId: Joi.string().required(),
  type: Joi.string().valid(
    'heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic',
    'oxygen_saturation', 'temperature', 'weight', 'glucose'
  ).required(),
  value: Joi.number().required(),
  unit: Joi.string().required(),
  deviceId: Joi.string().optional(),
  observedAt: Joi.date().iso().default(() => new Date().toISOString())
});

// RPM observation ingestion
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = observationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const db = await getDb();
    const observationId = uuidv4();

    // Insert observation
    await db('observations').insert({
      id: observationId,
      patient_id: value.patientId,
      type: value.type,
      value: value.value,
      unit: value.unit,
      device_id: value.deviceId,
      observed_at: value.observedAt
    });

    // Check for alerts based on simple threshold rules
    const alerts = await checkThresholds(value, observationId, db);

    // Create notifications for alerts
    if (alerts.length > 0) {
      for (const alert of alerts) {
        // Notify clinicians associated with this patient
        const clinicians = await db('users')
          .where({ role: 'clinician', active: true })
          .select('id');

        for (const clinician of clinicians) {
          await db('notifications').insert({
            id: uuidv4(),
            user_id: clinician.id,
            type: 'alert',
            payload: JSON.stringify({
              alertId: alert.id,
              patientId: value.patientId,
              observationType: value.type,
              alertType: alert.type,
              message: alert.message
            })
          });
        }
      }
    }

    res.status(201).json({
      observationId,
      alerts: alerts.map(alert => ({
        id: alert.id,
        type: alert.type,
        message: alert.message
      })),
      stored: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('RPM ingestion error:', error);
    res.status(500).json({ error: 'Failed to process observation' });
  }
});

// Get observations for patient
router.get('/observations', authenticateToken, async (req, res) => {
  try {
    const { patientId, type, from, to, limit = 100 } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId required' });
    }

    const db = await getDb();
    let query = db('observations')
      .where({ patient_id: patientId })
      .orderBy('observed_at', 'desc')
      .limit(parseInt(limit));

    if (type) {
      query = query.where({ type });
    }

    if (from) {
      query = query.where('observed_at', '>=', from);
    }

    if (to) {
      query = query.where('observed_at', '<=', to);
    }

    const observations = await query;
    res.json(observations);

  } catch (error) {
    console.error('Get observations error:', error);
    res.status(500).json({ error: 'Failed to get observations' });
  }
});

// Get alerts for patient
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const { patientId, status, limit = 50 } = req.query;

    const db = await getDb();
    let query = db('alerts')
      .leftJoin('observations', 'alerts.observation_id', 'observations.id')
      .select(
        'alerts.*',
        'observations.type as observation_type',
        'observations.value as observation_value',
        'observations.observed_at'
      )
      .orderBy('alerts.created_at', 'desc')
      .limit(parseInt(limit));

    if (patientId) {
      query = query.where({ 'alerts.patient_id': patientId });
    }

    if (status) {
      query = query.where({ 'alerts.status': status });
    }

    const alerts = await query;
    res.json(alerts);

  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

// Acknowledge alert
router.post('/alerts/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const alertId = req.params.id;
    const db = await getDb();

    await db('alerts').where({ id: alertId }).update({
      status: 'acknowledged',
      acknowledged_by: req.user.userId,
      acknowledged_at: new Date().toISOString()
    });

    res.json({ ok: true });

  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// Simple threshold checking function
async function checkThresholds(observation, observationId, db) {
  const alerts = [];
  const { patientId, type, value } = observation;

  // Simple threshold rules (in production, these would be configurable per patient)
  const thresholds = {
    heart_rate: { low: 50, high: 120, critical_high: 150 },
    oxygen_saturation: { low: 90, critical_low: 85 },
    blood_pressure_systolic: { high: 140, critical_high: 180 },
    blood_pressure_diastolic: { high: 90, critical_high: 110 },
    temperature: { low: 96.0, high: 100.4, critical_high: 103.0 },
    glucose: { low: 70, high: 180, critical_high: 300 }
  };

  if (!thresholds[type]) {
    return alerts; // No thresholds defined for this observation type
  }

  const rules = thresholds[type];
  let alertType = null;
  let message = '';

  // Check thresholds
  if (rules.critical_high && value >= rules.critical_high) {
    alertType = 'critical';
    message = `Critical high ${type}: ${value} (threshold: ${rules.critical_high})`;
  } else if (rules.critical_low && value <= rules.critical_low) {
    alertType = 'critical';
    message = `Critical low ${type}: ${value} (threshold: ${rules.critical_low})`;
  } else if (rules.high && value >= rules.high) {
    alertType = 'high';
    message = `High ${type}: ${value} (threshold: ${rules.high})`;
  } else if (rules.low && value <= rules.low) {
    alertType = 'low';
    message = `Low ${type}: ${value} (threshold: ${rules.low})`;
  }

  if (alertType) {
    const alertId = uuidv4();
    
    await db('alerts').insert({
      id: alertId,
      patient_id: patientId,
      observation_id: observationId,
      type: alertType,
      message,
      status: 'active'
    });

    alerts.push({
      id: alertId,
      type: alertType,
      message
    });
  }

  return alerts;
}

export default router;