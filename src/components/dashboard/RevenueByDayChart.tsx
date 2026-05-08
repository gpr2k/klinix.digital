import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatBRL, formatDate } from '@/lib/format';

interface Props {
  data: { date: string; revenue: number }[];
}

const compactBRL = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 1,
});

const tickInterval = (count: number): number => {
  if (count <= 7) return 0;
  if (count <= 14) return 1;
  if (count <= 31) return 2;
  return Math.ceil(count / 12);
};

export function RevenueByDayChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-400">
        Sem período selecionado.
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#475569' }}
            tickFormatter={(value: string) => value.slice(8, 10)}
            interval={tickInterval(data.length)}
            tickMargin={6}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#475569' }}
            tickFormatter={(value: number) => compactBRL.format(value)}
            width={60}
          />
          <Tooltip
            cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
            formatter={(value) => [formatBRL(Number(value) || 0), 'Receita']}
            labelFormatter={(label) =>
              typeof label === 'string' ? formatDate(label) : ''
            }
            contentStyle={{
              borderRadius: 8,
              borderColor: '#cbd5e1',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
