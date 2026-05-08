import { PageHeader } from '@/components/PageHeader';
import { SupabaseStatusBadge } from '@/components/SupabaseStatusBadge';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';

export function Servicos() {
  const status = useSupabaseTable('services');

  return (
    <>
      <PageHeader
        title="Serviços"
        description="Catálogo de serviços por categoria, com duração e preço."
        actions={<SupabaseStatusBadge status={status} table="services" />}
      />

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Em breve: cadastro de categorias e serviços (duração, preço).
      </section>
    </>
  );
}
