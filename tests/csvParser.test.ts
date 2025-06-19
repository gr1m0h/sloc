import { parseCsvFile } from '../src/utils/csvParser';
import { EventData } from '../src/types';
import { promises as fs } from 'fs';
import path from 'path';

describe('csvParser', () => {
  const testCsvDir = path.join(__dirname, 'fixtures');
  const testCsvPath = path.join(testCsvDir, 'test-events.csv');

  beforeAll(async () => {
    await fs.mkdir(testCsvDir, { recursive: true });
    
    const testCsvContent = [
      '2024-01-01 00:00:00,1000,10',
      '2024-01-01 01:00:00,990,5',
      '2024-01-02 00:00:00,1020,8',
      '2024-01-02 01:00:00,980,12',
      '2024-01-03 00:00:00,1010,7',
      '2024-01-03 01:00:00,995,3',
    ].join('\n');
    
    await fs.writeFile(testCsvPath, testCsvContent);
  });

  afterAll(async () => {
    try {
      await fs.unlink(testCsvPath);
      await fs.rmdir(testCsvDir);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('parseCsvFile without date filtering', () => {
    it('should parse all rows correctly', async () => {
      const events = await parseCsvFile(testCsvPath);
      
      expect(events).toHaveLength(6);
      expect(events[0]).toEqual({
        timestamp: new Date('2024-01-01 00:00:00'),
        goodEvents: 1000,
        badEvents: 10,
      });
      expect(events[5]).toEqual({
        timestamp: new Date('2024-01-03 01:00:00'),
        goodEvents: 995,
        badEvents: 3,
      });
    });
  });

  describe('parseCsvFile with start date filtering', () => {
    it('should filter out events before start date', async () => {
      const startDate = new Date('2024-01-02 00:00:00');
      const events = await parseCsvFile(testCsvPath, startDate);
      
      expect(events).toHaveLength(4);
      expect(events[0].timestamp).toEqual(new Date('2024-01-02 00:00:00'));
      expect(events.every(event => event.timestamp >= startDate)).toBe(true);
    });
  });

  describe('parseCsvFile with end date filtering', () => {
    it('should filter out events after end date', async () => {
      const endDate = new Date('2024-01-02 00:00:00');
      const events = await parseCsvFile(testCsvPath, undefined, endDate);
      
      expect(events).toHaveLength(3);
      expect(events[2].timestamp).toEqual(new Date('2024-01-02 00:00:00'));
      expect(events.every(event => event.timestamp <= endDate)).toBe(true);
    });
  });

  describe('parseCsvFile with both start and end date filtering', () => {
    it('should filter events to specified date range', async () => {
      const startDate = new Date('2024-01-01 01:00:00');
      const endDate = new Date('2024-01-02 01:00:00');
      const events = await parseCsvFile(testCsvPath, startDate, endDate);
      
      expect(events).toHaveLength(3);
      expect(events[0].timestamp).toEqual(new Date('2024-01-01 01:00:00'));
      expect(events[2].timestamp).toEqual(new Date('2024-01-02 01:00:00'));
      expect(events.every(event => 
        event.timestamp >= startDate && event.timestamp <= endDate
      )).toBe(true);
    });

    it('should return empty array when no events in date range', async () => {
      const startDate = new Date('2024-01-04 00:00:00');
      const endDate = new Date('2024-01-05 00:00:00');
      const events = await parseCsvFile(testCsvPath, startDate, endDate);
      
      expect(events).toHaveLength(0);
    });
  });

  describe('parseCsvFile with exclude dates', () => {
    it('should exclude events from specified dates', async () => {
      const excludeDates = [new Date('2024-01-02 00:00:00')];
      const events = await parseCsvFile(testCsvPath, undefined, undefined, excludeDates);
      
      expect(events).toHaveLength(4);
      // Should exclude all events from 2024-01-02
      expect(events.every(event => 
        event.timestamp.toDateString() !== new Date('2024-01-02').toDateString()
      )).toBe(true);
      
      // Should include events from other dates
      expect(events.some(event => 
        event.timestamp.toDateString() === new Date('2024-01-01').toDateString()
      )).toBe(true);
      expect(events.some(event => 
        event.timestamp.toDateString() === new Date('2024-01-03').toDateString()
      )).toBe(true);
    });

    it('should exclude events from multiple specified dates', async () => {
      const excludeDates = [
        new Date('2024-01-01 00:00:00'),
        new Date('2024-01-03 00:00:00')
      ];
      const events = await parseCsvFile(testCsvPath, undefined, undefined, excludeDates);
      
      expect(events).toHaveLength(2);
      // Should only include events from 2024-01-02
      expect(events.every(event => 
        event.timestamp.toDateString() === new Date('2024-01-02').toDateString()
      )).toBe(true);
    });

    it('should work with date range filtering and exclude dates', async () => {
      const startDate = new Date('2024-01-01 00:00:00');
      const endDate = new Date('2024-01-03 23:59:59');
      const excludeDates = [new Date('2024-01-02 00:00:00')];
      const events = await parseCsvFile(testCsvPath, startDate, endDate, excludeDates);
      
      expect(events).toHaveLength(4);
      // Should exclude 2024-01-02 but include 2024-01-01 and 2024-01-03
      expect(events.every(event => 
        event.timestamp.toDateString() !== new Date('2024-01-02').toDateString()
      )).toBe(true);
    });

    it('should return all events when exclude dates is empty', async () => {
      const excludeDates: Date[] = [];
      const events = await parseCsvFile(testCsvPath, undefined, undefined, excludeDates);
      
      expect(events).toHaveLength(6);
    });
  });

  describe('error handling', () => {
    it('should handle malformed CSV gracefully', async () => {
      const malformedCsvPath = path.join(testCsvDir, 'malformed.csv');
      const malformedContent = [
        '2024-01-01 00:00:00,1000,10',
        'invalid-date,990,5',
        '2024-01-01 02:00:00,abc,8',
        '2024-01-01 04:00:00,1010,7',
      ].join('\n');
      
      await fs.writeFile(malformedCsvPath, malformedContent);
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const events = await parseCsvFile(malformedCsvPath);
      
      expect(events).toHaveLength(2);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      
      consoleSpy.mockRestore();
      await fs.unlink(malformedCsvPath);
    });

  });
});