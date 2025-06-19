# sloc: Service Level Objective Calculator

`sloc` is a command-line interface(CLI) tool written in Typescript for calculating Service Level Objectives (SLOs) and Error Budgets based on Good and Bad event counts from a CSV file. It provides immediate insights into your service's performance against its defined SLOs.

## Features

- Calculate Service Level Indicator(SLI) from Good and Bad event counts.
- Determines Error Budget Events based on a target SLO.
- Shows Remaining Error Budget, indicating how much room is left before breaching the SLO.
- Simple CSV input format for event data.
- Designed with extensibility for future SLO-related calculations.

## Installation

To use `sloc`, you need to have Node.js and npm (or yarn) installed on your system.

### 1. Clone the repository

```bash
git clone https://github.com/gr1m0h/sloc.git # Replace with your repo URL
cd sloc
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the project

```bash
npm run build
```

## Usage

### CSV File Format

The input CSV file should contain event data in the following format (no header row):

```csv
| Column 1              | Column 2 (Good Events) | Column 3 (Bad Events) |
| :-------------------- | :--------------------- | :-------------------- |
| `YYYY-MM-DD HH:MM:SS` | `integer`              | `integer`             |

```

Example `events.csv`:

```csv
2024-01-01 00:00:00,1000,10
2024-01-01 01:00:00,990,5
2024-01-01 02:00:00,1020,8
2024-01-01 03:00:00,980,12
2024-01-01 04:00:00,1010,7
```

### Calculating SLO and Error Budget

Run the calculate command, providing the path to your CSV file and an optional target SLO.

```bash
sloc calculate --file <path-to-csv-file> --t <target-slo-percentage>
```

Options:

- `-f, --csv-file <file>`: (Required) Path to the CSV file containing event data.
- `-t, --target-slo <percentage>`: (Optional) Target SLO percentage (default is 99.9).
- `--start-date <date>`: (Optional) Start date for filtering (YYYY-MM-DD or YYYY-MM-DD HH:mm:ss format).
- `--end-date <date>`: (Optional) End date for filtering (YYYY-MM-DD or YYYY-MM-DD HH:mm:ss format).

Examples:

```bash
# Basic usage
sloc calculate -f events.csv -t 99.9

# Filter data for a specific date range
sloc calculate -f events.csv -t 99.9 --start-date "2024-01-01" --end-date "2024-01-31"

# Filter with specific time range
sloc calculate -f events.csv -t 99.9 --start-date "2024-01-01 00:00:00" --end-date "2024-01-01 23:59:59"
```

## Output Explanation

The tool will output a summary of the SLO and Error Budget calculation. Here's what each line means:

```bash
--- SLO/Error Budget Calculation Results ---
Target SLO:                  99%
Total Events:                5042
Total Good Events:           5000
Total Bad Events:            42
Service Level Indicator (SLI): 99.167%
Error Budget Percentage:     1%
Error Budget Events:         50.42 events
Remaining Error Budget:      8.42 events
-------------------------------------------
```

- Target SLO: Your defined service level objective. This is the desired percentage of time your service should be performing correctly.
- Total Events: The total number of events (sum of Good and Bad Events) observed during the measurement period from your CSV.
- Total Good Events: The number of events where the service performed as expected.
- Total Bad Events: The number of events where the service experienced an error or did not perform as expected.
- Service Level Indicator (SLI): The actual measured performance of your service during the period. Calculated as (Total Good Events / Total Events) \* 100%.
- Error Budget Percentage: The maximum allowable percentage of "bad" events to still meet your Target SLO. Calculated as (100 - Target SLO).
- Error Budget Events: The absolute number of "bad" events you can tolerate before breaching your Target SLO. Calculated as (Total Events \* Error Budget Percentage) / 100.
- Remaining Error Budget: The number of "bad" events you can still afford before breaching your Target SLO. Calculated as (Error Budget Events - Total Bad Events).
  - A positive value means you are currently within your SLO.
  - A negative value indicates that the SLO has already been breached, and you have consumed more errors than your budget allows.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
