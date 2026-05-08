const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatBRL(value: number): string {
  return BRL.format(value);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}min`;
}

/** Parses "HH:MM" or "HH:MM:SS" into total minutes from 00:00. */
export function timeToMinutes(time: string): number {
  const [h = '0', m = '0'] = time.split(':');
  return Number(h) * 60 + Number(m);
}

/** Trims a Postgres `time` value ("HH:MM:SS") to "HH:MM" for inputs. */
export function toTimeInputValue(time: string): string {
  return time.slice(0, 5);
}

/** Formats a "YYYY-MM-DD" date string as "DD/MM/YYYY". Returns "—" when null. */
export function formatBirthDate(date: string | null): string {
  if (!date) return '—';
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
}

/** Formats a "YYYY-MM-DD" date string as "DD/MM/YYYY". Caller guarantees
 *  non-null. */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
}

/** Formats a Postgres `time` value ("HH:MM:SS" or "HH:MM") as "HH:MM". */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}
