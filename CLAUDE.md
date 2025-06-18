# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript CLI tool called "sloc" for calculating Service Level Objectives (SLO) and Error Budget metrics from CSV event data. The tool processes event data containing timestamps, good events, and bad events to calculate reliability metrics.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to `dist/` directory
- **Start**: `npm run start` - Runs the compiled CLI from `dist/index.js`
- **Development**: `npm run dev` - Runs TypeScript compiler in watch mode with node --watch
- **Test**: Currently no tests configured (test script exits with error)

## CLI Usage

The main command is `calculate` which processes CSV files:
```bash
node dist/index.js calculate -f <csv-file> [-t <target-slo>]
```

- `-f, --csv-file`: Required path to CSV file with event data
- `-t, --target-slo`: Optional target SLO percentage (default: 99.9)

## Architecture

The codebase follows a modular structure:

- **Entry Point**: `src/index.ts` - Sets up and runs the CLI
- **CLI Setup**: `src/cli.ts` - Configures Commander.js program and registers commands
- **Commands**: `src/command/` - Individual CLI command implementations
- **Utilities**: `src/utils/` - Core business logic modules
  - `calculator.ts` - SLO/SLI calculation algorithms
  - `csvParser.ts` - CSV file parsing with validation
- **Types**: `src/types.ts` - TypeScript interfaces for EventData and CalculationResult

## CSV Data Format

Expected CSV format (no headers):
```
timestamp,goodEvents,badEvents
2024-01-01 00:00:00,1000,10
```

The parser validates data types and skips malformed rows with warnings.

## Key Calculations

- **SLI (Service Level Indicator)**: (Good Events / Total Events) × 100
- **Error Budget**: (100 - Target SLO) × Total Events
- **Remaining Error Budget**: Error Budget - Bad Events

Results are displayed with 4 decimal places for percentages and 2 for event counts.