import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Category } from '@/lib/types';

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  create: (name: string) => Promise<Category>;
}

export function useCategories(): CategoriesState {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('categories')
      .select('id, name')
      .order('name', { ascending: true });
    if (queryError) {
      setError(queryError.message);
      setCategories([]);
    } else {
      setCategories(data ?? []);
    }
    setIsLoading(false);
  }, []);

  const create = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        throw new Error('O nome da categoria é obrigatório.');
      }
      const { data, error: insertError } = await supabaseClient
        .from('categories')
        .insert({ name: trimmed })
        .select('id, name')
        .single();
      if (insertError || !data) {
        throw new Error(insertError?.message ?? 'Falha ao criar categoria.');
      }
      setCategories((prev) =>
        [...prev, data].sort((a, b) =>
          a.name.localeCompare(b.name, 'pt-BR'),
        ),
      );
      return data;
    },
    [],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, isLoading, error, reload, create };
}
