import { useEffect, useState } from 'react';
import type { Anamnesis, AnamnesisInput } from '@/lib/types';

const SKIN_TYPES = [
  'Normal',
  'Seca',
  'Oleosa',
  'Mista',
  'Sensível',
] as const;

interface Props {
  initial: Anamnesis | null;
  onSubmit: (input: AnamnesisInput) => Promise<void>;
}

interface FormState {
  skin_type: string;
  allergies: string;
  restrictions: string;
  medications: string;
  is_pregnant_or_nursing: boolean;
}

function formStateFrom(initial: Anamnesis | null): FormState {
  if (!initial) {
    return {
      skin_type: '',
      allergies: '',
      restrictions: '',
      medications: '',
      is_pregnant_or_nursing: false,
    };
  }
  return {
    skin_type: initial.skin_type ?? '',
    allergies: initial.allergies ?? '',
    restrictions: initial.restrictions ?? '',
    medications: initial.medications ?? '',
    is_pregnant_or_nursing: initial.is_pregnant_or_nursing,
  };
}

function nullIfEmpty(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function AnamnesisForm({ initial, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(() => formStateFrom(initial));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setForm(formStateFrom(initial));
    setError(null);
  }, [initial]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await onSubmit({
        skin_type: nullIfEmpty(form.skin_type),
        allergies: nullIfEmpty(form.allergies),
        restrictions: nullIfEmpty(form.restrictions),
        medications: nullIfEmpty(form.medications),
        is_pregnant_or_nursing: form.is_pregnant_or_nursing,
      });
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar ficha.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="anamnesis-skin"
          className="block text-sm font-medium text-slate-700"
        >
          Tipo de pele
        </label>
        <select
          id="anamnesis-skin"
          value={form.skin_type}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, skin_type: event.target.value }))
          }
          disabled={isSaving}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          <option value="">Não informado</option>
          {SKIN_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="anamnesis-allergies"
          className="block text-sm font-medium text-slate-700"
        >
          Alergias
        </label>
        <textarea
          id="anamnesis-allergies"
          value={form.allergies}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, allergies: event.target.value }))
          }
          rows={3}
          placeholder="Descreva alergias conhecidas (ex: ácido salicílico, látex)"
          disabled={isSaving}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
        />
      </div>

      <div>
        <label
          htmlFor="anamnesis-restrictions"
          className="block text-sm font-medium text-slate-700"
        >
          Doenças crônicas / restrições
        </label>
        <textarea
          id="anamnesis-restrictions"
          value={form.restrictions}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, restrictions: event.target.value }))
          }
          rows={3}
          placeholder="Diabetes, hipertensão, doenças autoimunes ou outras restrições clínicas"
          disabled={isSaving}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
        />
      </div>

      <div>
        <label
          htmlFor="anamnesis-medications"
          className="block text-sm font-medium text-slate-700"
        >
          Medicamentos em uso
        </label>
        <textarea
          id="anamnesis-medications"
          value={form.medications}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, medications: event.target.value }))
          }
          rows={3}
          placeholder="Liste medicamentos contínuos e dosagens, se conhecidos"
          disabled={isSaving}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={form.is_pregnant_or_nursing}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                is_pregnant_or_nursing: event.target.checked,
              }))
            }
            disabled={isSaving}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Gestante ou lactante
        </label>
        <p className="mt-1 pl-6 text-xs text-slate-500">
          Procedimentos com restrição para gestantes/lactantes devem ser
          revisados antes de cada agendamento.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
        >
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        {savedAt && !error && !isSaving ? (
          <span className="text-xs text-emerald-700" aria-live="polite">
            Ficha salva.
          </span>
        ) : null}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Salvando…' : 'Salvar ficha'}
        </button>
      </div>
    </form>
  );
}
