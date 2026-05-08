import { CalendarDays } from 'lucide-react';
import { formatBRL, formatDate, formatTime } from '@/lib/format';
import type { AppointmentRecord } from '@/lib/types';

interface Props {
  appointments: AppointmentRecord[];
}

export function AppointmentTimeline({ appointments }: Props) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-700">
          Nenhum atendimento registrado
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Atendimentos finalizados aparecerão aqui em ordem cronológica.
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-slate-200 pl-6">
      {appointments.map((appointment) => (
        <li key={appointment.id} className="relative">
          <span
            aria-hidden="true"
            className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 ring-4 ring-white"
          >
            <CalendarDays size={12} />
          </span>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {appointment.service?.name ?? 'Serviço removido'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  com {appointment.professional?.name ?? 'profissional removido'}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-emerald-700">
                {formatBRL(appointment.price_charged)}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="tabular-nums">
                {formatDate(appointment.appointment_date)}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {formatTime(appointment.start_time)} –{' '}
                {formatTime(appointment.end_time)}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
