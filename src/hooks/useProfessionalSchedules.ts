import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { ProfessionalSchedule } from '@/lib/types';

interface State {
  schedules: ProfessionalSchedule[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useProfessionalSchedules(
  professionalId: string | null,
): State {
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!professionalId) {
      setSchedules([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('professional_schedules')
      .select('id, professional_id, day_of_week, start_time, end_time, is_working')
      .eq('professional_id', professionalId);
    if (queryError) {
      setError(queryError.message);
      setSchedules([]);
    } else {
      setSchedules((data ?? []) as ProfessionalSchedule[]);
    }
    setIsLoading(false);
  }, [professionalId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { schedules, isLoading, error, reload };
}
