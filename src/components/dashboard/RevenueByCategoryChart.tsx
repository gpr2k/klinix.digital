import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatBRL } from '@/lib/format';

interface Props {
  data: { category: string; revenue: number }[];
}

const compactBRL = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 1,
});

export function RevenueByCategoryChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-400">
        Sem atendimentos finalizados no período.
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: '#475569' }}
            interval={0}
            tickMargin={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#475569' }}
            tickFormatter={(value: number) => compactBRL.format(value)}
            width={60}
          />
          <Tooltip
            cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
            formatter={(value) => [formatBRL(Number(value) || 0), 'Receita']}
            contentStyle={{
              borderRadius: 8,
              borderColor: '#cbd5e1',
              fontSize: 12,
            }}
          />
          <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
