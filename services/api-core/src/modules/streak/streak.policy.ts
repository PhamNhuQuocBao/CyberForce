export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function validTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function localDate(now: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function priorDate(day: string): string {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function visibleStreak(
  streakDays: number,
  lastDate: string | null,
  now: Date,
  timezone: string,
): number {
  if (!lastDate) return 0;
  const today = localDate(now, timezone);
  return lastDate === today || lastDate === priorDate(today) ? streakDays : 0;
}

export function nextStreak(streakDays: number, lastDate: string | null, today: string): number {
  if (lastDate === today) return streakDays;
  return lastDate === priorDate(today) ? streakDays + 1 : 1;
}

export function boostedPoints(base: number, percent: number): number {
  return Math.round((base * percent) / 100);
}
