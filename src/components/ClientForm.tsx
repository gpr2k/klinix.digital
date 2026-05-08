import { useEffect, useState } from 'react';
import { ChannelSelect } from './ChannelSelect';
import { digitsOnly, formatWhatsapp } from '@/lib/whatsapp';
import type { Client, ClientInput } from '@/lib/types';

interface Props {
  initial: Client | null;
  onSubmit: (input: ClientInput) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  full_name: string;
  whatsapp: string;
  birth_date: string;
  acquisition_channel: string | null;
}

function formStateFrom(initial: Client | null): FormState {
  if (!initial) {
    return {
      full_name: '',
      whatsapp: '',
      birth_date: '',
      acquisition_channel: null,
    };
  }
  return {
    full_name: initial.full_name,
    whatsapp: initial.whatsapp ? formatWhatsapp(initial.whatsapp) : '',
    birth_date: initial.birth_date ?? '',
    acquisition_channel: initial.acquisition_channel,
  };
}

function nullIfEmpty(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function ClientForm({ initial, onSubmit, onCancel }: Props) {
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

    const fullName = form.full_name.trim();
    if (!fullName) {
      setError('Informe o nome completo do cliente.');
      return;
    }

    const whatsappDigits = digitsOnly(form.whatsapp);
    if (whatsappDigits.length > 0 && whatsappDigits.length < 10) {
      setError('WhatsApp deve ter ao menos 10 dígitos (DDD + número).');
      return;
    }

    const channel = form.acquisition_channel;
    const channelValue = channel === null ? null : nullIfEmpty(channel);

    setIsSaving(true);
    try {
      await onSubmit({
        full_name: fullName,
        whatsapp: whatsappDigits === '' ? null : whatsappDigits,
        birth_date: form.birth_date === '' ? null : form.birth_date,
        acquisition_channel: channelValue,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="client-full-name"
          className="block text-sm font-medium text-slate-700"
        >
          Nome completo
        </label>
        <input
          id="client-full-name"
          type="text"
          value={form.full_name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, full_name: event.target.value }))
          }
          placeholder="Ex: Mariana Silva"
          required
          disabled={isSaving}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="client-whatsapp"
            className="block text-sm font-medium text-slate-700"
          >
            WhatsApp
          </label>
          <input
            id="client-whatsapp"
            type="tel"
            inputMode="tel"
            value={form.whatsapp}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                whatsapp: formatWhatsapp(event.target.value),
              }))
            }
            placeholder="(11) 99999-9999"
            disabled={isSaving}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label
            htmlFor="client-birth-date"
            className="block text-sm font-medium text-slate-700"
          >
            Data de nascimento
          </label>
          <input
            id="client-birth-date"
            type="date"
            value={form.birth_date}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, birth_date: event.target.value }))
            }
            disabled={isSaving}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Como conheceu a clínica
        </label>
        <div className="mt-1">
          <ChannelSelect
            value={form.acquisition_channel}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, acquisition_channel: value }))
            }
            disabled={isSaving}
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
          {isSaving
            ? 'Salvando…'
            : initial
              ? 'Salvar alterações'
              : 'Criar cliente'}
        </button>
      </div>
    </form>
  );
}
