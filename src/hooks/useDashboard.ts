import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { shiftDay } from '@/lib/date';

const SELECT =
  'price_charged, appointment_date, service:services(id, name, category:categories(id, name))';

interface Row {
  price_charged: number;
  appointment_date: string;
  service: {
    id: string;
    name: string;
    category: { id: string; name: string } | null;
  } | null;
}

interface CategorySlice {
  category: string;
  revenue: number;
}

interface DaySlice {
  date: string;
  revenue: number;
}

export interface DashboardMetrics {
  revenue: number;
  count: number;
  averageTicket: number;
  byCategory: CategorySlice[];
  byDay: DaySlice[];
}

interface State {
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const EMPTY: DashboardMetrics = {
  revenue: 0,
  count: 0,
  averageTicket: 0,
  byCategory: [],
  byDay: [],
};

export function useDashboard(range: {
  start: string;
  end: string;
}): State {
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseClient
      .from('appointments')
      .select(SELECT)
      .eq('status', 'COMPLETED')
      .gte('appointment_date', range.start)
      .lte('appointment_date', range.end);
    if (queryError) {
      setError(queryError.message);
      setRows([]);
    } else {
      setRows((data ?? []) as unknown as Row[]);
    }
    setIsLoading(false);
  }, [range.start, range.end]);

  useEffect(() => {
    reload();
  }, [reload]);

  const metrics = useMemo<DashboardMetrics>(() => {
    if (rows.length === 0) {
      return { ...EMPTY, byDay: buildEmptyDays(range.start, range.end) };
    }

    let revenue = 0;
    const categoryMap = new Map<string, number>();
    const dayMap = new Map<string, number>();

    for (const row of rows) {
      const price = Number(row.price_charged) || 0;
      revenue += price;
      const categoryName =
        row.service?.category?.name ?? 'Sem categoria';
      categoryMap.set(
        categoryName,
        (categoryMap.get(categoryName) ?? 0) + price,
      );
      dayMap.set(
        row.appointment_date,
        (dayMap.get(row.appointment_date) ?? 0) + price,
      );
    }

    const byCategory: CategorySlice[] = Array.from(categoryMap.entries())
      .map(([category, value]) => ({ category, revenue: value }))
      .sort((a, b) => b.revenue - a.revenue);

    const byDay = buildEmptyDays(range.start, range.end).map((slot) => ({
      date: slot.date,
      revenue: dayMap.get(slot.date) ?? 0,
    }));

    return {
      revenue,
      count: rows.length,
      averageTicket: rows.length === 0 ? 0 : revenue / rows.length,
      byCategory,
      byDay,
    };
  }, [rows, range.start, range.end]);

  return { metrics, isLoading, error, reload };
}

function buildEmptyDays(start: string, end: string): DaySlice[] {
  const days: DaySlice[] = [];
  let cursor = start;
  let safety = 0;
  while (cursor <= end && safety < 400) {
    days.push({ date: cursor, revenue: 0 });
    cursor = shiftDay(cursor, 1);
    safety += 1;
  }
  return days;
}
