import { useEffect, useState } from 'react';
import { ScheduleGrid } from './ScheduleGrid';
import { timeToMinutes, toTimeInputValue } from '@/lib/format';
import { defaultSchedules } from '@/lib/schedule';
import type {
  ProfessionalInput,
  ProfessionalWithSchedules,
  ScheduleInput,
} from '@/lib/types';

interface Props {
  initial: ProfessionalWithSchedules | null;
  onSubmit: (input: ProfessionalInput) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  name: string;
  is_active: boolean;
  schedules: ScheduleInput[];
}

function formStateFrom(initial: ProfessionalWithSchedules | null): FormState {
  if (!initial) {
    return {
      name: '',
      is_active: true,
      schedules: defaultSchedules(),
    };
  }
  const fromInitial: ScheduleInput[] = initial.schedules.map((schedule) => ({
    day_of_week: schedule.day_of_week,
    start_time: toTimeInputValue(schedule.start_time),
    end_time: toTimeInputValue(schedule.end_time),
    is_working: schedule.is_working,
  }));
  // Filter to Mon..Sat so the grid component can fill any missing day with
  // defaults rather than smuggling in an unexpected Sunday row.
  const monToSat = fromInitial.filter(
    (schedule) => schedule.day_of_week >= 1 && schedule.day_of_week <= 6,
  );
  return {
    name: initial.name,
    is_active: initial.is_active,
    schedules: monToSat,
  };
}

export function ProfessionalForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(() => formStateFrom(initial));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(formStateFrom(initial));
    setError(null);
  }, [initial]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();
    if (!name) {
      setError('Informe o nome do profissional.');
      return;
    }

    for (const schedule of form.schedules) {
      if (!schedule.is_working) continue;
      if (
        timeToMinutes(schedule.end_time) <=
        timeToMinutes(schedule.start_time)
      ) {
        setError(
          'O horário final deve ser maior que o inicial em todos os dias ativos.',
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSubmit({
        name,
        is_active: form.is_active,
        schedules: form.schedules,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao salvar profissional.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="professional-name"
          className="block text-sm font-medium text-slate-700"
        >
          Nome
        </label>
        <input
          id="professional-name"
          type="text"
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          placeholder="Ex: Dra. Camila Souza"
          required
          disabled={isSaving}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, is_active: event.target.checked }))
            }
            disabled={isSaving}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Profissional ativo
        </label>
        <p className="mt-1 pl-6 text-xs text-slate-500">
          Profissionais inativos permanecem no histórico mas não aparecem em
          novos agendamentos.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-700">
          Horário de trabalho
        </h3>
        <p className="mb-2 text-xs text-slate-500">
          Defina os dias e horários de expediente. Estes horários ditarão a
          disponibilidade na agenda.
        </p>
        <ScheduleGrid
          schedules={form.schedules}
          onChange={(schedules) => setForm((prev) => ({ ...prev, schedules }))}
          disabled={isSaving}
        />
      </div>

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
          disabled={isSaving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving
            ? 'Salvando…'
            : initial
              ? 'Salvar alterações'
              : 'Criar profissional'}
        </button>
      </div>
    </form>
  );
}
