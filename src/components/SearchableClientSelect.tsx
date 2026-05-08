import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { digitsOnly } from '@/lib/whatsapp';

interface Props {
  value: string | null;
  onChange: (clientId: string | null) => void;
  disabled?: boolean;
}

export function SearchableClientSelect({ value, onChange, disabled }: Props) {
  const { clients, isLoading, error } = useClients();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => clients.find((client) => client.id === value) ?? null,
    [clients, value],
  );

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed === '') return clients;
    const queryDigits = digitsOnly(query);
    return clients.filter((client) => {
      if (client.full_name.toLowerCase().includes(trimmed)) return true;
      if (
        queryDigits.length > 0 &&
        client.whatsapp &&
        digitsOnly(client.whatsapp).includes(queryDigits)
      ) {
        return true;
      }
      return false;
    });
  }, [clients, query]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
    return undefined;
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-50"
      >
        <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
          {selected ? selected.full_name : 'Selecione um cliente…'}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </button>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-200 p-2">
            <div className="relative">
              <Search
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome ou WhatsApp"
                className="w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {error ? (
              <p className="p-3 text-xs text-rose-700">
                Erro ao carregar clientes: {error}
              </p>
            ) : isLoading ? (
              <p className="p-3 text-xs text-slate-500">Carregando…</p>
            ) : filtered.length === 0 ? (
              <p className="p-3 text-xs text-slate-500">
                Nenhum cliente encontrado.
              </p>
            ) : (
              <ul role="listbox">
                {filtered.map((client) => {
                  const isSelected = client.id === value;
                  return (
                    <li key={client.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(client.id)}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${isSelected ? 'bg-brand-50 text-brand-700' : 'text-slate-700'}`}
                      >
                        <span>{client.full_name}</span>
                        {isSelected ? (
                          <Check
                            size={14}
                            className="text-brand-600"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
