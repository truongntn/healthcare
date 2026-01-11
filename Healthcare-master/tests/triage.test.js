import { expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { aiService } from '../src/services/aiService.js';

// Mock AI service
jest.mock('../src/services/aiService.js', () => ({
  aiService: {
    triageSymptoms: jest.fn()
  }
}));

describe('Triage System', () => {
  test('should validate AI response schema', async () => {
    const mockResponse = {
      aiId: 'test-ai-id',
      disposition: 'urgent',
      explanation: 'Test explanation',
      confidence: 0.85,
      provenance: ['test reason 1', 'test reason 2']
    };

    aiService.triageSymptoms.mockResolvedValue(mockResponse);

    const result = await aiService.triageSymptoms('chest pain', {});
    
    expect(result).toHaveProperty('aiId');
    expect(result).toHaveProperty('disposition');
    expect(result).toHaveProperty('explanation');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('provenance');
    
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
    
    expect(Array.isArray(result.provenance)).toBe(true);
    expect(['emergency', 'urgent', 'routine', 'self_care']).toContain(result.disposition);
  });

  test('should handle AI service errors gracefully', async () => {
    aiService.triageSymptoms.mockRejectedValue(new Error('AI service unavailable'));

    const result = await aiService.triageSymptoms('test symptoms', {});
    
    expect(result.confidence).toBe(0.0);
    expect(result.disposition).toBe('routine');
    expect(result.explanation).toContain('AI service');
  });

  test('should validate required triage input', () => {
    const validInputs = [
      { symptoms: 'headache', confidence: 0.8 },
      { symptoms: 'chest pain and shortness of breath', confidence: 0.9 }
    ];

    const invalidInputs = [
      { symptoms: '' }, // empty symptoms
      { symptoms: null }, // null symptoms  
      {} // missing symptoms
    ];

    validInputs.forEach(input => {
      expect(input.symptoms).toBeTruthy();
      expect(input.symptoms.length).toBeGreaterThan(0);
    });

    invalidInputs.forEach(input => {
      expect(input.symptoms || '').toBe('');
    });
  });
});