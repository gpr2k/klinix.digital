import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import type { AuditLogWithUser } from '@/lib/types';

const TIMESTAMP = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return TIMESTAMP.format(parsed);
}

interface ActionMeta {
  op: 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER';
  resource: string;
}

const RESOURCE_LABELS: Record<string, string> = {
  APPOINTMENTS: 'Agendamento',
  SERVICES: 'Serviço',
  PROFESSIONALS: 'Profissional',
  PROFESSIONAL_SCHEDULES: 'Grade do profissional',
  CLIENTS: 'Cliente',
  CLIENT_ANAMNESIS: 'Ficha clínica',
  CATEGORIES: 'Categoria',
};

function parseAction(action: string): ActionMeta {
  const [op, ...rest] = action.split('_');
  const resourceKey = rest.join('_');
  const resource = RESOURCE_LABELS[resourceKey] ?? resourceKey ?? '—';
  if (op === 'INSERT' || op === 'UPDATE' || op === 'DELETE') {
    return { op, resource };
  }
  return { op: 'OTHER', resource };
}

const OP_BADGE: Record<ActionMeta['op'], string> = {
  INSERT: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-amber-50 text-amber-700',
  DELETE: 'bg-rose-50 text-rose-700',
  OTHER: 'bg-slate-100 text-slate-600',
};

const OP_LABEL: Record<ActionMeta['op'], string> = {
  INSERT: 'Criação',
  UPDATE: 'Edição',
  DELETE: 'Exclusão',
  OTHER: 'Outro',
};

export function Auditoria() {
  const { logs, isLoading, error, reload } = useAuditLogs();
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo(
    () =>
      logs.map((log) => ({
        log,
        meta: parseAction(log.action),
      })),
    [logs],
  );

  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Trilha de ações críticas do sistema (somente ADMIN)."
        actions={
          <button
            type="button"
            onClick={() => {
              void reload();
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={isLoading ? 'animate-spin' : ''}
            />
            Atualizar
          </button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-rose-700">
              Erro ao carregar auditoria
            </p>
            <p className="mt-1 text-xs text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => reload()}
              className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Tentar novamente
            </button>
          </div>
        ) : isLoading && logs.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Carregando logs…
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              Nenhum registro de auditoria ainda.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ações de criação, edição e exclusão aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map(({ log, meta }) => (
              <AuditRow
                key={log.id}
                log={log}
                meta={meta}
                isOpen={openId === log.id}
                onToggle={() => setOpenId(openId === log.id ? null : log.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

interface RowProps {
  log: AuditLogWithUser;
  meta: ActionMeta;
  isOpen: boolean;
  onToggle: () => void;
}

function AuditRow({ log, meta, isOpen, onToggle }: RowProps) {
  const userLabel =
    log.user?.name ?? log.user?.email ?? log.user_id ?? '— (sistema)';

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
      >
        <span className="text-slate-400">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            OP_BADGE[meta.op]
          }`}
        >
          {OP_LABEL[meta.op]}
        </span>
        <span className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">
            {meta.resource}
          </p>
          <p className="truncate text-xs text-slate-500">{userLabel}</p>
        </span>
        <span className="shrink-0 text-xs tabular-nums text-slate-500">
          {formatTimestamp(log.created_at)}
        </span>
      </button>
      {isOpen ? (
        <div className="border-t border-slate-100 bg-slate-50 px-12 py-3">
          <pre className="overflow-x-auto rounded-md border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-700">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>
      ) : null}
    </li>
  );
}
