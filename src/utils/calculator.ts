import { argv0 } from "process";
import { EventData, CalculationResult } from "../types";

export function calculateSLI(goodEvents: number, totalEvents: number): number {
  if (totalEvents === 0) {
    return 0;
  }
  return (goodEvents / totalEvents) * 100;
}

export function calculateSloAndErrorBudget(
  events: EventData[],
  targetSLO: number,
): CalculationResult {
  let totalGoodEvents = 0;
  let totalBadEvents = 0;

  for (const event of events) {
    totalGoodEvents += event.goodEvents;
    totalBadEvents += event.badEvents;
  }

  const totalEvents = totalGoodEvents + totalBadEvents;
  const sli = calculateSLI(totalGoodEvents, totalEvents);

  const errorBudgetPercentage = 100 - targetSLO;
  const errorBudgetEvents = (totalEvents * errorBudgetPercentage) / 100;
  const remainingErrorBudgetEvents = Math.max(
    0,
    errorBudgetEvents - totalBadEvents,
  );

  return {
    totalEvents,
    totalGoodEvents,
    totalBadEvents,
    sli: parseFloat(sli.toFixed(4)),
    slo: targetSLO,
    errorBudgetPercentage: parseFloat(errorBudgetPercentage.toFixed(4)),
    errorBudgetEvents: parseFloat(errorBudgetEvents.toFixed(2)),
    remainingErrorBudgetEvents: parseFloat(
      remainingErrorBudgetEvents.toFixed(2),
    ),
  };
}
