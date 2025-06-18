export interface EventData {
  timestamp: Date;
  goodEvents: number;
  badEvents: number;
}

export interface CalculationResult {
  totalEvents: number;
  totalGoodEvents: number;
  totalBadEvents: number;
  sli: number; // Service Level Indicator (Good Event / Total Events)
  slo: number; // Target Service Level Objective (e.g., 99.9)
  errorBudgetPercentage: number; // (100 - SLO)
  errorBudgetEvents: number; // Total Events * Eroror Budget Percentage
  remainingErrorBudgetEvents: number; // Error Budget Events - Bad Events
  errorBudgetBurnRate?: number; // Optional: (Bad Events / Error Badget Events) over a period
}

export interface CommonCommandOptions {
  csvFile: string;
}
