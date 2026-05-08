import { PageHeader } from '@/components/PageHeader';
import { SupabaseStatusBadge } from '@/components/SupabaseStatusBadge';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';

export function Clientes() {
  const status = useSupabaseTable('clients');

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gestão de pacientes/clientes da clínica."
        actions={<SupabaseStatusBadge status={status} table="clients" />}
      />

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Em breve: cadastro, listagem e ficha clínica (anamnese) dos clientes.
      </section>
    </>
  );
}
