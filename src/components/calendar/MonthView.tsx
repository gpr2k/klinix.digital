import { Plus } from 'lucide-react';
import { buildMonthGrid, WEEKDAY_LABELS } from '@/lib/date';
import { formatTime } from '@/lib/format';
import type { AppointmentRecord } from '@/lib/types';

interface Props {
  monthAnchor: string;
  appointments: AppointmentRecord[];
  onSelectDay: (iso: string) => void;
  onCreateOnDay: (iso: string) => void;
}

const MAX_CHIPS = 3;

export function MonthView({
  monthAnchor,
  appointments,
  onSelectDay,
  onCreateOnDay,
}: Props) {
  const grid = buildMonthGrid(monthAnchor);

  const byDay = new Map<string, AppointmentRecord[]>();
  for (const appointment of appointments) {
    const list = byDay.get(appointment.appointment_date) ?? [];
    list.push(appointment);
    byDay.set(appointment.appointment_date, list);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="px-3 py-2 text-center">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-slate-200">
        {grid.map((cell, index) => {
          const items = byDay.get(cell.iso) ?? [];
          const visible = items.slice(0, MAX_CHIPS);
          const overflow = items.length - visible.length;
          const isWeekStart = index % 7 === 0;
          const isFirstRow = index < 7;
          return (
            <div
              key={cell.iso}
              className={`group relative min-h-[110px] border-slate-200 p-2 ${
                isFirstRow ? '' : 'border-t'
              } ${isWeekStart ? '' : ''} ${
                cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectDay(cell.iso)}
                  className={`text-xs font-semibold tabular-nums ${
                    cell.isToday
                      ? 'rounded-full bg-brand-600 px-2 py-0.5 text-white'
                      : cell.isCurrentMonth
                        ? 'text-slate-700 hover:text-brand-700'
                        : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cell.day}
                </button>
                <button
                  type="button"
                  aria-label={`Novo agendamento em ${cell.iso}`}
                  onClick={() => onCreateOnDay(cell.iso)}
                  className="hidden rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 group-hover:inline-flex"
                >
                  <Plus size={14} />
                </button>
              </div>
              <ul className="mt-1 space-y-1">
                {visible.map((appointment) => (
                  <li key={appointment.id}>
                    <button
                      type="button"
                      onClick={() => onSelectDay(cell.iso)}
                      className="flex w-full items-center gap-1 truncate rounded bg-brand-50 px-1.5 py-0.5 text-left text-[11px] text-brand-700 hover:bg-brand-100"
                      title={`${formatTime(appointment.start_time)} ${
                        appointment.client?.full_name ?? 'Cliente'
                      } — ${appointment.service?.name ?? 'Serviço'}`}
                    >
                      <span className="font-medium tabular-nums">
                        {formatTime(appointment.start_time)}
                      </span>
                      <span className="truncate">
                        {appointment.client?.full_name ?? 'Cliente'}
                      </span>
                    </button>
                  </li>
                ))}
                {overflow > 0 ? (
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelectDay(cell.iso)}
                      className="text-[11px] font-medium text-slate-500 hover:text-brand-700"
                    >
                      +{overflow} mais
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
