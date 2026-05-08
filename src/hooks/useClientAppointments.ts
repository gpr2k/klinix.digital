import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type { AppointmentRecord } from '@/lib/types';

const APPOINTMENTS_SELECT =
  'id, client_id, professional_id, service_id, appointment_date, start_time, end_time, status, price_charged, professional:professionals(id, name), service:services(id, name)';

interface ClientAppointmentsState {
  appointments: AppointmentRecord[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/** Returns appointments with status='COMPLETED' for the given client, sorted
 *  most recent first. */
export function useClientAppointments(
  clientId: string | undefined,
): ClientAppointmentsState {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!clientId) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('appointments')
      .select(APPOINTMENTS_SELECT)
      .eq('client_id', clientId)
      .eq('status', 'COMPLETED')
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false });
    if (queryError) {
      setError(queryError.message);
      setAppointments([]);
    } else {
      setAppointments((data ?? []) as unknown as AppointmentRecord[]);
    }
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { appointments, isLoading, error, reload };
}
