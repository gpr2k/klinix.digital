import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Client } from '@/lib/types';

interface ClientState {
  client: Client | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useClient(id: string | undefined): ClientState {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id) {
      setClient(null);
      setIsLoading(false);
      setError('Cliente não encontrado.');
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('clients')
      .select(
        'id, full_name, whatsapp, birth_date, acquisition_channel, created_at',
      )
      .eq('id', id)
      .maybeSingle();
    if (queryError) {
      setError(queryError.message);
      setClient(null);
    } else if (!data) {
      setError('Cliente não encontrado.');
      setClient(null);
    } else {
      setClient(data as Client);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { client, isLoading, error, reload };
}
