import { Command } from "commander";
import { registerCalculateCommand } from "./command/calculate";

export function setupCli(): Command {
  const program = new Command();

  program
    .name("sloc")
    .description("CLI tool for calculating SLO and Error Budget.")
    .version("1.0.0");

  registerCalculateCommand(program);

  return program;
}
