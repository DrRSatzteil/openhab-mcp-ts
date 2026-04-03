import fs from 'fs';

/**
 * Utility to read the last N lines of a file without loading the whole file into memory.
 */
export async function readLastLines(filePath: string, maxLines: number): Promise<string[]> {
  try {
    if (!fs.existsSync(filePath)) return [];

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const bufferSize = Math.min(fileSize, 65536); // 64KB chunks
    const buffer = Buffer.alloc(bufferSize);

    const fd = fs.openSync(filePath, 'r');
    let lines: string[] = [];
    let position = fileSize;

    while (lines.length <= maxLines && position > 0) {
      const readSize = Math.min(position, bufferSize);
      position -= readSize;
      fs.readSync(fd, buffer, 0, readSize, position);

      const chunk = buffer.slice(0, readSize).toString();
      const chunkLines = chunk.split('\n');

      // If we're not at the very end of the file, the first line of this chunk might be partial
      // and should be merged with the last line of the previous chunk.
      if (lines.length > 0) {
        lines[0] = (chunkLines.pop() || '') + lines[0];
      }

      lines = [...chunkLines, ...lines];
    }

    fs.closeSync(fd);
    return lines.slice(-maxLines).filter((l) => l.trim().length > 0);
  } catch (error) {
    console.error(`[LogParser] Error reading ${filePath}:`, error);
    return [];
  }
}

/**
 * Parses events.log format into a standard event log string.
 */
export function normalizeEventLog(line: string): string | null {
  // Format: 2026-03-21 19:19:12.397 [INFO ] [openhab.event.ItemStateChangedEvent] - Item 'MultiSense_Laundry_Occupancy' changed from ON to OFF
  const match = line.match(
    /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) \[.*?\] \[(.*?)\] - (.*)$/
  );
  if (!match) return null;

  const [, timestamp, eventSubtype, content] = match;
  const type = eventSubtype.split('.').pop() || eventSubtype;
  return `${timestamp} - ${type} - ${content}`;
}
