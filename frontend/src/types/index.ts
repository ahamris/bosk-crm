export interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'employee';
  location_id: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  timezone: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
  services?: Service[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  category_id: number;
  category?: ServiceCategory;
  name: string;
  description: string | null;
  duration: number;
  buffer_time: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  notes: string | null;
  avatar_url: string | null;
  total_visits: number;
  last_visit_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  client_id: number;
  client?: Client;
  employee_id: number;
  employee?: Employee;
  service_id: number;
  service?: Service;
  location_id: number;
  location?: Location;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user_id: number;
  user?: User;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  working_hours?: WorkingHour[];
  created_at: string;
  updated_at: string;
}

export interface WorkingHour {
  id: number;
  employee_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface DashboardStats {
  todays_appointments: number;
  total_clients: number;
  revenue_today: number;
  upcoming_appointments: Appointment[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
