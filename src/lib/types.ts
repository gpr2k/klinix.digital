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
