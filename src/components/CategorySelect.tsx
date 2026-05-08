import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Category } from '@/lib/types';

const NEW_OPTION = '__new__';

interface Props {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  /** Called when the user submits a new category name. Must persist and
   *  return the created category. The select will then point to its id. */
  onCreate: (name: string) => Promise<Category>;
  disabled?: boolean;
  required?: boolean;
}

export function CategorySelect({
  categories,
  value,
  onChange,
  onCreate,
  disabled,
  required,
}: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    if (next === NEW_OPTION) {
      setIsCreating(true);
      setNewName('');
      setError(null);
    } else {
      onChange(next);
    }
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Informe um nome.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const created = await onCreate(trimmed);
      onChange(created.id);
      setIsCreating(false);
      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar categoria.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setNewName('');
    setError(null);
  };

  if (isCreating) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Nome da nova categoria"
            disabled={isSaving}
            autoFocus
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSaving}
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Salvando…' : 'Criar'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
        {error ? <p className="text-xs text-rose-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={handleSelectChange}
      disabled={disabled}
      required={required}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-50"
    >
      <option value="" disabled>
        Selecione uma categoria
      </option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
      <option value={NEW_OPTION}>+ Criar nova categoria…</option>
    </select>
  );
}

export { Plus };
