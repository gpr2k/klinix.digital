import { useEffect, useMemo, useState } from 'react';

const PRESET_CHANNELS = [
  'Google',
  'Instagram',
  'Indicação',
  'Facebook',
  'TikTok',
  'WhatsApp',
] as const;

const OTHER_OPTION = '__other__';

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function ChannelSelect({ value, onChange, disabled }: Props) {
  const isPreset = useMemo(
    () =>
      value !== null && (PRESET_CHANNELS as readonly string[]).includes(value),
    [value],
  );
  const startsCustom = value !== null && value !== '' && !isPreset;
  const [isCustom, setIsCustom] = useState(startsCustom);

  useEffect(() => {
    if (startsCustom) setIsCustom(true);
  }, [startsCustom]);

  const selectValue = isCustom ? OTHER_OPTION : (value ?? '');

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const next = event.target.value;
    if (next === OTHER_OPTION) {
      setIsCustom(true);
      onChange('');
    } else if (next === '') {
      setIsCustom(false);
      onChange(null);
    } else {
      setIsCustom(false);
      onChange(next);
    }
  };

  return (
    <div className="space-y-2">
      <select
        value={selectValue}
        onChange={handleSelectChange}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-50"
      >
        <option value="">Não informado</option>
        {PRESET_CHANNELS.map((channel) => (
          <option key={channel} value={channel}>
            {channel}
          </option>
        ))}
        <option value={OTHER_OPTION}>Outro…</option>
      </select>
      {isCustom ? (
        <input
          type="text"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Descreva o canal de aquisição"
          disabled={disabled}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
        />
      ) : null}
    </div>
  );
}
