import { useEffect, useMemo, useState } from 'react';
import { SearchableClientSelect } from './SearchableClientSelect';
import { useActiveProfessionals } from '@/hooks/useActiveProfessionals';
import { useServiceList } from '@/hooks/useServiceList';
import { addMinutesToTime } from '@/lib/date';
import { formatBRL, formatDuration } from '@/lib/format';
import type { AppointmentInput } from '@/lib/types';

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
          disabled={isSaving || isInitializing}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Agendando…' : 'Criar agendamento'}
        </button>
      </div>
    </form>
  );
}
