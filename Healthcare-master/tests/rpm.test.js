import { expect } from '@jest/globals';

describe('RPM Alert Rules', () => {
  const checkThreshold = (type, value, thresholds) => {
    const rules = thresholds[type];
    if (!rules) return null;

    if (rules.critical_high && value >= rules.critical_high) {
      return 'critical';
    } else if (rules.critical_low && value <= rules.critical_low) {
      return 'critical';
    } else if (rules.high && value >= rules.high) {
      return 'high';
    } else if (rules.low && value <= rules.low) {
      return 'low';
    }
    return null;
  };

  const thresholds = {
    heart_rate: { low: 50, high: 120, critical_high: 150 },
    oxygen_saturation: { low: 90, critical_low: 85 },
    blood_pressure_systolic: { high: 140, critical_high: 180 }
  };

  test('should trigger high heart rate alert', () => {
    const result = checkThreshold('heart_rate', 125, thresholds);
    expect(result).toBe('high');
  });

  test('should trigger critical heart rate alert', () => {
    const result = checkThreshold('heart_rate', 155, thresholds);
    expect(result).toBe('critical');
  });

  test('should trigger low oxygen saturation alert', () => {
    const result = checkThreshold('oxygen_saturation', 88, thresholds);
    expect(result).toBe('low');
  });

  test('should trigger critical low oxygen saturation alert', () => {
    const result = checkThreshold('oxygen_saturation', 82, thresholds);
    expect(result).toBe('critical');
  });

  test('should not trigger alert for normal values', () => {
    expect(checkThreshold('heart_rate', 75, thresholds)).toBeNull();
    expect(checkThreshold('oxygen_saturation', 98, thresholds)).toBeNull();
    expect(checkThreshold('blood_pressure_systolic', 120, thresholds)).toBeNull();
  });

  test('should handle unknown observation types', () => {
    const result = checkThreshold('unknown_type', 100, thresholds);
    expect(result).toBeNull();
  });
});
</boltTest>