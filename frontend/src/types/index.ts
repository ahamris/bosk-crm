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
  name_nl: string;
  name_en: string;
  name_ru: string;
  slug: string;
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
  name_nl: string;
  name_en: string;
  name_ru: string;
  description: string | null;
  duration_minutes: number;
  buffer_minutes: number;
  price_cents: number;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  preferred_contact: 'email' | 'phone' | 'sms' | 'whatsapp';
  source: string | null;
  date_of_birth: string | null;
  gender: string | null;
  locale: string | null;
  is_active: boolean;
  notes: string | null;
  medical_notes: string | null;
  skin_type: string | null;
  marketing_consent: boolean;
  avatar_url: string | null;
  total_visits: number;
  last_visit_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunicationLog {
  id: number;
  client_id: number;
  user_id: number;
  user?: User;
  type: 'call' | 'email' | 'sms' | 'whatsapp' | 'note' | 'walk_in';
  direction: 'incoming' | 'outgoing';
  subject: string | null;
  content: string | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: number;
  client_id: number;
  client?: Client;
  user_id: number;
  employee?: Employee;
  service_id: number;
  service?: Service;
  location_id: number;
  location?: Location;
  starts_at: string;
  ends_at: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  price_cents: number;
  cancelled_at: string | null;
  cancellation_reason: string | null;
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
  type: 'staff' | 'freelancer';
  avatar_url: string | null;
  is_active: boolean;
  reviews_count?: number;
  reviews_avg_rating?: number | null;
  working_hours?: WorkingHour[];
  created_at: string;
  updated_at: string;
}

export interface WorkingHour {
  id: number;
  user_id: number;
  location_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Review {
  id: number;
  location_id: number;
  client_id: number;
  client?: Client;
  appointment_id: number | null;
  employee_user_id: number;
  employee?: User;
  rating: number;
  comment: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStatsDay {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

export interface DashboardResponse {
  today: string;
  appointments_today: Appointment[];
  stats: {
    today: DashboardStatsDay;
    total_clients: number;
    revenue_today_cents: number;
    upcoming_7_days: number;
  };
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

export interface ClientNote {
  id: number;
  client_id: number;
  note: string;
  is_private: boolean;
  author?: User;
  created_at: string;
  updated_at: string;
}

export interface BookingSlot {
  employee_id: number;
  employee_name: string;
  start: string;
  end: string;
}

export interface Integration {
  id: number;
  provider: string;
  name: string;
  is_active: boolean;
  settings: Record<string, string>;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AvailableIntegration {
  provider: string;
  name: string;
  description: string;
  icon: string;
}

export interface Invoice {
  id: number;
  location_id: number;
  client_id: number;
  client?: Client;
  appointment_id: number | null;
  appointment?: Appointment;
  moneybird_invoice_id: string | null;
  invoice_number: string | null;
  status: 'draft' | 'open' | 'paid' | 'late';
  total_cents: number;
  tax_cents: number;
  currency: string;
  invoice_date: string;
  due_date: string;
  paid_at: string | null;
  lines?: InvoiceLine[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  id: number;
  invoice_id: number;
  service_id: number | null;
  service?: Service;
  description: string;
  quantity: number;
  price_cents: number;
  tax_rate: number;
  total_cents: number;
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
