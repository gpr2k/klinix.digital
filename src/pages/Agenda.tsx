import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AppointmentForm } from '@/components/AppointmentForm';
import { Modal } from '@/components/Modal';
import { PageHeader } from '@/components/PageHeader';
import { Tabs } from '@/components/Tabs';
import { DayView } from '@/components/calendar/DayView';
import { MonthView } from '@/components/calendar/MonthView';
import { useActiveProfessionals } from '@/hooks/useActiveProfessionals';
import { useAppointments } from '@/hooks/useAppointments';
import {
  buildMonthGrid,
  formatLongDate,
  formatMonthYear,
  shiftDay,
  shiftMonth,
  todayISO,
} from '@/lib/date';
import type { AppointmentInput } from '@/lib/types';

const VIEW_TABS = [
  { id: 'month', label: 'Mensal' },
  { id: 'day', label: 'Diário' },
] as const;

type ViewId = (typeof VIEW_TABS)[number]['id'];

const DEFAULT_TIME = '09:00';

export function Agenda() {
  const today = useMemo(() => todayISO(), []);
  const [view, setView] = useState<ViewId>('month');
  const [anchorDate, setAnchorDate] = useState<string>(today);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<{
    date: string;
    time: string;
  }>(() => ({ date: today, time: DEFAULT_TIME }));

  const range = useMemo(() => {
    if (view === 'day') {
      return { start: anchorDate, end: anchorDate };
    }
    const grid = buildMonthGrid(anchorDate);
    if (grid.length === 0) {
      return { start: anchorDate, end: anchorDate };
    }
    return {
      start: grid[0]!.iso,
      end: grid[grid.length - 1]!.iso,
    };
  }, [view, anchorDate]);

  const appointments = useAppointments(range, professionalId);
  const professionals = useActiveProfessionals();

  const openCreate = (date: string, time: string) => {
    setFormInitial({ date, time });
    setIsFormOpen(true);
  };

  const handleSubmit = async (input: AppointmentInput) => {
    await appointments.create(input);
    setIsFormOpen(false);
  };

  const handlePrev = () => {
    setAnchorDate((prev) =>
      view === 'day' ? shiftDay(prev, -1) : shiftMonth(prev, -1),
    );
  };

  const handleNext = () => {
    setAnchorDate((prev) =>
      view === 'day' ? shiftDay(prev, 1) : shiftMonth(prev, 1),
    );
  };

  const handleToday = () => setAnchorDate(today);

  const handleSelectDay = (iso: string) => {
    setAnchorDate(iso);
    setView('day');
  };

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Agendamentos por profissional, dia e horário."
        actions={
          <button
            type="button"
            onClick={() => openCreate(anchorDate, DEFAULT_TIME)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
          >
            <Plus size={16} />
            Novo agendamento
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label={view === 'day' ? 'Dia anterior' : 'Mês anterior'}
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label={view === 'day' ? 'Próximo dia' : 'Próximo mês'}
            className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <CalendarDays size={14} />
            Hoje
          </button>
          <p className="ml-2 text-sm font-medium text-slate-700">
            {view === 'day'
              ? formatLongDate(anchorDate)
              : formatMonthYear(anchorDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            Profissional
            <select
              value={professionalId ?? ''}
              onChange={(event) =>
                setProfessionalId(
                  event.target.value === '' ? null : event.target.value,
                )
              }
              disabled={professionals.isLoading}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="">Todos</option>
              {professionals.professionals.map((pro) => (
                <option key={pro.id} value={pro.id}>
                  {pro.name}
                </option>
              ))}
            </select>
          </label>
          <Tabs
            tabs={VIEW_TABS}
            active={view}
            onChange={setView}
            ariaLabel="Modo de visualização do calendário"
          />
        </div>
      </div>

      {appointments.error ? (
        <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          <p className="font-medium">Erro ao carregar agendamentos</p>
          <p className="mt-1 text-xs">{appointments.error}</p>
          <button
            type="button"
            onClick={() => appointments.reload()}
            className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
          >
            Tentar novamente
          </button>
        </section>
      ) : view === 'month' ? (
        <MonthView
          monthAnchor={anchorDate}
          appointments={appointments.appointments}
          onSelectDay={handleSelectDay}
          onCreateOnDay={(iso) => openCreate(iso, DEFAULT_TIME)}
        />
      ) : (
        <DayView
          date={anchorDate}
          appointments={appointments.appointments}
          onCreateOnSlot={openCreate}
        />
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Novo agendamento"
        description="Selecione o cliente, serviço, profissional e horário."
      >
        <AppointmentForm
          initialDate={formInitial.date}
          initialTime={formInitial.time}
          initialProfessionalId={professionalId}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </>
  );
}
