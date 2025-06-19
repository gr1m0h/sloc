import { calculateSLI, calculateSLOAndErrorBudget } from '../src/utils/calculator';
import { EventData } from '../src/types';

describe('calculator', () => {
  describe('calculateSLI', () => {
    it('should calculate SLI correctly', () => {
      expect(calculateSLI(950, 1000)).toBe(95);
      expect(calculateSLI(999, 1000)).toBe(99.9);
      expect(calculateSLI(1000, 1000)).toBe(100);
    });

    it('should handle zero total events', () => {
      expect(calculateSLI(0, 0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(calculateSLI(99.5, 100)).toBe(99.5);
      expect(calculateSLI(33.33, 100)).toBe(33.33);
    });
  });

  describe('calculateSLOAndErrorBudget', () => {
    const sampleEvents: EventData[] = [
      { timestamp: new Date('2024-01-01'), goodEvents: 1000, badEvents: 10 },
      { timestamp: new Date('2024-01-02'), goodEvents: 990, badEvents: 5 },
      { timestamp: new Date('2024-01-03'), goodEvents: 1020, badEvents: 8 },
    ];

    it('should calculate all metrics correctly for 99.9% SLO', () => {
      const result = calculateSLOAndErrorBudget(sampleEvents, 99.9);
      
      expect(result.totalEvents).toBe(3033);
      expect(result.totalGoodEvents).toBe(3010);
      expect(result.totalBadEvents).toBe(23);
      expect(result.sli).toBe(99.2417);
      expect(result.slo).toBe(99.9);
      expect(result.errorBudgetPercentage).toBe(0.1);
      expect(result.errorBudgetEvents).toBe(3.03);
      expect(result.remainingErrorBudgetEvents).toBe(0);
    });

    it('should calculate all metrics correctly for 99% SLO', () => {
      const result = calculateSLOAndErrorBudget(sampleEvents, 99);
      
      expect(result.totalEvents).toBe(3033);
      expect(result.totalGoodEvents).toBe(3010);
      expect(result.totalBadEvents).toBe(23);
      expect(result.sli).toBe(99.2417);
      expect(result.slo).toBe(99);
      expect(result.errorBudgetPercentage).toBe(1);
      expect(result.errorBudgetEvents).toBe(30.33);
      expect(result.remainingErrorBudgetEvents).toBe(7.33);
    });

    it('should handle single event', () => {
      const singleEvent: EventData[] = [
        { timestamp: new Date('2024-01-01'), goodEvents: 100, badEvents: 5 }
      ];
      
      const result = calculateSLOAndErrorBudget(singleEvent, 95);
      
      expect(result.totalEvents).toBe(105);
      expect(result.totalGoodEvents).toBe(100);
      expect(result.totalBadEvents).toBe(5);
      expect(result.sli).toBe(95.2381);
      expect(result.slo).toBe(95);
      expect(result.errorBudgetPercentage).toBe(5);
      expect(result.errorBudgetEvents).toBe(5.25);
      expect(result.remainingErrorBudgetEvents).toBe(0.25);
    });

    it('should handle empty events array', () => {
      const result = calculateSLOAndErrorBudget([], 99.9);
      
      expect(result.totalEvents).toBe(0);
      expect(result.totalGoodEvents).toBe(0);
      expect(result.totalBadEvents).toBe(0);
      expect(result.sli).toBe(0);
      expect(result.slo).toBe(99.9);
      expect(result.errorBudgetPercentage).toBe(0.1);
      expect(result.errorBudgetEvents).toBe(0);
      expect(result.remainingErrorBudgetEvents).toBe(0);
    });

    it('should handle perfect SLI (no bad events)', () => {
      const perfectEvents: EventData[] = [
        { timestamp: new Date('2024-01-01'), goodEvents: 1000, badEvents: 0 },
        { timestamp: new Date('2024-01-02'), goodEvents: 1000, badEvents: 0 },
      ];
      
      const result = calculateSLOAndErrorBudget(perfectEvents, 99.9);
      
      expect(result.totalEvents).toBe(2000);
      expect(result.totalGoodEvents).toBe(2000);
      expect(result.totalBadEvents).toBe(0);
      expect(result.sli).toBe(100);
      expect(result.remainingErrorBudgetEvents).toBe(2);
    });

    it('should handle decimal event counts', () => {
      const decimalEvents: EventData[] = [
        { timestamp: new Date('2024-01-01'), goodEvents: 99.5, badEvents: 0.5 },
        { timestamp: new Date('2024-01-02'), goodEvents: 98.7, badEvents: 1.3 },
      ];
      
      const result = calculateSLOAndErrorBudget(decimalEvents, 99);
      
      expect(result.totalEvents).toBe(200);
      expect(result.totalGoodEvents).toBe(198.2);
      expect(result.totalBadEvents).toBe(1.8);
      expect(result.sli).toBe(99.1);
      expect(result.errorBudgetEvents).toBe(2);
      expect(result.remainingErrorBudgetEvents).toBe(0.2);
    });

    it('should cap remaining error budget at 0 when exceeded', () => {
      const highErrorEvents: EventData[] = [
        { timestamp: new Date('2024-01-01'), goodEvents: 900, badEvents: 100 },
      ];
      
      const result = calculateSLOAndErrorBudget(highErrorEvents, 99.9);
      
      expect(result.totalEvents).toBe(1000);
      expect(result.totalBadEvents).toBe(100);
      expect(result.errorBudgetEvents).toBe(1);
      expect(result.remainingErrorBudgetEvents).toBe(0);
    });
  });
});