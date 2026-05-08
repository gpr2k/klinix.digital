import { PageHeader } from '@/components/PageHeader';
import { SupabaseStatusBadge } from '@/components/SupabaseStatusBadge';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';

export function Agenda() {
  const status = useSupabaseTable('appointments');

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Agendamentos por profissional, dia e horário."
        actions={
          <SupabaseStatusBadge status={status} table="appointments" />
        }
      />

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Em breve: calendário com slots por profissional e criação de agendamentos.
      </section>
    </>
  );
}
