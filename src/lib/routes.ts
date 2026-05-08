import {
  CalendarDays,
  LayoutDashboard,
  Scissors,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

export interface AppRoute {
  path: string;
  label: string;
  icon: LucideIcon;
  /** When set, route is hidden from sidebar unless current user role matches. */
  allowedRoles?: readonly UserRole[];
}

export const APP_ROUTES: readonly AppRoute[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/agenda', label: 'Agenda', icon: CalendarDays },
  { path: '/servicos', label: 'Serviços', icon: Scissors },
  { path: '/profissionais', label: 'Profissionais', icon: UserRound },
  {
    path: '/auditoria',
    label: 'Auditoria',
    icon: ShieldCheck,
    allowedRoles: ['ADMIN'],
  },
] as const;
