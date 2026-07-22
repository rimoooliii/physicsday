export const LEDGER_TIME_ZONE = 'Asia/Shanghai';

export function calendarDate(date: Date, timeZone = LEDGER_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${value.year}-${value.month}-${value.day}`;
}
