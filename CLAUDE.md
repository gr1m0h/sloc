# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

**Build and Run:**
- `npm run build` - Compile TypeScript to JavaScript in dist/ directory
- `npm start` - Run the built CLI tool
- `npm run dev` - Watch mode for development (rebuild on changes)

**Testing:**
- `npm test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Architecture

**Core Structure:**
- `src/index.ts` - Entry point that sets up and parses CLI
- `src/cli.ts` - CLI configuration using Commander.js
- `src/command/calculate.ts` - Main calculate command implementation with date filtering
- `src/utils/calculator.ts` - SLO/Error Budget calculation logic
- `src/utils/csvParser.ts` - CSV parsing with date filtering support
- `src/types.ts` - TypeScript interfaces for EventData and CalculationResult

**Key Concepts:**
- EventData contains timestamp, goodEvents, and badEvents from CSV input
- CalculationResult provides comprehensive SLO metrics including SLI, error budget, and remaining budget
- Date filtering supports start/end dates and exclude-dates for incident handling
- CSV format: timestamp,goodEvents,badEvents (no headers)

**Command Pattern:**
- Commands are registered in `cli.ts` via `registerCalculateCommand()`
- Each command module exports a registration function that adds the command to Commander
- Command options include file path, target SLO, and date filtering parameters

**Testing:**
- Tests are in `tests/` directory using Jest with ts-jest preset
- Coverage excludes entry points (index.ts, cli.ts)
- Test structure covers units (calculator, csvParser) and CLI integration