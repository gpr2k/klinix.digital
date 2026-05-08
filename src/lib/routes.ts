import {
  CalendarDays,
  LayoutDashboard,
  Scissors,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface AppRoute {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const APP_ROUTES: readonly AppRoute[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/agenda', label: 'Agenda', icon: CalendarDays },
  { path: '/servicos', label: 'Serviços', icon: Scissors },
  { path: '/profissionais', label: 'Profissionais', icon: UserRound },
] as const;
