import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import type {
  ProfessionalInput,
  ProfessionalWithSchedules,
  ScheduleInput,
} from '@/lib/types';

const PROFESSIONALS_SELECT =
  'id, name, is_active, schedules:professional_schedules(id, professional_id, day_of_week, start_time, end_time, is_working)';

interface ProfessionalsState {
  professionals: ProfessionalWithSchedules[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  create: (input: ProfessionalInput) => Promise<void>;
  update: (id: string, input: ProfessionalInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

async function upsertSchedules(
  professionalId: string,
  schedules: ScheduleInput[],
): Promise<void> {
  if (schedules.length === 0) return;
  const rows = schedules.map((schedule) => ({
    professional_id: professionalId,
    day_of_week: schedule.day_of_week,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    is_working: schedule.is_working,
  }));
  const { error } = await supabaseClient
    .from('professional_schedules')
    .upsert(rows, { onConflict: 'professional_id,day_of_week' });
  if (error) {
    throw new Error(error.message);
  }
}

export function useProfessionals(): ProfessionalsState {
  const [professionals, setProfessionals] = useState<
    ProfessionalWithSchedules[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('professionals')
      .select(PROFESSIONALS_SELECT)
      .order('name', { ascending: true });
    if (queryError) {
      setError(queryError.message);
      setProfessionals([]);
    } else {
      setProfessionals(
        (data ?? []) as unknown as ProfessionalWithSchedules[],
      );
    }
    setIsLoading(false);
  }, []);

  const create = useCallback(
    async (input: ProfessionalInput) => {
      const { data, error: insertError } = await supabaseClient
        .from('professionals')
        .insert({ name: input.name, is_active: input.is_active })
        .select('id')
        .single();
      if (insertError || !data) {
        throw new Error(insertError?.message ?? 'Falha ao criar profissional.');
      }
      try {
        await upsertSchedules(data.id, input.schedules);
      } catch (err) {
        // Compensate the orphan professional row to avoid an inconsistent state.
        await supabaseClient.from('professionals').delete().eq('id', data.id);
        throw err;
      }
      await reload();
    },
    [reload],
  );

  const update = useCallback(
    async (id: string, input: ProfessionalInput) => {
      const { error: updateError } = await supabaseClient
        .from('professionals')
        .update({ name: input.name, is_active: input.is_active })
        .eq('id', id);
      if (updateError) {
        throw new Error(updateError.message);
      }
      await upsertSchedules(id, input.schedules);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabaseClient
        .from('professionals')
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

  return {
    professionals,
    isLoading,
    error,
    reload,
    create,
    update,
    remove,
  };
}
