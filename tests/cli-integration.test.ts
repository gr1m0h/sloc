import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

describe('CLI Integration Tests', () => {
  const testCsvDir = path.join(__dirname, 'fixtures');
  const testCsvPath = path.join(testCsvDir, 'integration-test.csv');
  const cliPath = path.join(__dirname, '..', 'dist', 'index.js');

  beforeAll(async () => {
    await fs.mkdir(testCsvDir, { recursive: true });
    
    const testCsvContent = [
      '2024-01-01 00:00:00,1000,10',
      '2024-01-01 12:00:00,990,5',
      '2024-01-02 00:00:00,1020,8',
      '2024-01-02 12:00:00,980,12',
      '2024-01-03 00:00:00,1010,7',
      '2024-01-03 12:00:00,995,3',
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

  const runCLI = (args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number | null }> => {
    return new Promise((resolve) => {
      const child = spawn('node', [cliPath, ...args], {
        stdio: ['pipe', 'pipe', 'pipe'],
      } as SpawnOptionsWithoutStdio);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code });
      });
    });
  };

  describe('calculate command', () => {
    it('should calculate SLO without date filtering', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '-t', '99']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('--- SLO/Error Budget Calculation Results ---');
      expect(result.stdout).toContain('Target SLO:                 99%');
      expect(result.stdout).toContain('Total Events:               6040');
      expect(result.stdout).toContain('Total Good Events:          5995');
      expect(result.stdout).toContain('Total Bad Events:           45');
    });

    it('should calculate SLO with start date filtering', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '-t', '99', '--start-date', '2024-01-02']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Total Events:               3007');
      expect(result.stdout).toContain('Total Good Events:          2985');
      expect(result.stdout).toContain('Total Bad Events:           22');
    });

    it('should calculate SLO with end date filtering', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '-t', '99', '--end-date', '2024-01-02']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Total Events:               3033');
      expect(result.stdout).toContain('Total Good Events:          3010');
      expect(result.stdout).toContain('Total Bad Events:           23');
    });

    it('should calculate SLO with both start and end date filtering', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '-t', '99', '--start-date', '2024-01-01 12:00:00', '--end-date', '2024-01-02 12:00:00']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Total Events:               3015');
      expect(result.stdout).toContain('Total Good Events:          2990');
      expect(result.stdout).toContain('Total Bad Events:           25');
    });

    it('should return empty result when no events in date range', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '-t', '99', '--start-date', '2024-01-04', '--end-date', '2024-01-05']);
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Error: No valid event data found n the CSV file');
    });

    it('should show warning when SLO is breached', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '-t', '99.9']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Remaining Error Budget:     0 events');
    });
  });

  describe('error handling', () => {
    it('should handle non-existent file', async () => {
      const result = await runCLI(['calculate', '-f', '/non/existent/file.csv']);
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('ENOENT: no such file or directory');
    });

    it('should handle invalid target SLO', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '-t', '150']);
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Error: Target SLO must be a number between 0 and 100');
    });

    it('should handle invalid start date', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '--start-date', 'invalid-date']);
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Error: Invalid start date format');
    });

    it('should handle invalid end date', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '--end-date', 'invalid-date']);
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Error: Invalid end date format');
    });

    it('should handle start date after end date', async () => {
      const result = await runCLI(['calculate', '-f', testCsvPath, '--start-date', '2024-01-03', '--end-date', '2024-01-01']);
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Error: Start date must be before end date');
    });
  });

  describe('help command', () => {
    it('should show help information', async () => {
      const result = await runCLI(['--help']);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('calculate');
      expect(result.stdout).toContain('calculate');
    });
  });
});