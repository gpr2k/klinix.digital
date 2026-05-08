import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';

interface Props {
  children: ReactNode;
  /** Optional list of roles required to render `children`. */
  allowedRoles?: readonly UserRole[];
}

export function AuthGuard({ children, allowedRoles }: Props) {
  const { isInitializing, session, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Carregando sessão…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = user?.role ?? null;
    if (!role || !allowedRoles.includes(role)) {
      return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-sm text-amber-800">
          <p className="font-semibold">Acesso restrito</p>
          <p className="mt-1">
            Esta área é exclusiva para administradores. Se você precisa de
            acesso, peça para um ADMIN promover seu usuário.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
