import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

type SupabaseTable =
  | 'users'
  | 'categories'
  | 'services'
  | 'professionals'
  | 'professional_schedules'
  | 'clients'
  | 'client_anamnesis'
  | 'appointments'
  | 'audit_logs';

export type SupabaseStatus =
  | { state: 'loading' }
  | { state: 'ok'; count: number }
  | { state: 'error'; message: string };

/**
 * Pings a Supabase table with a HEAD count query. Used by the placeholder
 * pages to confirm that the configured client can talk to the database.
 */
export function useSupabaseTable(table: SupabaseTable): SupabaseStatus {
  const [status, setStatus] = useState<SupabaseStatus>({ state: 'loading' });

  useEffect(() => {
    let cancelled = false;

    supabaseClient
      .from(table)
      .select('*', { count: 'exact', head: true })
      .then(({ count, error }) => {
        if (cancelled) return;
        if (error) {
          setStatus({ state: 'error', message: error.message });
        } else {
          setStatus({ state: 'ok', count: count ?? 0 });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [table]);

  return status;
}
