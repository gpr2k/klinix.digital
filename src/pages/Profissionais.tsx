import { PageHeader } from '@/components/PageHeader';
import { SupabaseStatusBadge } from '@/components/SupabaseStatusBadge';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';

export function Profissionais() {
  const status = useSupabaseTable('professionals');

  return (
    <>
      <PageHeader
        title="Profissionais"
        description="Equipe e suas grades de horários."
        actions={
          <SupabaseStatusBadge status={status} table="professionals" />
        }
      />

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Em breve: cadastro da equipe e configuração de jornadas semanais.
      </section>
    </>
  );
}
