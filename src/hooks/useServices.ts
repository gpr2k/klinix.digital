import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { ServiceInput, ServiceWithCategory } from '@/lib/types';

const SERVICES_SELECT =
  'id, category_id, name, duration_minutes, price, category:categories(id, name)';

interface ServicesState {
  services: ServiceWithCategory[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  create: (input: ServiceInput) => Promise<void>;
  update: (id: string, input: ServiceInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useServices(): ServicesState {
  const [services, setServices] = useState<ServiceWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('services')
      .select(SERVICES_SELECT)
      .order('name', { ascending: true });
    if (queryError) {
      setError(queryError.message);
      setServices([]);
    } else {
      setServices((data ?? []) as unknown as ServiceWithCategory[]);
    }
    setIsLoading(false);
  }, []);

  const create = useCallback(
    async (input: ServiceInput) => {
      const { error: insertError } = await supabaseClient
        .from('services')
        .insert(input);
      if (insertError) {
        throw new Error(insertError.message);
      }
      await reload();
    },
    [reload],
  );

  const update = useCallback(
    async (id: string, input: ServiceInput) => {
      const { error: updateError } = await supabaseClient
        .from('services')
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
        .from('services')
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

  return { services, isLoading, error, reload, create, update, remove };
}
