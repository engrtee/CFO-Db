// Minimal, robust CSV parser for the CFO dashboard
// Returns an array of objects where keys are the header row values

export type CSVRow = Record<string, string>;

export function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted fields containing commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      if (line[c] === '"') {
        inQuotes = !inQuotes;
      } else if (line[c] === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += line[c];
      }
    }
    values.push(current.trim());

    const row: CSVRow = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

/** Parse a numeric cell, stripping $ , % and returning a float */
export function num(val: string | undefined): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[$,%]/g, '')) || 0;
}

/** Parse boolean cell ("true"/"false"/"1"/"0") */
export function bool(val: string | undefined): boolean {
  if (!val) return true;
  return val.toLowerCase() === 'true' || val === '1';
}
