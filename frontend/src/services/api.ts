import axios from 'axios';
import type {
  User,
  Location,
  Service,
  ServiceCategory,
  Client,
  ClientNote,
  Appointment,
  Employee,
  WorkingHour,
  DashboardResponse,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
} from '../types';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export async function login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export async function register(payload: RegisterData): Promise<{ user: User; token: string }> {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data.user ?? data.data ?? data;
}

// Locations
export async function getLocations(): Promise<Location[]> {
  const { data } = await api.get('/locations');
  return data.data ?? data;
}

export async function createLocation(payload: Partial<Location>): Promise<Location> {
  const { data } = await api.post('/locations', payload);
  return data.data ?? data;
}

export async function updateLocation(id: number, payload: Partial<Location>): Promise<Location> {
  const { data } = await api.put(`/locations/${id}`, payload);
  return data.data ?? data;
}

// Services (location-scoped)
export async function getServices(locationId: number): Promise<Service[]> {
  const { data } = await api.get(`/locations/${locationId}/services`);
  return data.data ?? data;
}

export async function createService(locationId: number, payload: Partial<Service>): Promise<Service> {
  const { data } = await api.post(`/locations/${locationId}/services`, payload);
  return data.data ?? data;
}

export async function updateService(locationId: number, id: number, payload: Partial<Service>): Promise<Service> {
  const { data } = await api.put(`/locations/${locationId}/services/${id}`, payload);
  return data.data ?? data;
}

export async function deleteService(locationId: number, id: number): Promise<void> {
  await api.delete(`/locations/${locationId}/services/${id}`);
}

// Service Categories (not location-scoped)
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const { data } = await api.get('/service-categories');
  return data.data ?? data;
}

export async function createServiceCategory(payload: Partial<ServiceCategory>): Promise<ServiceCategory> {
  const { data } = await api.post('/service-categories', payload);
  return data.data ?? data;
}

// Clients (location-scoped)
export async function getClients(locationId: number, params?: { search?: string; page?: number }): Promise<PaginatedResponse<Client>> {
  const { data } = await api.get(`/locations/${locationId}/clients`, { params });
  return data;
}

export async function getClient(locationId: number, id: number): Promise<Client> {
  const { data } = await api.get(`/locations/${locationId}/clients/${id}`);
  return data.data ?? data;
}

export async function createClient(locationId: number, payload: Partial<Client>): Promise<Client> {
  const { data } = await api.post(`/locations/${locationId}/clients`, payload);
  return data.data ?? data;
}

export async function updateClient(locationId: number, id: number, payload: Partial<Client>): Promise<Client> {
  const { data } = await api.put(`/locations/${locationId}/clients/${id}`, payload);
  return data.data ?? data;
}

// Client Notes
export async function getClientNotes(locationId: number, clientId: number): Promise<ClientNote[]> {
  const { data } = await api.get(`/locations/${locationId}/clients/${clientId}/notes`);
  return data.data ?? data;
}

export async function createClientNote(locationId: number, clientId: number, payload: { note: string; is_private?: boolean }): Promise<ClientNote> {
  const { data } = await api.post(`/locations/${locationId}/clients/${clientId}/notes`, payload);
  return data.data ?? data;
}

export async function deleteClientNote(locationId: number, clientId: number, noteId: number): Promise<void> {
  await api.delete(`/locations/${locationId}/clients/${clientId}/notes/${noteId}`);
}

// Appointments (location-scoped)
export async function getAppointments(locationId: number, params?: {
  date?: string;
  employee_id?: number;
  status?: string;
}): Promise<Appointment[]> {
  const { data } = await api.get(`/locations/${locationId}/appointments`, { params });
  return data.data ?? data;
}

export async function createAppointment(locationId: number, payload: Partial<Appointment>): Promise<Appointment> {
  const { data } = await api.post(`/locations/${locationId}/appointments`, payload);
  return data.data ?? data;
}

export async function updateAppointment(locationId: number, id: number, payload: Partial<Appointment>): Promise<Appointment> {
  const { data } = await api.put(`/locations/${locationId}/appointments/${id}`, payload);
  return data.data ?? data;
}

export async function cancelAppointment(locationId: number, id: number): Promise<Appointment> {
  const { data } = await api.patch(`/locations/${locationId}/appointments/${id}/transition`, { status: 'cancelled' });
  return data.data ?? data;
}

export async function transitionAppointment(locationId: number, appointmentId: number, payload: { status: string; cancellation_reason?: string }): Promise<Appointment> {
  const { data } = await api.patch(`/locations/${locationId}/appointments/${appointmentId}/transition`, payload);
  return data.data ?? data;
}

// Public Booking (no auth)
export async function getBookingServices(locationId: number): Promise<Service[]> {
  const { data } = await api.get(`/booking/${locationId}/services`);
  return data.data ?? data;
}

export async function getBookingAvailability(locationId: number, params: { service_id: number; date: string; employee_id?: number }): Promise<{ slots: Array<{ time: string; employee_id: number; employee_name: string }> }> {
  const { data } = await api.get(`/booking/${locationId}/availability`, { params });
  return data;
}

export async function createBooking(locationId: number, payload: {
  service_id: number; employee_id: number; date: string; time: string;
  first_name: string; last_name: string; email: string; phone?: string; notes?: string;
}): Promise<Appointment> {
  const { data } = await api.post(`/booking/${locationId}/book`, payload);
  return data.data ?? data;
}

// Dashboard (not location-scoped)
export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get('/dashboard');
  return data.data ?? data;
}

// Employees (not location-scoped)
export async function getEmployees(): Promise<Employee[]> {
  const { data } = await api.get('/employees');
  return data.data ?? data;
}

export async function getEmployeeWorkingHours(employeeId: number): Promise<WorkingHour[]> {
  const { data } = await api.get(`/employees/${employeeId}/working-hours`);
  return data.data ?? data;
}

// Integrations
export async function getIntegrations() {
  const { data } = await api.get('/integrations');
  return data;
}

export async function getIntegration(provider: string) {
  const { data } = await api.get(`/integrations/${provider}`);
  return data;
}

export async function updateIntegration(provider: string, payload: { settings: Record<string, string>; is_active?: boolean }) {
  const { data } = await api.put(`/integrations/${provider}`, payload);
  return data;
}

export async function testIntegration(provider: string) {
  const { data } = await api.post(`/integrations/${provider}/test`);
  return data;
}

export async function syncMoneybirdContacts() {
  const { data } = await api.post('/integrations/moneybird/sync-contacts');
  return data;
}

export async function syncMoneybirdProducts() {
  const { data } = await api.post('/integrations/moneybird/sync-products');
  return data;
}

// Invoices
export async function getInvoices(locationId: number) {
  const { data } = await api.get(`/locations/${locationId}/invoices`);
  return data;
}

export async function createInvoiceFromAppointment(locationId: number, appointmentId: number) {
  const { data } = await api.post(`/locations/${locationId}/appointments/${appointmentId}/invoice`);
  return data;
}

export async function sendInvoice(locationId: number, invoiceId: number) {
  const { data } = await api.post(`/locations/${locationId}/invoices/${invoiceId}/send`);
  return data;
}

export async function markInvoicePaid(locationId: number, invoiceId: number) {
  const { data } = await api.post(`/locations/${locationId}/invoices/${invoiceId}/mark-paid`);
  return data;
}

export default api;
