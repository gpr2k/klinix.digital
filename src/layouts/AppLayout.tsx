import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

export function AppLayout() {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Auto-close drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-full bg-slate-50">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir navegação"
            className="rounded p-1 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-slate-900">
            Klinix.digital
          </span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
