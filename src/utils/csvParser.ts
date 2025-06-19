import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { EventData } from "../types";

export async function parseCsvFile(filePath: string, startDate?: Date, endDate?: Date, excludeDates?: Date[]): Promise<EventData[]> {
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
    const goodEvents = parseFloat(record[1]);
    const badEvents = parseFloat(record[2]);

    if (isNaN(timestamp.getTime()) || isNaN(goodEvents) || isNaN(badEvents)) {
      console.warn(`Skipping row with invalid data: ${record.join(",")}`);
      continue;
    }

    if (startDate && timestamp < startDate) {
      continue;
    }

    if (endDate && timestamp > endDate) {
      continue;
    }

    if (excludeDates && excludeDates.length > 0) {
      const eventDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
      const isExcluded = excludeDates.some(excludeDate => {
        const excludeDateOnly = new Date(excludeDate.getFullYear(), excludeDate.getMonth(), excludeDate.getDate());
        return eventDate.getTime() === excludeDateOnly.getTime();
      });
      if (isExcluded) {
        continue;
      }
    }

    records.push({
      timestamp,
      goodEvents,
      badEvents,
    });
  }
  return records;
}
