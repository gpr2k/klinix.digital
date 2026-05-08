import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Client, ClientInput } from '@/lib/types';

const CLIENTS_SELECT =
  'id, full_name, whatsapp, birth_date, acquisition_channel, created_at';

interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  create: (input: ClientInput) => Promise<void>;
  update: (id: string, input: ClientInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useClients(): ClientsState {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('clients')
      .select(CLIENTS_SELECT)
      .order('full_name', { ascending: true });
    if (queryError) {
      setError(queryError.message);
      setClients([]);
    } else {
      setClients((data ?? []) as Client[]);
    }
    setIsLoading(false);
  }, []);

  const create = useCallback(
    async (input: ClientInput) => {
      const { error: insertError } = await supabaseClient
        .from('clients')
        .insert(input);
      if (insertError) {
        throw new Error(insertError.message);
      }
      await reload();
    },
    [reload],
  );

  const update = useCallback(
    async (id: string, input: ClientInput) => {
      const { error: updateError } = await supabaseClient
        .from('clients')
        .update(input)
        .eq('id', id);
      if (updateError) {
        throw new Error(updateError.message);
      }
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabaseClient
        .from('clients')
        .delete()
        .eq('id', id);
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      await reload();
    },
    [reload],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { clients, isLoading, error, reload, create, update, remove };
}
