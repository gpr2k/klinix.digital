import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { AppointmentInput, AppointmentRecord } from '@/lib/types';

const APPOINTMENTS_SELECT =
  'id, client_id, professional_id, service_id, appointment_date, start_time, end_time, status, price_charged, professional:professionals(id, name), service:services(id, name), client:clients(id, full_name)';

interface AppointmentsState {
  appointments: AppointmentRecord[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  create: (input: AppointmentInput) => Promise<void>;
}

interface Range {
  /** Inclusive YYYY-MM-DD lower bound. */
  start: string;
  /** Inclusive YYYY-MM-DD upper bound. */
  end: string;
}

export function useAppointments(
  range: Range,
  professionalId: string | null,
): AppointmentsState {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let query = supabaseClient
      .from('appointments')
      .select(APPOINTMENTS_SELECT)
      .gte('appointment_date', range.start)
      .lte('appointment_date', range.end)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });
    if (professionalId) {
      query = query.eq('professional_id', professionalId);
    }
    const { data, error: queryError } = await query;
    if (queryError) {
      setError(queryError.message);
      setAppointments([]);
    } else {
      setAppointments((data ?? []) as unknown as AppointmentRecord[]);
    }
    setIsLoading(false);
  }, [range.start, range.end, professionalId]);

  const create = useCallback(
    async (input: AppointmentInput) => {
      const { error: insertError } = await supabaseClient
        .from('appointments')
        .insert(input);
      if (insertError) {
        throw new Error(insertError.message);
      }
      await reload();
    },
    [reload],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { appointments, isLoading, error, reload, create };
}
