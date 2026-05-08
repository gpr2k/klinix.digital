import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Professional } from '@/lib/types';

interface State {
  professionals: Professional[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useActiveProfessionals(): State {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('professionals')
      .select('id, name, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });
    if (queryError) {
      setError(queryError.message);
      setProfessionals([]);
    } else {
      setProfessionals((data ?? []) as Professional[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { professionals, isLoading, error, reload };
}
