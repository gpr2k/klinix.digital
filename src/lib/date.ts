/** Local-time-only date utilities. We deliberately avoid `new Date(string)`
 *  with date-only strings to dodge UTC parsing pitfalls. */

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_LABELS_PT_SHORT = [
  'Dom',
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
] as const;

export const WEEKDAY_LABELS = WEEKDAY_LABELS_PT_SHORT;

/** Pads `value` with leading zeros to length 2. */
function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

/** Returns today as "YYYY-MM-DD" in the local timezone. */
export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/** Builds a "YYYY-MM-DD" string from the given Y/M/D triple. */
export function toISODate(year: number, monthIdx: number, day: number): string {
  return `${year}-${pad2(monthIdx + 1)}-${pad2(day)}`;
}

/** Parses a "YYYY-MM-DD" date into its components. Returns null when invalid. */
export function parseISODate(
  iso: string,
): { year: number; monthIdx: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIdx = Number(match[2]) - 1;
  const day = Number(match[3]);
  return { year, monthIdx, day };
}

export interface MonthGridDay {
  iso: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  weekday: number;
}

/** Returns the 6×7 = 42-day grid for the month containing `iso`, starting on
 *  Sunday. */
export function buildMonthGrid(iso: string): MonthGridDay[] {
  const parsed = parseISODate(iso);
  const today = todayISO();
  if (!parsed) return [];
  const firstOfMonth = new Date(parsed.year, parsed.monthIdx, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - startWeekday);
  const days: MonthGridDay[] = [];
  for (let i = 0; i < 42; i += 1) {
    const cursor = new Date(gridStart);
    cursor.setDate(gridStart.getDate() + i);
    const cursorIso = toISODate(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate(),
    );
    days.push({
      iso: cursorIso,
      day: cursor.getDate(),
      isCurrentMonth: cursor.getMonth() === parsed.monthIdx,
      isToday: cursorIso === today,
      weekday: cursor.getDay(),
    });
  }
  return days;
}

/** Adds `delta` months to the YYYY-MM-DD `iso`. Day rolls back if needed. */
export function shiftMonth(iso: string, delta: number): string {
  const parsed = parseISODate(iso);
  if (!parsed) return iso;
  const cursor = new Date(parsed.year, parsed.monthIdx + delta, 1);
  return toISODate(cursor.getFullYear(), cursor.getMonth(), 1);
}

/** Adds `delta` days to the YYYY-MM-DD `iso`. */
export function shiftDay(iso: string, delta: number): string {
  const parsed = parseISODate(iso);
  if (!parsed) return iso;
  const cursor = new Date(parsed.year, parsed.monthIdx, parsed.day + delta);
  return toISODate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
}

/** Returns the first ("YYYY-MM-01") and last ("YYYY-MM-DD") days of the month
 *  containing `iso`. */
export function monthBounds(iso: string): { start: string; end: string } {
  const parsed = parseISODate(iso);
  if (!parsed) return { start: iso, end: iso };
  const last = new Date(parsed.year, parsed.monthIdx + 1, 0);
  return {
    start: toISODate(parsed.year, parsed.monthIdx, 1),
    end: toISODate(parsed.year, parsed.monthIdx, last.getDate()),
  };
}

/** Formats "YYYY-MM-DD" as e.g. "Maio 2026". */
export function formatMonthYear(iso: string): string {
  const parsed = parseISODate(iso);
  if (!parsed) return iso;
  return `${MONTH_NAMES_PT[parsed.monthIdx]} ${parsed.year}`;
}

/** Formats "YYYY-MM-DD" as e.g. "Sexta-feira, 8 de Maio". */
export function formatLongDate(iso: string): string {
  const parsed = parseISODate(iso);
  if (!parsed) return iso;
  const cursor = new Date(parsed.year, parsed.monthIdx, parsed.day);
  const weekdays = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  return `${weekdays[cursor.getDay()]}, ${parsed.day} de ${MONTH_NAMES_PT[parsed.monthIdx]}`;
}

/** "HH:MM" or "HH:MM:SS" → minutes since 00:00. */
export function timeToMinutes(time: string): number {
  const [h = '0', m = '0'] = time.split(':');
  return Number(h) * 60 + Number(m);
}

/** Minutes since 00:00 → "HH:MM" (clamped to 0..1439). */
export function minutesToTime(minutes: number): string {
  const clamped = Math.max(0, Math.min(60 * 24 - 1, minutes));
  return `${pad2(Math.floor(clamped / 60))}:${pad2(clamped % 60)}`;
}

/** Adds `minutes` to a "HH:MM"/"HH:MM:SS" time, returning "HH:MM". */
export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}
