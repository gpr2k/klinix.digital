import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';

interface Props {
  allow: readonly UserRole[];
  /** Optional fallback rendered when the role is not allowed. */
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders `children` only when the current user's role is in `allow`. */
export function RoleGate({ allow, fallback = null, children }: Props) {
  const { user } = useAuth();
  const role = user?.role ?? null;
  if (role && allow.includes(role)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

export function useRole(): UserRole | null {
  const { user } = useAuth();
  return user?.role ?? null;
}
