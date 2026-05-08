import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { ServiceLite } from '@/lib/types';

interface State {
  services: ServiceLite[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useServiceList(): State {
  const [services, setServices] = useState<ServiceLite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('services')
      .select('id, name, duration_minutes, price')
      .order('name', { ascending: true });
    if (queryError) {
      setError(queryError.message);
      setServices([]);
    } else {
      setServices((data ?? []) as ServiceLite[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { services, isLoading, error, reload };
}
