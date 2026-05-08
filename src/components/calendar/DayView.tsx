import { formatBRL, formatTime } from '@/lib/format';
import { timeToMinutes } from '@/lib/date';
import type { AppointmentRecord } from '@/lib/types';

interface Props {
  date: string;
  appointments: AppointmentRecord[];
  onCreateOnSlot: (date: string, time: string) => void;
}

const HOUR_START = 7;
const HOUR_END = 22;
const SLOT_MINUTES = 30;
const PIXELS_PER_MINUTE = 1.4;

const DAY_START_MINUTES = HOUR_START * 60;
const DAY_END_MINUTES = HOUR_END * 60;
const TOTAL_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES;
const TOTAL_HEIGHT = TOTAL_MINUTES * PIXELS_PER_MINUTE;

export function DayView({ date, appointments, onCreateOnSlot }: Props) {
  const slots: { hour: number; minute: number }[] = [];
  for (
    let minute = DAY_START_MINUTES;
    minute < DAY_END_MINUTES;
    minute += SLOT_MINUTES
  ) {
    slots.push({ hour: Math.floor(minute / 60), minute: minute % 60 });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[64px_1fr]">
        <div className="border-r border-slate-200 bg-slate-50">
          {slots.map((slot, index) => (
            <div
              key={`${slot.hour}-${slot.minute}`}
              className={`flex items-start justify-end pr-2 text-[11px] tabular-nums text-slate-400 ${
                index === 0 ? '' : 'border-t border-slate-200'
              }`}
              style={{ height: `${SLOT_MINUTES * PIXELS_PER_MINUTE}px` }}
            >
              {slot.minute === 0
                ? `${slot.hour.toString().padStart(2, '0')}:00`
                : null}
            </div>
          ))}
        </div>
        <div
          className="relative"
          style={{ height: `${TOTAL_HEIGHT}px` }}
        >
          {slots.map((slot, index) => {
            const time = `${slot.hour.toString().padStart(2, '0')}:${slot.minute
              .toString()
              .padStart(2, '0')}`;
            return (
              <button
                key={`${slot.hour}-${slot.minute}`}
                type="button"
                aria-label={`Novo agendamento às ${time}`}
                onClick={() => onCreateOnSlot(date, time)}
                className={`absolute left-0 right-0 ${
                  index === 0 ? '' : 'border-t border-slate-200'
                } hover:bg-brand-50/60`}
                style={{
                  top: `${(index * SLOT_MINUTES) * PIXELS_PER_MINUTE}px`,
                  height: `${SLOT_MINUTES * PIXELS_PER_MINUTE}px`,
                }}
              />
            );
          })}
          {appointments.map((appointment) => {
            const startMin = Math.max(
              timeToMinutes(appointment.start_time) - DAY_START_MINUTES,
              0,
            );
            const endMin = Math.min(
              timeToMinutes(appointment.end_time) - DAY_START_MINUTES,
              TOTAL_MINUTES,
            );
            const top = startMin * PIXELS_PER_MINUTE;
            const height = Math.max((endMin - startMin) * PIXELS_PER_MINUTE, 24);
            const isCanceled = appointment.status === 'CANCELED';
            const isCompleted = appointment.status === 'COMPLETED';
            return (
              <div
                key={appointment.id}
                style={{ top: `${top}px`, height: `${height}px` }}
                className={`pointer-events-none absolute left-2 right-2 overflow-hidden rounded-lg border px-2 py-1 text-xs ${
                  isCanceled
                    ? 'border-slate-200 bg-slate-50 text-slate-500 line-through'
                    : isCompleted
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-brand-200 bg-brand-50 text-brand-800'
                }`}
                title={`${appointment.client?.full_name ?? 'Cliente'} • ${
                  appointment.service?.name ?? 'Serviço'
                } com ${appointment.professional?.name ?? 'profissional'}`}
              >
                <p className="truncate font-medium">
                  {appointment.client?.full_name ?? 'Cliente'}
                </p>
                <p className="truncate text-[11px] opacity-80">
                  {formatTime(appointment.start_time)}–
                  {formatTime(appointment.end_time)} ·{' '}
                  {appointment.service?.name ?? 'Serviço'}
                </p>
                {height >= 60 ? (
                  <p className="truncate text-[11px] opacity-70">
                    {appointment.professional?.name ?? 'Profissional'} ·{' '}
                    {formatBRL(appointment.price_charged)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
