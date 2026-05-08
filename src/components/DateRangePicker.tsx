interface Props {
  start: string;
  end: string;
  onChange: (range: { start: string; end: string }) => void;
}

export function DateRangePicker({ start, end, onChange }: Props) {
  return (
    <div className="flex items-end gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div>
        <label
          htmlFor="range-start"
          className="block text-[10px] font-medium uppercase tracking-wide text-slate-500"
        >
          De
        </label>
        <input
          id="range-start"
          type="date"
          value={start}
          max={end}
          onChange={(event) =>
            onChange({ start: event.target.value, end })
          }
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div>
        <label
          htmlFor="range-end"
          className="block text-[10px] font-medium uppercase tracking-wide text-slate-500"
        >
          Até
        </label>
        <input
          id="range-end"
          type="date"
          value={end}
          min={start}
          onChange={(event) =>
            onChange({ start, end: event.target.value })
          }
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
    </div>
  );
}
