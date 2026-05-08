import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { AuditLogWithUser } from '@/lib/types';

interface State {
  logs: AuditLogWithUser[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

interface Row {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  user: { id: string; name: string | null; email: string | null } | null;
}

const PAGE_SIZE = 100;

export function useAuditLogs(): State {
  const [logs, setLogs] = useState<AuditLogWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('audit_logs')
      .select(
        'id, user_id, action, details, created_at, user:users(id, name, email)',
      )
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);
    if (queryError) {
      setError(queryError.message);
      setLogs([]);
    } else {
      const rows = (data ?? []) as unknown as Row[];
      setLogs(
        rows.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          action: row.action,
          details: row.details,
          created_at: row.created_at,
          user: row.user,
        })),
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { logs, isLoading, error, reload };
}
