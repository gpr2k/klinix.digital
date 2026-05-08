import { useMemo, useState } from 'react';
import { DateRangePicker } from '@/components/DateRangePicker';
import { PageHeader } from '@/components/PageHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RevenueByCategoryChart } from '@/components/dashboard/RevenueByCategoryChart';
import { RevenueByDayChart } from '@/components/dashboard/RevenueByDayChart';
import { useDashboard } from '@/hooks/useDashboard';
import { currentMonthBounds } from '@/lib/date';
import { formatBRL, formatDate } from '@/lib/format';

export function Dashboard() {
  const initialRange = useMemo(() => currentMonthBounds(), []);
  const [range, setRange] = useState(initialRange);
  const { metrics, isLoading, error, reload } = useDashboard(range);

  const isInvalidRange = range.end < range.start;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          <>
            Métricas de atendimentos finalizados de{' '}
            <span className="font-medium text-slate-700">
              {formatDate(range.start)}
            </span>{' '}
            a{' '}
            <span className="font-medium text-slate-700">
              {formatDate(range.end)}
            </span>
            .
          </>
        }
        actions={
          <DateRangePicker
            start={range.start}
            end={range.end}
            onChange={setRange}
          />
        }
      />

      {isInvalidRange ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          A data inicial precisa ser menor ou igual à data final.
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Faturamento"
          value={formatBRL(metrics.revenue)}
          hint="Soma de price_charged em atendimentos COMPLETED."
          isLoading={isLoading}
        />
        <MetricCard
          label="Total de agendamentos"
          value={metrics.count}
          hint="Atendimentos finalizados no período."
          isLoading={isLoading}
        />
        <MetricCard
          label="Ticket médio"
          value={formatBRL(metrics.averageTicket)}
          hint="Faturamento ÷ total de atendimentos."
          isLoading={isLoading}
        />
      </section>

      {error ? (
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          <p className="font-medium">Erro ao carregar métricas</p>
          <p className="mt-1 text-xs">{error}</p>
          <button
            type="button"
            onClick={() => reload()}
            className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
          >
            Tentar novamente
          </button>
        </section>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">
                Receita por categoria
              </h2>
              <span className="text-xs text-slate-400">
                {metrics.byCategory.length}{' '}
                {metrics.byCategory.length === 1 ? 'categoria' : 'categorias'}
              </span>
            </header>
            {isLoading ? (
              <div className="flex h-72 items-center justify-center text-sm text-slate-400">
                Carregando…
              </div>
            ) : (
              <RevenueByCategoryChart data={metrics.byCategory} />
            )}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">
                Faturamento por dia
              </h2>
              <span className="text-xs text-slate-400">
                {metrics.byDay.length} dias
              </span>
            </header>
            {isLoading ? (
              <div className="flex h-72 items-center justify-center text-sm text-slate-400">
                Carregando…
              </div>
            ) : (
              <RevenueByDayChart data={metrics.byDay} />
            )}
          </section>
        </div>
      )}
    </>
  );
}
