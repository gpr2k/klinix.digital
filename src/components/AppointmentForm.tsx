import { useEffect, useMemo, useState } from 'react';
import { SearchableClientSelect } from './SearchableClientSelect';
import { useActiveProfessionals } from '@/hooks/useActiveProfessionals';
import { useDayAppointments } from '@/hooks/useDayAppointments';
import { useProfessionalSchedules } from '@/hooks/useProfessionalSchedules';
import { useServiceList } from '@/hooks/useServiceList';
import {
  addMinutesToTime,
  isoWeekday,
  timeToMinutes,
} from '@/lib/date';
import { formatBRL, formatDuration, formatTime } from '@/lib/format';
import type { AppointmentInput } from '@/lib/types';

interface ValidationResult {
  ok: boolean;
  message: string | null;
  workingWindow: { start: string; end: string } | null;
}

interface Props {
  initialDate: string;
  initialTime: string;
  initialProfessionalId: string | null;
  onSubmit: (input: AppointmentInput) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  client_id: string | null;
  service_id: string;
  professional_id: string;
  appointment_date: string;
  start_time: string;
}

export function AppointmentForm({
  initialDate,
  initialTime,
  initialProfessionalId,
  onSubmit,
  onCancel,
}: Props) {
  const services = useServiceList();
  const professionals = useActiveProfessionals();

  const [form, setForm] = useState<FormState>({
    client_id: null,
    service_id: '',
    professional_id: initialProfessionalId ?? '',
    appointment_date: initialDate,
    start_time: initialTime,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      appointment_date: initialDate,
      start_time: initialTime,
      professional_id: initialProfessionalId ?? prev.professional_id,
    }));
  }, [initialDate, initialTime, initialProfessionalId]);

  const selectedService = useMemo(
    () => services.services.find((service) => service.id === form.service_id),
    [services.services, form.service_id],
  );

  const endTime = useMemo(() => {
    if (!selectedService) return '';
    return addMinutesToTime(form.start_time, selectedService.duration_minutes);
  }, [selectedService, form.start_time]);

  const schedulesState = useProfessionalSchedules(form.professional_id || null);
  const dayAppointmentsState = useDayAppointments(
    form.appointment_date,
    form.professional_id || null,
  );

  const daySchedule = useMemo(() => {
    if (!form.professional_id || !form.appointment_date) return null;
    const weekday = isoWeekday(form.appointment_date);
    if (weekday === null) return null;
    return (
      schedulesState.schedules.find(
        (entry) => entry.day_of_week === weekday,
      ) ?? null
    );
  }, [
    schedulesState.schedules,
    form.appointment_date,
    form.professional_id,
  ]);

  const validation: ValidationResult = useMemo(() => {
    if (!form.professional_id) {
      return { ok: false, message: null, workingWindow: null };
    }
    if (schedulesState.isLoading) {
      return { ok: false, message: null, workingWindow: null };
    }
    if (!daySchedule || !daySchedule.is_working) {
      return {
        ok: false,
        message:
          'Profissional não atende neste dia da semana. Escolha outra data.',
        workingWindow: null,
      };
    }

    const window = {
      start: daySchedule.start_time,
      end: daySchedule.end_time,
    };

    if (!form.start_time) {
      return { ok: false, message: null, workingWindow: window };
    }
    if (!selectedService) {
      return { ok: false, message: null, workingWindow: window };
    }

    const startMin = timeToMinutes(form.start_time);
    const endMin = timeToMinutes(endTime);
    const windowStart = timeToMinutes(window.start);
    const windowEnd = timeToMinutes(window.end);

    if (startMin < windowStart || endMin > windowEnd) {
      return {
        ok: false,
        message: `Horário fora do expediente do profissional (${formatTime(window.start)} – ${formatTime(window.end)}).`,
        workingWindow: window,
      };
    }

    if (dayAppointmentsState.isLoading) {
      return { ok: false, message: null, workingWindow: window };
    }

    const conflict = dayAppointmentsState.appointments.find((existing) => {
      const otherStart = timeToMinutes(existing.start_time);
      const otherEnd = timeToMinutes(existing.end_time);
      return startMin < otherEnd && otherStart < endMin;
    });

    if (conflict) {
      return {
        ok: false,
        message: `Conflito com agendamento existente das ${formatTime(conflict.start_time)} às ${formatTime(conflict.end_time)}.`,
        workingWindow: window,
      };
    }

    return { ok: true, message: null, workingWindow: window };
  }, [
    form.professional_id,
    form.start_time,
    schedulesState.isLoading,
    daySchedule,
    selectedService,
    endTime,
    dayAppointmentsState.isLoading,
    dayAppointmentsState.appointments,
  ]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.client_id) {
      setError('Selecione um cliente.');
      return;
    }
    if (!form.service_id || !selectedService) {
      setError('Selecione um serviço.');
      return;
    }
    if (!form.professional_id) {
      setError('Selecione um profissional.');
      return;
    }
    if (!form.appointment_date) {
      setError('Informe a data do agendamento.');
      return;
    }
    if (!form.start_time) {
      setError('Informe a hora de início.');
      return;
    }
    if (!validation.ok) {
      setError(
        validation.message ??
          'Verifique os horários antes de criar o agendamento.',
      );
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        client_id: form.client_id,
        service_id: form.service_id,
        professional_id: form.professional_id,
        appointment_date: form.appointment_date,
        start_time: form.start_time,
        end_time: endTime,
        status: 'SCHEDULED',
        price_charged: selectedService.price,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao criar agendamento.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isInitializing = services.isLoading || professionals.isLoading;
  const isCheckingAvailability =
    Boolean(form.professional_id) &&
    (schedulesState.isLoading || dayAppointmentsState.isLoading);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Cliente
        </label>
        <div className="mt-1">
          <SearchableClientSelect
            value={form.client_id}
            onChange={(id) => setForm((prev) => ({ ...prev, client_id: id }))}
            disabled={isSaving}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="appointment-service"
          className="block text-sm font-medium text-slate-700"
        >
          Serviço
        </label>
        <select
          id="appointment-service"
          value={form.service_id}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, service_id: event.target.value }))
          }
          disabled={isSaving || services.isLoading}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          <option value="">
            {services.isLoading
              ? 'Carregando serviços…'
              : services.services.length === 0
                ? 'Nenhum serviço cadastrado'
                : 'Selecione…'}
          </option>
          {services.services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} · {formatDuration(service.duration_minutes)} ·{' '}
              {formatBRL(service.price)}
            </option>
          ))}
        </select>
        {selectedService ? (
          <p className="mt-1 text-xs text-slate-500">
            Duração: {formatDuration(selectedService.duration_minutes)} · Valor:{' '}
            {formatBRL(selectedService.price)}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="appointment-professional"
          className="block text-sm font-medium text-slate-700"
        >
          Profissional
        </label>
        <select
          id="appointment-professional"
          value={form.professional_id}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              professional_id: event.target.value,
            }))
          }
          disabled={isSaving || professionals.isLoading}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          <option value="">
            {professionals.isLoading
              ? 'Carregando profissionais…'
              : professionals.professionals.length === 0
                ? 'Nenhum profissional ativo'
                : 'Selecione…'}
          </option>
          {professionals.professionals.map((pro) => (
            <option key={pro.id} value={pro.id}>
              {pro.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="appointment-date"
            className="block text-sm font-medium text-slate-700"
          >
            Data
          </label>
          <input
            id="appointment-date"
            type="date"
            value={form.appointment_date}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                appointment_date: event.target.value,
              }))
            }
            required
            disabled={isSaving}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label
            htmlFor="appointment-start"
            className="block text-sm font-medium text-slate-700"
          >
            Hora de início
          </label>
          <input
            id="appointment-start"
            type="time"
            value={form.start_time}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, start_time: event.target.value }))
            }
            required
            step={300}
            disabled={isSaving}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
          />
        </div>
      </div>

      {selectedService && form.start_time ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Encerra às <span className="font-medium tabular-nums">{endTime}</span>
          {' · '}
          Valor cobrado: {formatBRL(selectedService.price)}
        </p>
      ) : null}

      {form.professional_id && validation.workingWindow ? (
        <p className="text-xs text-slate-500">
          Expediente nesse dia:{' '}
          <span className="font-medium tabular-nums">
            {formatTime(validation.workingWindow.start)} –{' '}
            {formatTime(validation.workingWindow.end)}
          </span>
        </p>
      ) : null}

      {validation.message ? (
        <p
          role="alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        >
          {validation.message}
        </p>
      ) : null}

      {schedulesState.error ? (
        <p
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
        >
          Erro ao carregar grade do profissional: {schedulesState.error}
        </p>
      ) : null}

      {dayAppointmentsState.error ? (
        <p
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
        >
          Erro ao verificar conflitos: {dayAppointmentsState.error}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
        >
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={
            isSaving ||
            isInitializing ||
            isCheckingAvailability ||
            !validation.ok
          }
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? 'Agendando…'
            : isCheckingAvailability
              ? 'Verificando…'
              : 'Criar agendamento'}
        </button>
      </div>
    </form>
  );
}
