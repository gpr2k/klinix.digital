import { useEffect, useState } from 'react';
import { CategorySelect } from './CategorySelect';
import type {
  Category,
  ServiceInput,
  ServiceWithCategory,
} from '@/lib/types';

interface Props {
  initial: ServiceWithCategory | null;
  categories: Category[];
  onCreateCategory: (name: string) => Promise<Category>;
  onSubmit: (input: ServiceInput) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  name: string;
  category_id: string;
  duration_minutes: string;
  price: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  category_id: '',
  duration_minutes: '',
  price: '',
};

function formStateFrom(initial: ServiceWithCategory | null): FormState {
  if (!initial) return EMPTY_FORM;
  return {
    name: initial.name,
    category_id: initial.category_id,
    duration_minutes: String(initial.duration_minutes),
    price: String(initial.price),
  };
}

export function ServiceForm({
  initial,
  categories,
  onCreateCategory,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<FormState>(() => formStateFrom(initial));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(formStateFrom(initial));
    setError(null);
  }, [initial]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const name = form.name.trim();
    if (!name) {
      setError('Informe o nome do serviço.');
      return;
    }
    if (!form.category_id) {
      setError('Selecione uma categoria.');
      return;
    }
    const duration = Number(form.duration_minutes);
    if (!Number.isInteger(duration) || duration <= 0) {
      setError('Duração deve ser um inteiro positivo (em minutos).');
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError('Valor base deve ser um número maior ou igual a zero.');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        name,
        category_id: form.category_id,
        duration_minutes: duration,
        price,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar serviço.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="service-name"
          className="block text-sm font-medium text-slate-700"
        >
          Nome do serviço
        </label>
        <input
          id="service-name"
          type="text"
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          placeholder="Ex: Limpeza de pele profunda"
          required
          disabled={isSaving}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Categoria
        </label>
        <div className="mt-1">
          <CategorySelect
            categories={categories}
            value={form.category_id}
            onChange={(id) => updateField('category_id', id)}
            onCreate={onCreateCategory}
            disabled={isSaving}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="service-duration"
            className="block text-sm font-medium text-slate-700"
          >
            Duração média (minutos)
          </label>
          <input
            id="service-duration"
            type="number"
            min={1}
            step={1}
            value={form.duration_minutes}
            onChange={(event) =>
              updateField('duration_minutes', event.target.value)
            }
            placeholder="60"
            required
            disabled={isSaving}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label
            htmlFor="service-price"
            className="block text-sm font-medium text-slate-700"
          >
            Valor base (R$)
          </label>
          <input
            id="service-price"
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(event) => updateField('price', event.target.value)}
            placeholder="150.00"
            required
            disabled={isSaving}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
          />
        </div>
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
          {isSaving ? 'Salvando…' : initial ? 'Salvar alterações' : 'Criar serviço'}
        </button>
      </div>
    </form>
  );
}
