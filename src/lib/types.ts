export interface Category {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

export interface ServiceWithCategory extends Service {
  category: Pick<Category, 'id' | 'name'> | null;
}

export interface ServiceInput {
  name: string;
  category_id: string;
  duration_minutes: number;
  price: number;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Professional {
  id: string;
  name: string;
  is_active: boolean;
}

/** "HH:MM:SS" returned by Postgres `time` columns. */
export type TimeString = string;

export interface ProfessionalSchedule {
  id: string;
  professional_id: string;
  day_of_week: DayOfWeek;
  start_time: TimeString;
  end_time: TimeString;
  is_working: boolean;
}

export interface ProfessionalWithSchedules extends Professional {
  schedules: ProfessionalSchedule[];
}

export interface ScheduleInput {
  day_of_week: DayOfWeek;
  start_time: TimeString;
  end_time: TimeString;
  is_working: boolean;
}

export interface ProfessionalInput {
  name: string;
  is_active: boolean;
  schedules: ScheduleInput[];
}

export interface Client {
  id: string;
  full_name: string;
  whatsapp: string | null;
  birth_date: string | null;
  acquisition_channel: string | null;
  created_at: string;
}

export interface ClientInput {
  full_name: string;
  whatsapp: string | null;
  birth_date: string | null;
  acquisition_channel: string | null;
}
