import type { DayOfWeek, ScheduleInput } from '@/lib/types';
import { timeToMinutes } from '@/lib/format';
import { WEEKDAYS, normalizeSchedules } from '@/lib/schedule';

interface Props {
  schedules: ScheduleInput[];
  onChange: (schedules: ScheduleInput[]) => void;
  disabled?: boolean;
}

export function ScheduleGrid({ schedules, onChange, disabled }: Props) {
  const normalized = normalizeSchedules(schedules);

  const updateDay = (day: DayOfWeek, patch: Partial<ScheduleInput>) => {
    const next = normalized.map((schedule) =>
      schedule.day_of_week === day ? { ...schedule, ...patch } : schedule,
    );
    onChange(next);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th scope="col" className="w-1 px-3 py-2">
              Trabalha
            </th>
            <th scope="col" className="px-3 py-2">
              Dia
            </th>
            <th scope="col" className="px-3 py-2">
              Início
            </th>
            <th scope="col" className="px-3 py-2">
              Fim
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {normalized.map((schedule) => {
            const meta = WEEKDAYS.find(
              (entry) => entry.day === schedule.day_of_week,
            );
            const invalid =
              schedule.is_working &&
              timeToMinutes(schedule.end_time) <=
                timeToMinutes(schedule.start_time);
            return (
              <tr key={schedule.day_of_week} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={schedule.is_working}
                    onChange={(event) =>
                      updateDay(schedule.day_of_week, {
                        is_working: event.target.checked,
                      })
                    }
                    disabled={disabled}
                    aria-label={`${meta?.label} ativo`}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">
                  {meta?.label}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="time"
                    value={schedule.start_time}
                    onChange={(event) =>
                      updateDay(schedule.day_of_week, {
                        start_time: event.target.value,
                      })
                    }
                    disabled={disabled || !schedule.is_working}
                    aria-label={`Início ${meta?.label}`}
                    aria-invalid={invalid || undefined}
                    className={`w-full rounded-md border px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
                      invalid
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-200'
                    }`}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="time"
                    value={schedule.end_time}
                    onChange={(event) =>
                      updateDay(schedule.day_of_week, {
                        end_time: event.target.value,
                      })
                    }
                    disabled={disabled || !schedule.is_working}
                    aria-label={`Fim ${meta?.label}`}
                    aria-invalid={invalid || undefined}
                    className={`w-full rounded-md border px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
                      invalid
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-brand-500 focus:ring-brand-200'
                    }`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
