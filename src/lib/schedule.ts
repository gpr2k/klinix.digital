import type { DayOfWeek, ScheduleInput } from './types';

/** Mon..Sat. Sunday (0) is intentionally omitted per product spec. */
export const WEEKDAYS: { day: DayOfWeek; label: string; short: string }[] = [
  { day: 1, label: 'Segunda-feira', short: 'Seg' },
  { day: 2, label: 'Terça-feira', short: 'Ter' },
  { day: 3, label: 'Quarta-feira', short: 'Qua' },
  { day: 4, label: 'Quinta-feira', short: 'Qui' },
  { day: 5, label: 'Sexta-feira', short: 'Sex' },
  { day: 6, label: 'Sábado', short: 'Sáb' },
];

export const DEFAULT_START = '08:00';
export const DEFAULT_END = '18:00';

export function defaultSchedules(): ScheduleInput[] {
  return WEEKDAYS.map(({ day }) => ({
    day_of_week: day,
    start_time: DEFAULT_START,
    end_time: DEFAULT_END,
    is_working: day !== 6, // Saturday off by default
  }));
}

/** Returns a copy of `schedules` with one entry per Mon..Sat, filling defaults
 *  for days the caller didn't provide. */
export function normalizeSchedules(
  schedules: ScheduleInput[],
): ScheduleInput[] {
  const byDay = new Map<DayOfWeek, ScheduleInput>();
  for (const schedule of schedules) {
    byDay.set(schedule.day_of_week, schedule);
  }
  return WEEKDAYS.map(({ day }) => {
    const found = byDay.get(day);
    if (found) return found;
    return {
      day_of_week: day,
      start_time: DEFAULT_START,
      end_time: DEFAULT_END,
      is_working: day !== 6,
    };
  });
}
