export const DEFAULT_PERFORMANCE_TIME_ZONE = "Europe/Zurich";

export function validTimeZone(value: unknown) {
  if (typeof value !== "string" || value.length < 3 || value.length > 64) return DEFAULT_PERFORMANCE_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en", { timeZone:value }).format(new Date());
    return value;
  } catch {
    return DEFAULT_PERFORMANCE_TIME_ZONE;
  }
}

export function localDayKey(date = new Date(), timeZone = DEFAULT_PERFORMANCE_TIME_ZONE) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone, year:"numeric", month:"2-digit", day:"2-digit" }).format(date);
}

export function localMonthKey(date = new Date(), timeZone = DEFAULT_PERFORMANCE_TIME_ZONE) {
  return localDayKey(date, timeZone).slice(0, 7);
}

export function previousLocalDayKey(date = new Date(), timeZone = DEFAULT_PERFORMANCE_TIME_ZONE) {
  const today = localDayKey(date, timeZone);
  return new Date(Date.parse(`${today}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
}
