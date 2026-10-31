export type SpecRow = { label: string; value: string };

// Splits pasted manufacturer spec text into label/value rows (catalog.md OQ-CAT-2).
// Accepts "label: value", "label：value" (full-width) and "label<TAB>value". Lines without a
// separator, or with an empty side, are returned as leftovers for the free-text spec note.
const SEPARATOR = /^\s*(?:\d+[.)、]\s*)?([^:：\t]{1,80}?)\s*(?:[:：]|\t)\s*(.+?)\s*$/;

export function parseSpecs(text: string): { rows: SpecRow[]; leftovers: string[] } {
  const rows: SpecRow[] = [];
  const leftovers: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = SEPARATOR.exec(line);
    if (m && m[1].trim() && m[2].trim())
      rows.push({ label: m[1].trim(), value: m[2].trim().slice(0, 500) });
    else leftovers.push(line);
  }
  return { rows, leftovers };
}
