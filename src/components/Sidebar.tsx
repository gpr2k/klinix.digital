import { NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { APP_ROUTES } from '@/lib/routes';

interface Props {
  /** When true, sidebar is rendered as a mobile drawer overlaid above content. */
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: Props) {
  const { user, signOut } = useAuth();
  const role = user?.role ?? null;

  const visibleRoutes = APP_ROUTES.filter((route) => {
    if (!route.allowedRoles) return true;
    if (!role) return false;
    return route.allowedRoles.includes(role);
  });

  const initials =
    (user?.name ?? user?.email ?? '?')
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

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
            {visibleRoutes.map(({ path, label, icon: Icon }) => (
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

        <div className="border-t border-slate-200 px-3 py-3">
          {user ? (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {initials}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {user.name ?? user.email ?? '—'}
                </p>
                <p className="truncate text-[10px] uppercase tracking-wide text-slate-500">
                  {role ?? 'sem perfil'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void signOut();
                }}
                aria-label="Sair"
                title="Sair"
                className="rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <p className="px-2 text-xs text-slate-500">v0.1.0</p>
          )}
        </div>
      </aside>
    </>
  );
}
