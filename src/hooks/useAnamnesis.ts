import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Anamnesis, AnamnesisInput } from '@/lib/types';

const ANAMNESIS_SELECT =
  'client_id, skin_type, allergies, medications, restrictions, is_pregnant_or_nursing';

interface AnamnesisState {
  anamnesis: Anamnesis | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  save: (input: AnamnesisInput) => Promise<void>;
}

export function useAnamnesis(clientId: string | undefined): AnamnesisState {
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!clientId) {
      setAnamnesis(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('client_anamnesis')
      .select(ANAMNESIS_SELECT)
      .eq('client_id', clientId)
      .maybeSingle();
    if (queryError) {
      setError(queryError.message);
      setAnamnesis(null);
    } else {
      setAnamnesis((data as Anamnesis | null) ?? null);
    }
    setIsLoading(false);
  }, [clientId]);

  const save = useCallback(
    async (input: AnamnesisInput) => {
      if (!clientId) {
        throw new Error('Cliente inválido.');
      }
      const { error: upsertError } = await supabaseClient
        .from('client_anamnesis')
        .upsert(
          { client_id: clientId, ...input },
          { onConflict: 'client_id' },
        );
      if (upsertError) {
        throw new Error(upsertError.message);
      }
      await reload();
    },
    [clientId, reload],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { anamnesis, isLoading, error, reload, save };
}
