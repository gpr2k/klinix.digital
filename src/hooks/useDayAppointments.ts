import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { Appointment } from '@/lib/types';

interface State {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/** Loads all appointments for a single date + professional that could
 *  conflict with a new booking (i.e. status != 'CANCELED'). */
export function useDayAppointments(
  date: string,
  professionalId: string | null,
): State {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!date || !professionalId) {
      setAppointments([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('appointments')
      .select(
        'id, client_id, professional_id, service_id, appointment_date, start_time, end_time, status, price_charged',
      )
      .eq('professional_id', professionalId)
      .eq('appointment_date', date)
      .neq('status', 'CANCELED');
    if (queryError) {
      setError(queryError.message);
      setAppointments([]);
    } else {
      setAppointments((data ?? []) as Appointment[]);
    }
    setIsLoading(false);
  }, [date, professionalId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { appointments, isLoading, error, reload };
}
