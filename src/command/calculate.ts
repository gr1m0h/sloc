import { Command } from "commander";
import { parseCsvFile } from "../utils/csvParser";
import { calculateSloAndErrorBudget } from "../utils/calculator";
import { CommonCommandOptions } from "../types";

export function registerCalculateCommand(program: Command) {
  program
    .command("calculate")
    .description("Calculate SLO and Error Budget from a CSV file.")
    .requiredOption(
      "-f, --csv-file <file>",
      "Path to the CSV file containing event data.",
    )
    .option(
      "-t, --target-slo <percentage>",
      "Target SLO percentage (e.g., 99.9). Defaults to 99.9.",
      "99.9",
    )
    .action(async (options: { csvFile: string; targetSLO: string }) => {
      try {
        const targetSLO = parseFloat(options.targetSLO);
        if (isNaN(targetSLO) || targetSLO <= 0 || targetSLO >= 100) {
          console.error(
            "Error: Target SLO must be a number between 0 and 100 (exclusive).",
          );
          process.exit(1);
        }

        const events = await parseCsvFile(options.csvFile);
        if (events.length === 0) {
          console.error(
            "Error: No valid event data found n the CSV file. Please check the file format.",
          );
          process.exit(1);
        }

        const result = calculateSloAndErrorBudget(events, targetSLO);

        console.log("\n--- SLO/Error Budget Calculation Results ---");
        console.log(`Target SLO:                 ${result.slo}%`);
        console.log(`Total Events:               ${result.totalEvents}`);
        console.log(`Total Good Events:          ${result.totalGoodEvents}`);
        console.log(`Total Bad Events:           ${result.totalBadEvents}`);
        console.log(`Service Level Indicator (SLI): ${result.sli}%`);
        console.log(
          `Error Budget Percentage:    ${result.errorBudgetPercentage}%`,
        );
        console.log(
          `Error Budget Events:        ${result.errorBudgetEvents} events`,
        );
        console.log(
          `Remaining Error Budget:     ${result.remainingErrorBudgetEvents} events`,
        );

        if (result.remainingErrorBudgetEvents < 0) {
          console.warn("\n--- WARNING ---");
          console.warn(
            "The remaining error budget is negative, indicating that the SLO has been breached.",
          );
        }

        console.log("-------------------------------------------\n");
      } catch (error: any) {
        if (error.code === "ENOENT") {
          console.error(`Error: CSV file not found at "${options.csvFile}"`);
        } else {
          console.error(`An unexpected error occurred: ${error.message}`);
        }
        process.exit(1);
      }
    });
}
