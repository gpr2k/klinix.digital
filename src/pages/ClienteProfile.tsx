import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AnamnesisForm } from '@/components/AnamnesisForm';
import { AppointmentTimeline } from '@/components/AppointmentTimeline';
import { PageHeader } from '@/components/PageHeader';
import { Tabs } from '@/components/Tabs';
import { useAnamnesis } from '@/hooks/useAnamnesis';
import { useClient } from '@/hooks/useClient';
import { useClientAppointments } from '@/hooks/useClientAppointments';
import { formatBirthDate } from '@/lib/format';
import { formatWhatsapp } from '@/lib/whatsapp';

const TABS = [
  { id: 'anamnesis', label: 'Ficha clínica' },
  { id: 'history', label: 'Histórico de atendimentos' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function ClienteProfile() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('anamnesis');

  const client = useClient(id);
  const anamnesis = useAnamnesis(id);
  const appointments = useClientAppointments(id);

  const backLink = (
    <Link
      to="/clientes"
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft size={14} />
      Voltar
    </Link>
  );

  if (client.isLoading) {
    return (
      <>
        <PageHeader
          title="Perfil do cliente"
          description="Carregando…"
          actions={backLink}
        />
        <section className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Carregando dados do cliente…
        </section>
      </>
    );
  }

  if (client.error || !client.client) {
    return (
      <>
        <PageHeader
          title="Perfil do cliente"
          description="Não foi possível carregar o cliente."
          actions={backLink}
        />
        <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {client.error ?? 'Cliente não encontrado.'}
        </section>
      </>
    );
  }

  const data = client.client;

  return (
    <>
      <PageHeader
        title={data.full_name}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            {data.whatsapp ? (
              <span className="tabular-nums">
                {formatWhatsapp(data.whatsapp)}
              </span>
            ) : null}
            {data.birth_date ? (
              <span className="tabular-nums">
                Nasc. {formatBirthDate(data.birth_date)}
              </span>
            ) : null}
            {data.acquisition_channel ? (
              <span>Veio por {data.acquisition_channel}</span>
            ) : null}
          </span>
        }
        actions={backLink}
      />

      <div className="mb-6">
        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={setActiveTab}
          ariaLabel="Seções do perfil do cliente"
        />
      </div>

      {activeTab === 'anamnesis' ? (
        <section
          role="tabpanel"
          id="panel-anamnesis"
          aria-labelledby="tab-anamnesis"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          {anamnesis.isLoading ? (
            <p className="text-sm text-slate-500">Carregando ficha…</p>
          ) : anamnesis.error ? (
            <div>
              <p className="text-sm font-medium text-rose-700">
                Erro ao carregar ficha
              </p>
              <p className="mt-1 text-xs text-slate-500">{anamnesis.error}</p>
              <button
                type="button"
                onClick={() => anamnesis.reload()}
                className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <AnamnesisForm
              initial={anamnesis.anamnesis}
              onSubmit={anamnesis.save}
            />
          )}
        </section>
      ) : (
        <section
          role="tabpanel"
          id="panel-history"
          aria-labelledby="tab-history"
        >
          {appointments.isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Carregando histórico…
            </div>
          ) : appointments.error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              <p className="font-medium">Erro ao carregar histórico</p>
              <p className="mt-1 text-xs">{appointments.error}</p>
              <button
                type="button"
                onClick={() => appointments.reload()}
                className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <AppointmentTimeline appointments={appointments.appointments} />
          )}
        </section>
      )}
    </>
  );
}
