import type { SupabaseStatus } from '@/hooks/useSupabaseTable';

interface Props {
  status: SupabaseStatus;
  table: string;
}

export function SupabaseStatusBadge({ status, table }: Props) {
  if (status.state === 'loading') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
        Consultando <code className="font-mono">{table}</code>…
      </span>
    );
  }

  if (status.state === 'error') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        Erro em <code className="font-mono">{table}</code>: {status.message}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <code className="font-mono">{table}</code>: {status.count} registros
    </span>
  );
}
