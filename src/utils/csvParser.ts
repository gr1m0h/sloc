import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { EventData } from "../types";

export async function parseCsvFile(filePath: string): Promise<EventData[]> {
  const records: EventData[] = [];
  const parser = createReadStream(filePath).pipe(
    parse({
      columns: false,
      skip_empty_lines: true,
    }),
  );

  for await (const record of parser) {
    if (record.length < 3) {
      console.warn(`Skipping malformed row: ${record.join(",")}`);
      continue;
    }
    const timestamp = new Date(record[0]);
    const goodEvents = parseInt(record[1], 10);
    const badEvents = parseInt(record[2], 10);

    if (isNaN(timestamp.getTime()) || isNaN(goodEvents) || isNaN(badEvents)) {
      console.warn(`Skipping row with invalid data: ${record.join(",")}`);
      continue;
    }

    records.push({
      timestamp,
      goodEvents,
      badEvents,
    });
  }
  return records;
}
