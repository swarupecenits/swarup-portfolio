/** True for date ranges such as "Jul 2026 - Present" that have not ended yet. */
export const isOngoing = (dateRange) => /\bpresent\b/i.test(dateRange ?? "");

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Converts a "May 2024" style date to the machine-readable "2024-05", or `undefined`. */
export function toISOMonth(date) {
  const match = /^([a-z]{3})[a-z]*\.?\s+(\d{4})$/i.exec(String(date ?? "").trim());
  if (!match) return undefined;
  const month = MONTHS.indexOf(match[1].toLowerCase());
  return month === -1 ? undefined : `${match[2]}-${String(month + 1).padStart(2, "0")}`;
}
