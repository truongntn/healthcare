import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const decisionSchema = Joi.object({
  aiId: Joi.string().required(),
  userId: Joi.string().required(),
  decision: Joi.string().valid('confirm', 'reject').required(),
  note: Joi.string().optional()
});

// Log AI decision (confirm/reject)
router.post('/decision', authenticateToken, async (req, res) => {
  try {
    const { error, value } = decisionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { aiId, userId, decision, note } = value;
    
    // Verify user matches authenticated user (or admin)
    if (userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const db = await getDb();
    const decisionId = uuidv4();

    // Store AI decision
    await db('decision_logs').insert({
      id: decisionId,
      ai_id: aiId,
      user_id: userId,
      decision,
      note: note || null,
      ai_payload: JSON.stringify(req.body.aiPayload || {})
    });

    // Log for audit
    console.log(`AI Decision: ${decision} by user ${userId} for AI ${aiId}`);

    res.json({ logged: true, decisionId });

  } catch (error) {
    console.error('AI decision error:', error);
    res.status(500).json({ error: 'Failed to log AI decision' });
  }
});

// Get AI decisions for audit
router.get('/decisions', authenticateToken, async (req, res) => {
  try {
    const { userId, aiId, decision, limit = 100 } = req.query;

    // Only admins can view all decisions
    if (!userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const db = await getDb();
    let query = db('decision_logs')
      .leftJoin('users', 'decision_logs.user_id', 'users.id')
      .select(
        'decision_logs.*',
        'users.first_name as user_first_name',
        'users.last_name as user_last_name',
        'users.email as user_email'
      )
      .orderBy('decision_logs.created_at', 'desc')
      .limit(parseInt(limit));

    if (userId) {
      query = query.where({ 'decision_logs.user_id': userId });
    } else if (req.user.role !== 'admin') {
      // Regular users can only see their own decisions
      query = query.where({ 'decision_logs.user_id': req.user.userId });
    }

    if (aiId) {
      query = query.where({ 'decision_logs.ai_id': aiId });
    }

    if (decision) {
      query = query.where({ 'decision_logs.decision': decision });
    }

    const decisions = await query;

    const formattedDecisions = decisions.map(d => ({
      ...d,
      user_name: `${d.user_first_name} ${d.user_last_name}`,
      ai_payload: JSON.parse(d.ai_payload || '{}')
    }));

    res.json(formattedDecisions);

  } catch (error) {
    console.error('Get AI decisions error:', error);
    res.status(500).json({ error: 'Failed to get AI decisions' });
  }
});

// Get AI decision statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Only admins can view stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const db = await getDb();
    
    const stats = await db('decision_logs')
      .select('decision')
      .count('* as count')
      .groupBy('decision');

    const totalDecisions = stats.reduce((sum, s) => sum + s.count, 0);
    
    const summary = {
      totalDecisions,
      confirmRate: 0,
      rejectRate: 0,
      byDecision: {}
    };

    stats.forEach(stat => {
      const rate = totalDecisions > 0 ? (stat.count / totalDecisions) : 0;
      summary.byDecision[stat.decision] = {
        count: stat.count,
        rate: Math.round(rate * 100) / 100
      };

      if (stat.decision === 'confirm') {
        summary.confirmRate = rate;
      } else if (stat.decision === 'reject') {
        summary.rejectRate = rate;
      }
    });

    res.json(summary);

  } catch (error) {
    console.error('Get AI stats error:', error);
    res.status(500).json({ error: 'Failed to get AI statistics' });
  }
});

export default router;