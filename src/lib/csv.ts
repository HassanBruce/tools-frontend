/** CSV parsing and serialisation, plus the object flattening the converter needs. */

export type Primitive = string | number | boolean | null;

/**
 * Flatten nested objects into dotted keys so no data is silently dropped when
 * writing a CSV row. Arrays of primitives collapse to a pipe-joined string;
 * arrays of objects are indexed.
 */
export function flatten(value: unknown, prefix = ""): Record<string, Primitive> {
  const out: Record<string, Primitive> = {};

  const assign = (key: string, item: unknown) => {
    if (item === null || item === undefined) {
      out[key] = null;
    } else if (Array.isArray(item)) {
      if (item.every((entry) => entry === null || typeof entry !== "object")) {
        out[key] = item.join(" | ");
      } else {
        item.forEach((entry, index) => assign(`${key}[${index}]`, entry));
      }
    } else if (typeof item === "object") {
      Object.assign(out, flatten(item, key));
    } else {
      out[key] = item as Primitive;
    }
  };

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    assign(prefix || "value", value);
    return out;
  }

  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    assign(prefix ? `${prefix}.${key}` : key, item);
  }

  return out;
}

/** Quote a value per RFC 4180 — only when it actually needs it. */
export function csvEscape(value: Primitive, delimiter: string): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  const needsQuotes =
    text.includes(delimiter) || text.includes('"') || text.includes("\n") || text.includes("\r");
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

export function jsonToCsv(data: unknown, delimiter = ","): string {
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length === 0) return "";

  const flatRows = rows.map((row) => flatten(row));

  // Union of every key, preserving first-seen order so columns stay predictable.
  const columns: string[] = [];
  for (const row of flatRows) {
    for (const key of Object.keys(row)) {
      if (!columns.includes(key)) columns.push(key);
    }
  }

  const lines = [columns.map((column) => csvEscape(column, delimiter)).join(delimiter)];

  for (const row of flatRows) {
    lines.push(columns.map((column) => csvEscape(row[column] ?? null, delimiter)).join(delimiter));
  }

  return lines.join("\n");
}

/**
 * Parse CSV into rows of raw strings. Handles quoted fields containing the
 * delimiter, escaped double quotes, and both CRLF and LF line endings.
 */
export function parseCsv(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      // Swallow the LF of a CRLF pair.
      if (char === "\r" && text[index + 1] === "\n") index++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Flush whatever is left, unless the file ended on a clean newline.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((entry) => entry.length > 1 || entry[0] !== "");
}

/** Best-effort typing so numbers and booleans do not come back as strings. */
function coerce(value: string): Primitive {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const asNumber = Number(trimmed);
    if (Number.isSafeInteger(asNumber) || !Number.isInteger(asNumber)) return asNumber;
  }
  return value;
}

export function csvToJson(
  text: string,
  { delimiter = ",", typed = true }: { delimiter?: string; typed?: boolean } = {},
): Record<string, Primitive>[] {
  const rows = parseCsv(text, delimiter);
  if (rows.length === 0) return [];

  const [header, ...body] = rows;

  return body.map((row) => {
    const entry: Record<string, Primitive> = {};
    header.forEach((column, index) => {
      const raw = row[index] ?? "";
      entry[column.trim() || `column_${index + 1}`] = typed ? coerce(raw) : raw;
    });
    return entry;
  });
}
