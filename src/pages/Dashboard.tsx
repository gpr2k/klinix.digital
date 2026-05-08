import { PageHeader } from '@/components/PageHeader';
import { SupabaseStatusBadge } from '@/components/SupabaseStatusBadge';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';

export function Dashboard() {
  const clients = useSupabaseTable('clients');
  const appointments = useSupabaseTable('appointments');
  const professionals = useSupabaseTable('professionals');
  const services = useSupabaseTable('services');

  const cards = [
    { table: 'clients', label: 'Clientes cadastrados', status: clients },
    {
      table: 'appointments',
      label: 'Agendamentos no histórico',
      status: appointments,
    },
    {
      table: 'professionals',
      label: 'Profissionais',
      status: professionals,
    },
    { table: 'services', label: 'Serviços ofertados', status: services },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral da clínica. Os números abaixo vêm do Supabase em tempo real."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ table, label, status }) => (
          <article
            key={table}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">
              {status.state === 'ok' ? status.count : '—'}
            </p>
            <div className="mt-3">
              <SupabaseStatusBadge status={status} table={table} />
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
