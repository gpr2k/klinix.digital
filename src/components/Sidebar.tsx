import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { APP_ROUTES } from '@/lib/routes';

interface Props {
  /** When true, sidebar is rendered as a mobile drawer overlaid above content. */
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: Props) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden={!isMobileOpen}
        onClick={onCloseMobile}
        className={`fixed inset-0 z-30 bg-slate-900/50 transition-opacity lg:hidden ${
          isMobileOpen
            ? 'opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        aria-label="Navegação principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform lg:static lg:translate-x-0 lg:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              K
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">
                Klinix.digital
              </p>
              <p className="text-xs text-slate-500">CRM Clínica</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Fechar navegação"
            className="rounded p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {APP_ROUTES.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          v0.1.0
        </div>
      </aside>
    </>
  );
}
