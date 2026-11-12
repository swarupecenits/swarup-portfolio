const partOf = (parts, type) => parts.find((part) => part.type === type)?.value;

/** Wall-clock time in `timeZone`, e.g. "2:45 PM". */
export const formatClock = (date, timeZone) =>
  new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);

/** Hour of the day (0-23) in `timeZone`. */
export function getHourInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).formatToParts(date);
  return Number(partOf(parts, "hour")) % 24;
}

/** Short zone name such as "IST", or "" when the runtime cannot provide one. */
export function getZoneName(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat("en-IN", { timeZone, timeZoneName: "short" }).formatToParts(date);
    return partOf(parts, "timeZoneName") ?? "";
  } catch {
    return "";
  }
}

/** Minutes east of UTC in `timeZone` (330 for Asia/Kolkata), or null when unknown. */
export function getUtcOffsetMinutes(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" }).formatToParts(date);
    const name = partOf(parts, "timeZoneName");
    if (name === "GMT") return 0;
    const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(name ?? "");
    if (!match) return null;
    const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
    return match[1] === "-" ? -minutes : minutes;
  } catch {
    return null;
  }
}

/** Describes a time difference in minutes, e.g. "5h 30m ahead of you". */
export function describeTimeDifference(minutes) {
  if (minutes === 0) return "Same time as you";
  const total = Math.abs(minutes);
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  const amount = [hours ? `${hours}h` : "", remainder ? `${remainder}m` : ""].filter(Boolean).join(" ");
  return `${amount} ${minutes > 0 ? "ahead of" : "behind"} you`;
}
